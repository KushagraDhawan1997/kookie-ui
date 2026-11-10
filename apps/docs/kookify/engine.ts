import Matter from "matter-js";
// @ts-expect-error -- poly-decomp ships no types; Matter only needs its decomposition functions.
import decomp from "poly-decomp";
import * as THREE from "three";

import type { Sound } from "./sound";

/**
 * The Kookify engine. Stickers drop in from above the screen, fall, tumble and pile up at the
 * bottom of the viewport, with real 2D physics (matter-js) and Three.js drawing them on one
 * transparent canvas fixed over the page. The page scrolls behind the pile; the canvas never takes
 * the pointer. Input is read on window in the capture phase and only claimed when it lands on a
 * sticker's opaque pixels, so the page keeps its clicks and scroll.
 */

export type Engine = {
  slap(): void;
  clear(): Promise<void>;
  rescan(): void;
  dispose(): void;
};

type Art = {
  tex: THREE.Texture;
  w: number;
  h: number;
  alpha: Uint8ClampedArray;
  aw: number;
  ah: number;
  /** The outline of the die-cut, in art pixels, centred on the image's middle. */
  outline: { x: number; y: number }[];
};

/** The uniforms each material is made with, so setting them each frame needs no guesswork. */
type Uniforms<K extends string> = Record<K, THREE.IUniform>;
type StickerUniform = "uSize" | "uOpacity" | "uBlur" | "uFoil";
type ShadowUniform = "uSize" | "uOpacity" | "uSpread" | "uBias";

type Sticker = {
  art: Art;
  mesh: THREE.Mesh<THREE.PlaneGeometry, THREE.ShaderMaterial>;
  shadow: THREE.Mesh<THREE.PlaneGeometry, THREE.ShaderMaterial>;
  body: Matter.Body;
  /** Display size in px (the art scaled). */
  w: number;
  h: number;
  /** Where the image's middle sits relative to the body's centre of mass, unrotated. */
  ox: number;
  oy: number;
  z: number;
  /** When it joins the world, for the staggered drop. */
  dropAt: number;
  live: boolean;
  lift: number;
  flying: boolean;
  vx: number;
  vy: number;
  vr: number;
  x: number;
  y: number;
  angle: number;
  flyStart: number;
  /** The body's state before the last physics step, to draw between steps. */
  prevX: number;
  prevY: number;
  prevA: number;
};

/** How much of the viewport the pile fills, by area, when everything has settled. */
const PILE_FILL = 0.87;
const MAX_STICKERS = 80;
const DROP_MS = 700;
const HOLD_MS = 300;
const Z_STEP = 10;
const WALL = 400;
const MAX_SPEED = 26; // px per 1/60 s; under 7px per physics step at 240 steps a second
const IMPACT_SLAP = 4.5; // relative speed (px per step) above which a landing slaps
const IMPACT_KNOCK = 2;

const STICKER_VERT = /* glsl */ `
uniform vec2 uSize;
varying vec2 vUv;
varying vec2 vScreen;
void main() {
  vUv = uv;
  vec4 world = modelMatrix * vec4(position.xy * uSize, 0.0, 1.0);
  vScreen = vec2(world.x, -world.y);
  gl_Position = projectionMatrix * viewMatrix * world;
}
`;

/**
 * Holographic film. The art is printed on a pearly silver foil: rainbow bands and fine rays fan
 * out from the light, which sits at the pointer; the rays turn and pulse and particles ride them,
 * so the foil is alive even when the pointer is still. Dark ink covers the foil, so Kookie stays
 * clear; the border is bare film.
 */
const STICKER_FRAG = /* glsl */ `
uniform sampler2D uTex;
uniform float uOpacity;
uniform vec2 uBlur;
uniform vec2 uLight;
uniform float uTime;
uniform float uPhase;
uniform float uFoil;
varying vec2 vUv;
varying vec2 vScreen;

vec3 spectrum(float h) {
  // Pink, violet, cyan and yellow rather than a hard rainbow.
  return 0.5 + 0.5 * cos(6.2831853 * (h + vec3(0.0, 0.33, 0.67)));
}

float hash2(vec2 p) { return fract(sin(dot(p, vec2(127.1, 311.7))) * 43758.5453); }

vec3 foil(vec2 q, out float glint) {
  vec2 rel = q - uLight;
  float dist = length(rel);
  float sweep = dot(q, vec2(0.7071, 0.7071)) / 1100.0;
  float fan = atan(rel.y, rel.x) / 6.2831853;
  // Fine rays fanning out from the light, irregular like real film. They turn slowly,
  // flicker, and pulse outward.
  float turn = fan + uTime * 0.012;
  float wobble = 0.35 * sin(6.2831853 * (turn * 7.0 + uPhase + uTime * 0.05)) + 0.2 * sin(6.2831853 * turn * 19.0);
  float ray = pow(0.5 + 0.5 * sin(6.2831853 * (turn * 72.0 + wobble)), 10.0);
  ray *= 0.55 + 0.45 * sin(6.2831853 * (turn * 13.0 + uTime * 0.4 + uPhase));
  ray *= 0.6 + 0.4 * sin(dist / 140.0 - uTime * 2.0 + turn * 30.0);
  float streak = sin(6.2831853 * (sweep * 2.5 + turn * 4.0 + uPhase));
  glint = pow(max(0.0, 1.0 - dist / 650.0), 2.5);
  float metal = 0.84 + 0.06 * streak + 0.14 * ray + 0.14 * glint;
  // Whole turns of hue around the light, so the bands never break where the angle wraps.
  vec3 tint = spectrum(sweep * 3.0 + fan * 2.0 + ray * 0.12 + dist / 1600.0 + uPhase);
  vec3 film = metal * mix(vec3(1.0), tint, 0.4 + 0.3 * glint + 0.15 * ray);
  // Particles riding out along the rays, twinkling as they go.
  float rad = (dist - uTime * 60.0) / 22.0;
  vec2 pc = vec2(floor(turn * 240.0), floor(rad));
  float ph = hash2(pc);
  vec2 pf = vec2(fract(turn * 240.0), fract(rad)) - 0.5;
  float dotMask = smoothstep(0.5, 0.1, length(pf * vec2(1.0, 2.0)));
  float twinkle = 0.5 + 0.5 * sin(uTime * 7.0 + ph * 40.0);
  float particle = step(0.982, ph) * dotMask * twinkle * (1.0 - smoothstep(150.0, 900.0, dist));
  // And a fine scatter of specks across the film, each blinking on its own beat.
  float sh = hash2(floor(q / 1.5));
  float speck = step(0.9975, sh) * (0.5 + 0.5 * sin(uTime * 5.0 + sh * 60.0));
  return film + particle * (0.35 + 0.5 * glint) + speck * (0.2 + 0.5 * glint);
}

void main() {
  vec4 c;
  if (dot(uBlur, uBlur) > 1e-7) {
    c = vec4(0.0);
    for (int i = 0; i < 7; i++) {
      c += texture2D(uTex, vUv + uBlur * (float(i) / 6.0 - 0.5));
    }
    c /= 7.0;
  } else {
    c = texture2D(uTex, vUv);
    // At rest the die-cut edge is resolved to one screen pixel, however far the art is scaled.
    float edge = max(fwidth(c.a), 1e-4);
    float a = clamp((c.a - 0.5) / edge + 0.5, 0.0, 1.0);
    c *= a / max(c.a, 1e-4);
  }
  if (c.a < 0.004) discard;
  vec3 col = c.rgb / c.a;
  float glint;
  vec3 holo = foil(vScreen, glint);
  float lum = dot(col, vec3(0.299, 0.587, 0.114));
  float show = smoothstep(0.12, 0.85, lum) * min(uFoil, 1.25);
  col = mix(col, col * holo * 1.12, 0.85 * show) + glint * show * 0.12;
  gl_FragColor = vec4(min(col, 1.0) * c.a, c.a) * uOpacity;
}
`;

const SHADOW_VERT = /* glsl */ `
uniform vec2 uSize;
varying vec2 vUv;
void main() {
  vUv = (uv - 0.5) * 1.35 + 0.5;
  gl_Position = projectionMatrix * modelViewMatrix * vec4(position.xy * uSize * 1.35, 0.0, 1.0);
}
`;

const SHADOW_FRAG = /* glsl */ `
uniform sampler2D uTex;
uniform float uOpacity;
uniform vec2 uSpread;
uniform float uBias;
varying vec2 vUv;
void main() {
  float a = 0.0;
  for (int i = -1; i <= 1; i++) {
    for (int j = -1; j <= 1; j++) {
      vec2 q = vUv + uSpread * vec2(float(i), float(j));
      // Outside the art there is nothing to cast; clamped edge texels at coarse mips would.
      float inside = step(0.0, q.x) * step(q.x, 1.0) * step(0.0, q.y) * step(q.y, 1.0);
      a += texture2D(uTex, q, uBias).a * inside;
    }
  }
  a /= 9.0;
  gl_FragColor = vec4(0.0, 0.0, 0.0, a * uOpacity);
}
`;

const CSS = `
html.kookify-grab, html.kookify-grab * { cursor: grab !important; }
html.kookify-grabbing, html.kookify-grabbing * { cursor: grabbing !important; }
html.kookify-hold, html.kookify-hold * { -webkit-user-select: none !important; user-select: none !important; -webkit-touch-callout: none !important; }
`;

/** Kookify's own controls sit above the stickers and keep their clicks. */
const onUi = (e: Event) => e.target instanceof Element && !!e.target.closest("[data-kookify-ui]");

const rand = (a: number, b: number) => a + Math.random() * (b - a);
const clamp = (v: number, a: number, b: number) => Math.min(b, Math.max(a, v));

function shuffle<T>(list: T[]): T[] {
  const out = list.slice();
  for (let i = out.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    const swap = out[i] as T;
    out[i] = out[j] as T;
    out[j] = swap;
  }
  return out;
}

type Pt = { x: number; y: number };

/**
 * The die-cut's edge, traced around the opaque pixels (Moore neighbour tracing), so a sticker
 * collides on its real shape, concave bits included, rather than a hull that leaves gaps.
 */
function traceOutline(alpha: Uint8ClampedArray, aw: number, ah: number): Pt[] {
  const inside = (x: number, y: number) => x >= 0 && y >= 0 && x < aw && y < ah && (alpha[y * aw + x] ?? 0) > 128;
  let start: Pt | null = null;
  for (let y = 0; y < ah && !start; y++) for (let x = 0; x < aw; x++) if (inside(x, y)) { start = { x, y }; break; }
  if (!start) return [];
  // Clockwise on screen (y down): E, SE, S, SW, W, NW, N, NE.
  const dirs: Pt[] = [{ x: 1, y: 0 }, { x: 1, y: 1 }, { x: 0, y: 1 }, { x: -1, y: 1 }, { x: -1, y: 0 }, { x: -1, y: -1 }, { x: 0, y: -1 }, { x: 1, y: -1 }];
  const out: Pt[] = [start];
  let cur = start;
  let back = 4; // we arrived scanning from the west, which is outside
  for (let guard = 0; guard < aw * ah * 4; guard++) {
    let found = -1;
    for (let k = 1; k <= 8; k++) {
      const d = (back + k) % 8;
      const step = dirs[d]!;
      if (inside(cur.x + step.x, cur.y + step.y)) {
        found = d;
        break;
      }
    }
    if (found < 0) break;
    const step = dirs[found]!;
    const next = { x: cur.x + step.x, y: cur.y + step.y };
    // The neighbour checked just before the hit was outside; it is the new backtrack.
    const prev = dirs[(found + 7) % 8]!;
    const bx = cur.x + prev.x - next.x;
    const by = cur.y + prev.y - next.y;
    back = dirs.findIndex((d) => d.x === bx && d.y === by);
    cur = next;
    if (cur.x === start.x && cur.y === start.y) break;
    out.push(cur);
  }
  return out;
}

/**
 * Close narrow notches in a mask (dilate, then erode, by `r` cells). Gaps between legs or
 * letters are where two stickers' pieces would wedge into each other and stick; filled, the
 * outline still hugs the outer edge.
 */
function closeMask(alpha: Uint8ClampedArray, aw: number, ah: number, r: number): Uint8ClampedArray {
  const pass = (src: Uint8ClampedArray, grow: boolean) => {
    const tmp = new Uint8ClampedArray(src.length);
    const out = new Uint8ClampedArray(src.length);
    const pick = (a: number, b: number) => (grow ? Math.max(a, b) : Math.min(a, b));
    for (let y = 0; y < ah; y++) {
      for (let x = 0; x < aw; x++) {
        let v = grow ? 0 : 255;
        for (let k = -r; k <= r; k++) {
          const xx = x + k;
          v = pick(v, xx < 0 || xx >= aw ? 0 : (src[y * aw + xx] ?? 0));
        }
        tmp[y * aw + x] = v;
      }
    }
    for (let y = 0; y < ah; y++) {
      for (let x = 0; x < aw; x++) {
        let v = grow ? 0 : 255;
        for (let k = -r; k <= r; k++) {
          const yy = y + k;
          v = pick(v, yy < 0 || yy >= ah ? 0 : (tmp[yy * aw + x] ?? 0));
        }
        out[y * aw + x] = v;
      }
    }
    return out;
  };
  // Pad first so growing at the image edge has room, then crop back.
  const pad = r + 1;
  const pw = aw + pad * 2;
  const ph = ah + pad * 2;
  const padded = new Uint8ClampedArray(pw * ph);
  for (let y = 0; y < ah; y++) for (let x = 0; x < aw; x++) padded[(y + pad) * pw + x + pad] = alpha[y * aw + x] ?? 0;
  const save = { aw, ah };
  aw = pw;
  ah = ph;
  const closed = pass(pass(padded, true), false);
  const out = new Uint8ClampedArray(save.aw * save.ah);
  for (let y = 0; y < save.ah; y++) for (let x = 0; x < save.aw; x++) out[y * save.aw + x] = closed[(y + pad) * pw + x + pad] ?? 0;
  return out;
}

/** Ramer-Douglas-Peucker: drop points that sit within `eps` of the line through their neighbours. */
function simplify(points: Pt[], eps: number): Pt[] {
  if (points.length < 4) return points;
  const keep = new Uint8Array(points.length);
  keep[0] = 1;
  keep[points.length - 1] = 1;
  const stack: [number, number][] = [[0, points.length - 1]];
  while (stack.length) {
    const [a, b] = stack.pop()!;
    const pa = points[a]!;
    const pb = points[b]!;
    const len = Math.hypot(pb.x - pa.x, pb.y - pa.y) || 1;
    let far = -1;
    let dist = eps;
    for (let i = a + 1; i < b; i++) {
      const p = points[i]!;
      const d = Math.abs((pb.x - pa.x) * (pa.y - p.y) - (pa.x - p.x) * (pb.y - pa.y)) / len;
      if (d > dist) {
        dist = d;
        far = i;
      }
    }
    if (far >= 0) {
      keep[far] = 1;
      stack.push([a, far], [far, b]);
    }
  }
  return points.filter((_, i) => keep[i]);
}

async function loadArt(url: string, loader: THREE.TextureLoader, maxAnisotropy: number): Promise<Art> {
  const tex = await loader.loadAsync(url);
  // Sampled as stored and written as is: the custom shaders do no colour conversion, so tagging
  // the art as sRGB would decode it to linear and draw every sticker too dark.
  tex.colorSpace = THREE.NoColorSpace;
  tex.premultiplyAlpha = true;
  tex.anisotropy = maxAnisotropy;
  tex.needsUpdate = true;
  const img = tex.image as HTMLImageElement;
  const k = 128 / Math.max(img.width, img.height);
  const aw = Math.max(1, Math.round(img.width * k));
  const ah = Math.max(1, Math.round(img.height * k));
  const ctx = document.createElement("canvas").getContext("2d", { willReadFrequently: true })!;
  ctx.canvas.width = aw;
  ctx.canvas.height = ah;
  ctx.drawImage(img, 0, 0, aw, ah);
  const data = ctx.getImageData(0, 0, aw, ah).data;
  const alpha = new Uint8ClampedArray(aw * ah);
  for (let i = 0; i < alpha.length; i++) alpha[i] = data[i * 4 + 3] ?? 0;
  // The collision outline: the traced edge, simplified to within a pixel of the art, in art
  // pixels about the middle. Pixel centres sit half a pixel inside the edge; push them out.
  const traced = simplify(traceOutline(closeMask(alpha, aw, ah, 4), aw, ah), 1.2);
  const mx = traced.reduce((t, p) => t + p.x, 0) / (traced.length || 1);
  const my = traced.reduce((t, p) => t + p.y, 0) / (traced.length || 1);
  const outline = traced.map((p) => {
    const dx = p.x - mx;
    const dy = p.y - my;
    const l = Math.hypot(dx, dy) || 1;
    const x = p.x + 0.5 + (dx / l) * 0.5;
    const y = p.y + 0.5 + (dy / l) * 0.5;
    return { x: (x / aw - 0.5) * img.width, y: (y / ah - 0.5) * img.height };
  });
  return { tex, w: img.width, h: img.height, alpha, aw, ah, outline };
}

export async function createEngine(options: {
  stickers: string[];
  words?: string[] | undefined;
  reducedMotion: boolean;
  sound?: Sound | undefined;
}): Promise<Engine> {
  const { reducedMotion, sound } = options;
  const renderer = new THREE.WebGLRenderer({ alpha: true, antialias: true, premultipliedAlpha: true });
  renderer.setPixelRatio(Math.min(devicePixelRatio, 3));
  const loader = new THREE.TextureLoader();
  const anisotropy = renderer.capabilities.getMaxAnisotropy();
  const [arts, words] = await Promise.all([
    Promise.all(options.stickers.map((url) => loadArt(url, loader, anisotropy))),
    Promise.all((options.words ?? []).map((url) => loadArt(url, loader, anisotropy))),
  ]);

  renderer.setClearColor(0x000000, 0);
  const canvas = renderer.domElement;
  canvas.setAttribute("aria-hidden", "true");
  canvas.dataset.kookify = "";
  Object.assign(canvas.style, {
    position: "fixed",
    inset: "0",
    width: "100vw",
    height: "100dvh",
    pointerEvents: "none",
    zIndex: "2147483000",
  });
  document.body.appendChild(canvas);

  const style = document.createElement("style");
  style.textContent = CSS;
  document.head.appendChild(style);

  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(0, 1, 0, -1, 1, 2e6);
  camera.position.z = 1e6;

  // The light's centre sits on the pointer (or finger, or tilt). What moves on its own is the
  // rays and particles, driven by time.
  const light = { value: new THREE.Vector2(innerWidth * 0.5, innerHeight * 0.2) };
  const aim = new THREE.Vector2(innerWidth * 0.5, innerHeight * 0.2);
  const time = { value: 0 };

  // ---- Physics ------------------------------------------------------------------------------

  // A pile never goes perfectly still under strong gravity; let near-still stickers sleep, so the
  // heap is done in about a second instead of shivering. (Matter keeps this on the module.)
  const sleeping = Matter.Sleeping as unknown as { _motionSleepThreshold: number; _motionWakeThreshold: number };
  sleeping._motionSleepThreshold = 0.16;
  sleeping._motionWakeThreshold = 0.32;

  // Concave outlines are split into convex pieces by poly-decomp.
  Matter.Common.setDecomp(decomp);

  const world = Matter.Engine.create({ enableSleeping: true });
  world.gravity.y = 3.5;
  // A pile is the hard case for a 2D solver: extra iterations and half steps keep stacked
  // stickers from sinking into each other.
  world.positionIterations = 14;
  world.velocityIterations = 10;
  let walls: Matter.Body[] = [];

  /** Floor and side walls just outside the viewport; the top stays open for the drop. */
  function buildWalls() {
    if (walls.length) Matter.Composite.remove(world.world, walls);
    const W = innerWidth;
    const H = innerHeight;
    const opts = { isStatic: true, friction: 0.6, restitution: 0.1 };
    walls = [
      Matter.Bodies.rectangle(W / 2, H + WALL / 2, W + WALL * 2, WALL, opts),
      Matter.Bodies.rectangle(-WALL / 2, H / 2 - H, WALL, H * 4, opts),
      Matter.Bodies.rectangle(W + WALL / 2, H / 2 - H, WALL, H * 4, opts),
    ];
    Matter.Composite.add(world.world, walls);
    for (const s of stickers) Matter.Sleeping.set(s.body, false);
  }

  function resize() {
    renderer.setSize(innerWidth, innerHeight, false);
    camera.right = innerWidth;
    camera.bottom = -innerHeight;
    camera.updateProjectionMatrix();
    buildWalls();
  }

  const geometry = new THREE.PlaneGeometry(1, 1, 1, 1);
  let stickers: Sticker[] = [];
  let topZ = 0;
  let alive = true;

  function makeSticker(art: Art, x: number, y: number, size: number): Sticker {
    const k = size / Math.max(art.w, art.h);
    const w = art.w * k;
    const h = art.h * k;
    const verts = art.outline.map((p) => ({ x: p.x * k, y: p.y * k }));
    const centre = Matter.Vertices.centre(verts);
    const body = Matter.Bodies.fromVertices(x, y, [verts], {
      // Grippy and only a little bouncy, so a pile settles in about a second.
      friction: 0.8,
      frictionStatic: 1,
      frictionAir: 0.03,
      restitution: 0.04,
      density: 0.0015,
      slop: 0.5,
    });
    body.sleepThreshold = 30;
    Matter.Body.setAngle(body, rand(-0.6, 0.6));
    Matter.Body.setAngularVelocity(body, rand(-0.08, 0.08));
    Matter.Body.setVelocity(body, { x: rand(-2, 2), y: rand(0, 3) });
    const mesh = new THREE.Mesh(
      geometry,
      new THREE.ShaderMaterial({
        vertexShader: STICKER_VERT,
        fragmentShader: STICKER_FRAG,
        uniforms: {
          uTex: { value: art.tex },
          uSize: { value: new THREE.Vector2(w, h) },
          uOpacity: { value: 1 },
          uBlur: { value: new THREE.Vector2() },
          uLight: light,
          uTime: time,
          uPhase: { value: Math.random() * 0.4 },
          uFoil: { value: 1 },
        },
        transparent: true,
        premultipliedAlpha: true,
        depthWrite: false,
        depthTest: false,
      }),
    );
    const shadow = new THREE.Mesh(
      geometry,
      new THREE.ShaderMaterial({
        vertexShader: SHADOW_VERT,
        fragmentShader: SHADOW_FRAG,
        uniforms: {
          uTex: { value: art.tex },
          uSize: { value: new THREE.Vector2(w, h) },
          uOpacity: { value: 0.2 },
          uSpread: { value: new THREE.Vector2() },
          uBias: { value: 0 },
        },
        transparent: true,
        premultipliedAlpha: true,
        depthWrite: false,
        depthTest: false,
      }),
    );
    mesh.frustumCulled = false;
    shadow.frustumCulled = false;
    topZ += Z_STEP;
    // A fixed draw order, set here and on a grab only: no ties for the renderer to break
    // differently from one frame to the next.
    mesh.renderOrder = topZ;
    shadow.renderOrder = topZ - 1;
    return {
      art, mesh, shadow, body, w, h, ox: -centre.x, oy: -centre.y, z: topZ, dropAt: 0, live: false,
      lift: 0, flying: false, vx: 0, vy: 0, vr: 0, x, y, angle: body.angle, flyStart: 0,
      prevX: x, prevY: y, prevA: body.angle,
    };
  }

  function addToWorld(s: Sticker) {
    s.live = true;
    Matter.Composite.add(world.world, s.body);
    scene.add(s.shadow, s.mesh);
  }

  function removeSticker(s: Sticker) {
    if (s.live) Matter.Composite.remove(world.world, s.body);
    scene.remove(s.mesh, s.shadow);
    s.mesh.material.dispose();
    s.shadow.material.dispose();
    stickers = stickers.filter((o) => o !== s);
  }

  // The cover is made in two parts: most of the stickers drop at once, then a top-up adds a few
  // more until the settled pile reaches PILE_FILL of the screen. Piles of odd shapes pack
  // differently every time, so a fixed count would be too short one time and overflow the next.
  let fill: {
    base: number;
    lanes: number;
    order: number[];
    pool: Art[];
    wordPool: Art[];
    until: number;
    next: number;
  } | null = null;

  /** One more sticker, waiting above the screen in the next lane, dropping at `at`. */
  function queueSticker(at: number) {
    if (!fill) return;
    const W = innerWidth;
    // About one word to every four photos.
    const word = words.length > 0 && Math.random() < 0.2;
    if (!fill.pool.length) fill.pool = shuffle(arts);
    if (!fill.wordPool.length) fill.wordPool = shuffle(words);
    const art = word ? fill.wordPool.pop()! : fill.pool.pop()!;
    // Some variety, and now and then a hero.
    const hero = !word && Math.random() < 0.1;
    const size = fill.base * (word ? rand(1.2, 1.5) : hero ? rand(1.35, 1.6) : rand(0.8, 1.1));
    // Drop lanes, used in shuffled rounds, so stickers that drop close together in time drop far
    // apart in space; several wait per lane, stacked above the screen.
    if (!fill.order.length) fill.order = shuffle(Array.from({ length: fill.lanes }, (_, l) => l));
    const lane = fill.order.pop()!;
    const x = clamp(((lane + 0.5) / fill.lanes) * W + rand(-0.2, 0.2) * (W / fill.lanes), size * 0.5, W - size * 0.5);
    const s = makeSticker(art, x, -size * rand(0.7, 1.4), size);
    s.dropAt = at;
    stickers.push(s);
  }

  /** The top of the settled part of the pile, in viewport px (the floor if there is none). */
  function pileTop() {
    let top = innerHeight;
    for (const s of stickers) if (s.live && s.body.speed < 1.5) top = Math.min(top, s.body.bounds.min.y);
    return top;
  }

  function slap() {
    const W = innerWidth;
    const H = innerHeight;
    const base = clamp(Math.min(W, H) * 0.24, 120, 240);
    // Stickers pile loosely, so each one claims more room than its own area.
    const estimate = Math.round((W * H * PILE_FILL) / (0.8 * base * base));
    const now = performance.now();
    fill = {
      base,
      lanes: Math.max(2, Math.floor(W / (base * 1.2))),
      order: [],
      pool: [],
      wordPool: [],
      until: now + 3000,
      next: now + DROP_MS,
    };
    const first = Math.max(8, Math.round(estimate * 0.85));
    for (let i = 0; i < first; i++) queueSticker(now + (reducedMotion ? 0 : (i / first) * DROP_MS));
    if (reducedMotion) {
      // Appear already settled: drop and top up out of sight, then show the pile.
      stickers.forEach(addToWorld);
      for (let round = 0; round < 6; round++) {
        for (let i = 0; i < 240; i++) Matter.Engine.update(world, 1000 / 60);
        if (pileTop() <= H * (1 - PILE_FILL) || stickers.length >= MAX_STICKERS) break;
        const more = Math.max(2, Math.round(estimate * 0.1));
        for (let i = 0; i < more; i++) queueSticker(now);
        stickers.filter((s) => !s.live).forEach(addToWorld);
      }
      fill = null;
      sound?.slap();
    }
  }

  /** While filling, add a sticker every so often until the pile is tall enough. */
  function topUp(now: number) {
    if (!fill || now < fill.next) return;
    // Stop a little short: the last few are still in the air when the pile is judged.
    if (now > fill.until || stickers.length >= MAX_STICKERS || pileTop() <= innerHeight * (1 - PILE_FILL + 0.05)) {
      if (now > fill.until || stickers.length >= MAX_STICKERS) fill = null;
      return;
    }
    // Judge the height only once nothing is still waiting to drop.
    if (stickers.some((s) => !s.live && !s.flying)) return;
    // Over the top already: stop.
    if (pileTop() < innerHeight * 0.05) {
      fill = null;
      return;
    }
    queueSticker(now);
    queueSticker(now + 30);
    fill.next = now + 90;
  }

  function clear(): Promise<void> {
    fill = null;
    release();
    if (reducedMotion || !stickers.length) {
      stickers.slice().forEach(removeSticker);
      return Promise.resolve();
    }
    sound?.whoosh();
    const now = performance.now();
    for (const s of stickers) {
      if (!s.live) {
        removeSticker(s);
        continue;
      }
      // Off the physics, out of the window: away from the middle, fast.
      Matter.Composite.remove(world.world, s.body);
      s.live = false;
      s.flying = true;
      s.flyStart = now;
      const dx = s.x - innerWidth / 2;
      const dy = s.y - innerHeight / 2;
      const len = Math.hypot(dx, dy) || 1;
      const speed = rand(2.6, 3.6);
      s.vx = (dx / len) * speed;
      s.vy = (dy / len) * speed;
      s.vr = rand(-0.012, 0.012);
    }
    return new Promise((resolve) => setTimeout(resolve, 520));
  }

  // Thin parts (a letter, a paw) can pass through each other at full falling speed, so nothing
  // moves faster than a fall the solver can still catch.
  Matter.Events.on(world, "beforeUpdate", () => {
    for (const s of stickers) {
      if (!s.live || s.body.isSleeping) continue;
      const v = s.body.velocity;
      const sp = Math.hypot(v.x, v.y);
      if (sp > MAX_SPEED) Matter.Body.setVelocity(s.body, { x: (v.x / sp) * MAX_SPEED, y: (v.y / sp) * MAX_SPEED });
      if (Math.abs(s.body.angularVelocity) > 0.25) Matter.Body.setAngularVelocity(s.body, Math.sign(s.body.angularVelocity) * 0.25);
    }
  });

  // ---- Sound on impact ---------------------------------------------------------------------

  Matter.Events.on(world, "collisionStart", (event) => {
    for (const pair of event.pairs) {
      const a = pair.bodyA;
      const b = pair.bodyB;
      const speed = Math.hypot(a.velocity.x - b.velocity.x, a.velocity.y - b.velocity.y);
      if (a.isStatic || b.isStatic) {
        if (speed > IMPACT_SLAP) sound?.slap();
      } else if (speed > IMPACT_KNOCK) {
        sound?.knock();
      }
    }
  });

  // ---- Input -------------------------------------------------------------------------------

  /** Topmost sticker whose opaque pixels are under a viewport point. */
  function hitTest(cx: number, cy: number): Sticker | null {
    const ordered = stickers.filter((s) => s.live).sort((a, b) => b.z - a.z);
    for (const s of ordered) {
      const cos = Math.cos(-s.angle);
      const sin = Math.sin(-s.angle);
      const dx = cx - s.x;
      const dy = cy - s.y;
      const lx = dx * cos - dy * sin;
      const ly = dx * sin + dy * cos;
      const u = lx / s.w + 0.5;
      const v = ly / s.h + 0.5;
      if (u < 0 || u >= 1 || v < 0 || v >= 1) continue;
      const a = s.art.alpha[Math.floor(v * s.art.ah) * s.art.aw + Math.floor(u * s.art.aw)] ?? 0;
      if (a > 60) return s;
    }
    return null;
  }

  type Held = { s: Sticker; joint: Matter.Constraint };
  let held: Held | null = null;
  let suppressClick = false;
  let suppressTimer = 0;
  let hovering = false;

  /** Swallow the click that follows a grab, but only that one: it never outlives the gesture. */
  function eatNextClick() {
    suppressClick = true;
    clearTimeout(suppressTimer);
    suppressTimer = window.setTimeout(() => (suppressClick = false), 400);
  }

  /** A spring from the pointer to the point grabbed, so the sticker follows, shoves, and throws. */
  function grab(s: Sticker, cx: number, cy: number) {
    const b = s.body;
    const local = Matter.Vector.rotate({ x: cx - b.position.x, y: cy - b.position.y }, -b.angle);
    const joint = Matter.Constraint.create({
      pointA: { x: cx, y: cy },
      bodyB: b,
      pointB: Matter.Vector.rotate(local, b.angle),
      stiffness: 0.25,
      damping: 0.1,
      length: 0,
    });
    Matter.Composite.add(world.world, joint);
    Matter.Sleeping.set(b, false);
    topZ += Z_STEP;
    s.z = topZ;
    s.mesh.renderOrder = topZ;
    s.shadow.renderOrder = topZ - 1;
    held = { s, joint };
    sound?.pat();
    document.documentElement.classList.add("kookify-grabbing");
  }

  function move(cx: number, cy: number) {
    if (!held) return;
    held.joint.pointA = { x: cx, y: cy };
    Matter.Sleeping.set(held.s.body, false);
  }

  function release() {
    if (!held) return;
    Matter.Composite.remove(world.world, held.joint);
    // A hard throw is capped so it can't tunnel through the walls.
    const v = held.s.body.velocity;
    const sp = Math.hypot(v.x, v.y);
    if (sp > MAX_SPEED) Matter.Body.setVelocity(held.s.body, { x: (v.x / sp) * MAX_SPEED, y: (v.y / sp) * MAX_SPEED });
    held = null;
    document.documentElement.classList.remove("kookify-grabbing");
  }

  function onPointerDown(e: PointerEvent) {
    sound?.resume();
    if (e.pointerType === "touch" || e.button !== 0 || onUi(e)) return;
    const s = hitTest(e.clientX, e.clientY);
    if (!s) return;
    e.preventDefault();
    e.stopPropagation();
    eatNextClick();
    grab(s, e.clientX, e.clientY);
  }

  function onPointerMove(e: PointerEvent) {
    aim.set(e.clientX, e.clientY);
    if (e.pointerType === "touch") return;
    if (held) return move(e.clientX, e.clientY);
    // Only touch the page's classes when the answer changes: a class on <html> restyles the page.
    const over = !onUi(e) && !!hitTest(e.clientX, e.clientY);
    if (over !== hovering) {
      hovering = over;
      document.documentElement.classList.toggle("kookify-grab", over);
    }
  }

  function onPointerUp(e: PointerEvent) {
    if (e.pointerType === "touch" || !held) return;
    release();
  }

  function onClick(e: MouseEvent) {
    if (!suppressClick || onUi(e)) return;
    suppressClick = false;
    e.preventDefault();
    e.stopPropagation();
  }

  // Touch: a swipe scrolls as usual; holding still on a sticker for HOLD_MS picks it up.
  let pending: { s: Sticker; x: number; y: number; timer: number } | null = null;
  let touching = false;

  function cancelPending() {
    if (!pending) return;
    clearTimeout(pending.timer);
    pending = null;
    if (!held) document.documentElement.classList.remove("kookify-hold");
  }

  function onTouchStart(e: TouchEvent) {
    cancelPending();
    touching = true;
    const t = e.touches[0];
    if (t) aim.set(t.clientX, t.clientY);
    if (!t || e.touches.length !== 1 || held || onUi(e)) return;
    const s = hitTest(t.clientX, t.clientY);
    if (!s) return;
    document.documentElement.classList.add("kookify-hold");
    pending = {
      s,
      x: t.clientX,
      y: t.clientY,
      timer: window.setTimeout(() => {
        if (!pending) return;
        const p = pending;
        pending = null;
        if (!stickers.includes(p.s) || !p.s.live) return;
        navigator.vibrate?.(8);
        grab(p.s, p.x, p.y);
      }, HOLD_MS),
    };
  }

  function onTouchMove(e: TouchEvent) {
    const t = e.touches[0];
    if (t) aim.set(t.clientX, t.clientY);
    if (held && t) {
      e.preventDefault();
      move(t.clientX, t.clientY);
      return;
    }
    if (pending && t && Math.hypot(t.clientX - pending.x, t.clientY - pending.y) > 10) cancelPending();
  }

  function onTouchEnd(e: TouchEvent) {
    cancelPending();
    touching = e.touches.length > 0;
    if (!held) return;
    e.preventDefault();
    eatNextClick();
    release();
    document.documentElement.classList.remove("kookify-hold");
  }

  function onContextMenu(e: Event) {
    if (pending || held) e.preventDefault();
  }

  // Phones: tilt leans gravity and moves the light, unless a finger is down.
  function onTilt(e: DeviceOrientationEvent) {
    if (e.beta == null || e.gamma == null) return;
    const gx = clamp(e.gamma / 45, -1, 1);
    const gy = clamp((e.beta - 20) / 45, -0.4, 1);
    world.gravity.x = gx * 3.5;
    world.gravity.y = Math.max(1, gy * 3.5);
    if (!touching) aim.set(innerWidth * (0.5 + gx * 0.7), innerHeight * (0.5 + clamp((e.beta - 45) / 35, -1, 1) * 0.7));
    for (const s of stickers) if (s.live) Matter.Sleeping.set(s.body, false);
  }

  const capture = { capture: true } as const;
  const active = { capture: true, passive: false } as const;
  addEventListener("pointerdown", onPointerDown, capture);
  addEventListener("pointermove", onPointerMove, capture);
  addEventListener("pointerup", onPointerUp, capture);
  addEventListener("pointercancel", onPointerUp, capture);
  addEventListener("click", onClick, capture);
  addEventListener("touchstart", onTouchStart, active);
  addEventListener("touchmove", onTouchMove, active);
  addEventListener("touchend", onTouchEnd, active);
  addEventListener("touchcancel", onTouchEnd, active);
  addEventListener("contextmenu", onContextMenu, capture);
  addEventListener("resize", resize);
  addEventListener("deviceorientation", onTilt);

  // ---- Frame -------------------------------------------------------------------------------

  let last = performance.now();
  let acc = 0;
  const STEP = 1000 / 240;

  function frame() {
    if (!alive) return;
    requestAnimationFrame(frame);
    const now = performance.now();
    const dt = Math.min(48, now - last);
    last = now;

    topUp(now);
    // Drop each sticker on time, unless the space above the screen is still occupied; then it
    // waits a moment, so no two are ever born inside each other.
    for (const s of stickers) {
      if (s.live || s.flying || now < s.dropAt) continue;
      const others = stickers.filter((o) => o.live).map((o) => o.body);
      if (Matter.Query.collides(s.body, others).length) s.dropAt = now + 20;
      else addToWorld(s);
    }

    // Fixed steps, so the pile behaves the same at 60 and 120 Hz.
    acc += dt;
    while (acc >= STEP) {
      for (const s of stickers) {
        if (!s.live) continue;
        s.prevX = s.body.position.x;
        s.prevY = s.body.position.y;
        s.prevA = s.body.angle;
      }
      Matter.Engine.update(world, STEP);
      acc -= STEP;
    }
    // Draw between the last two physics states. A display's frames rarely line up with the
    // fixed steps (a 120 Hz screen gets one step, then two), and drawing the raw state then
    // makes every moving sticker judder.
    const between = acc / STEP;

    for (const s of stickers.slice()) {
      let blurX = 0;
      let blurY = 0;
      if (s.flying) {
        const age = now - s.flyStart;
        const accel = 1 + age / 220;
        s.x += s.vx * dt * accel;
        s.y += s.vy * dt * accel;
        s.angle += s.vr * dt;
        const cos = Math.cos(-s.angle);
        const sin = Math.sin(-s.angle);
        const vx = s.vx * accel;
        const vy = s.vy * accel;
        const bx = ((vx * cos - vy * sin) * 14) / s.w;
        const by = (-(vx * sin + vy * cos) * 14) / s.h;
        const bl = Math.hypot(bx, by);
        const cap = bl > 0.09 ? 0.09 / bl : 1;
        blurX = bx * cap;
        blurY = by * cap;
        const off = s.x < -s.w || s.x > innerWidth + s.w || s.y < -s.h || s.y > innerHeight + s.h || age > 1400;
        if (off) {
          removeSticker(s);
          continue;
        }
      } else if (s.live) {
        const b = s.body;
        // A sticker that slipped out of the box (a very hard throw) is put back in from the top.
        if (b.position.y > innerHeight + 200 || b.position.x < -200 || b.position.x > innerWidth + 200) {
          Matter.Body.setPosition(b, { x: innerWidth / 2, y: -s.h });
          Matter.Body.setVelocity(b, { x: 0, y: 0 });
        }
        // Where the image's middle is: the body's centre plus the art's offset, rotated.
        const bx = s.prevX + (b.position.x - s.prevX) * between;
        const by = s.prevY + (b.position.y - s.prevY) * between;
        const ba = s.prevA + (b.angle - s.prevA) * between;
        const off = Matter.Vector.rotate({ x: s.ox, y: s.oy }, ba);
        s.x = bx + off.x;
        s.y = by + off.y;
        s.angle = ba;
        const isHeld = held?.s === s;
        s.lift += ((isHeld ? 1 : 0) - s.lift) * (1 - Math.exp(-dt / 40));
      } else {
        // Waiting to drop: out of sight above the screen.
        s.mesh.visible = false;
        s.shadow.visible = false;
        continue;
      }
      s.mesh.visible = true;
      s.shadow.visible = true;

      const u = s.mesh.material.uniforms as Uniforms<StickerUniform>;
      u.uBlur.value.set(blurX, blurY);
      // A held sticker catches the light more.
      u.uFoil.value = 1 + 0.4 * s.lift;
      s.mesh.position.set(s.x, -s.y, s.z);
      s.mesh.rotation.z = -s.angle;

      const blurPx = 5 + 18 * s.lift;
      const offset = 3 + 16 * s.lift;
      const su = s.shadow.material.uniforms as Uniforms<ShadowUniform>;
      su.uOpacity.value = 0.18 + 0.08 * s.lift;
      su.uSpread.value.set((blurPx * 0.5) / (s.w * 1.35), (blurPx * 0.5) / (s.h * 1.35));
      su.uBias.value = Math.min(1.5, Math.log2(Math.max(1, blurPx / 2)));
      s.shadow.position.set(s.x + offset * 0.25, -(s.y + offset), s.z - 1);
      s.shadow.rotation.z = -s.angle;
    }

    // The light eases onto its aim in about 50ms; rays and particles keep their own time, and
    // reduced motion holds them still.
    light.value.lerp(aim, 1 - Math.exp(-dt / 50));
    if (!reducedMotion) time.value += dt / 1000;
    renderer.render(scene, camera);
  }

  resize();
  requestAnimationFrame(frame);

  // Dev-only window into sticker placement, for automated checks of grabs at known points.
  if (process.env.NODE_ENV === "development") {
    (window as unknown as { __kookifyArts?: unknown }).__kookifyArts = () =>
      [...arts, ...words].map((a) => {
        const poly = a.outline.map((p) => [p.x, p.y]);
        decomp.makeCCW(poly);
        return { n: a.outline.length, simple: decomp.isSimple(poly), pieces: decomp.quickDecomp(poly).length };
      });
    // How far stickers sink into each other: the deepest overlap and how many pairs exceed 2px.
    (window as unknown as { __kookifyOverlap?: unknown }).__kookifyOverlap = () => {
      const bodies = stickers.filter((s) => s.live).map((s) => s.body);
      let deepest = 0;
      let over = 0;
      const where: number[][] = [];
      for (let i = 0; i < bodies.length; i++) {
        for (let j = i + 1; j < bodies.length; j++) {
          let pair = 0;
          for (const pa of bodies[i]!.parts.slice(1)) {
            for (const pb of bodies[j]!.parts.slice(1)) {
              const c = Matter.Collision.collides(pa, pb);
              if (c) pair = Math.max(pair, c.depth);
            }
          }
          deepest = Math.max(deepest, pair);
          if (pair > 2) {
            over++;
            where.push([Math.round(bodies[i]!.position.x), Math.round(bodies[i]!.position.y), Math.round(pair)]);
          }
        }
      }
      return { deepest: Math.round(deepest * 10) / 10, over, where };
    };
    (window as unknown as { __kookify?: unknown }).__kookify = () =>
      stickers
        .filter((s) => s.live)
        .map((s) => ({ x: s.x, y: s.y, rot: s.angle, z: s.z, w: s.w, h: s.h, asleep: s.body.isSleeping, parts: s.body.parts.length - 1, speed: s.body.speed, motion: s.body.motion }));
  }

  return {
    slap,
    clear,
    rescan() {},
    dispose() {
      alive = false;
      cancelPending();
      clearTimeout(suppressTimer);
      removeEventListener("pointerdown", onPointerDown, capture);
      removeEventListener("pointermove", onPointerMove, capture);
      removeEventListener("pointerup", onPointerUp, capture);
      removeEventListener("pointercancel", onPointerUp, capture);
      removeEventListener("click", onClick, capture);
      removeEventListener("touchstart", onTouchStart, active);
      removeEventListener("touchmove", onTouchMove, active);
      removeEventListener("touchend", onTouchEnd, active);
      removeEventListener("touchcancel", onTouchEnd, active);
      removeEventListener("contextmenu", onContextMenu, capture);
      removeEventListener("resize", resize);
      removeEventListener("deviceorientation", onTilt);
      document.documentElement.classList.remove("kookify-grab", "kookify-grabbing", "kookify-hold");
      stickers.slice().forEach(removeSticker);
      Matter.World.clear(world.world, false);
      Matter.Engine.clear(world);
      geometry.dispose();
      [...arts, ...words].forEach((a) => a.tex.dispose());
      renderer.dispose();
      // Give the GL context back now; browsers cap how many a page may hold.
      renderer.forceContextLoss();
      canvas.remove();
      style.remove();
    },
  };
}
