'use client';

import * as React from 'react';
import { useThree } from '@react-three/fiber';
import { AmbientLight, DirectionalLight, Mesh, MeshStandardMaterial, PerspectiveCamera, PMREMGenerator, Scene, SphereGeometry, WebGLRenderer } from 'three';
import { RoomEnvironment } from 'three/examples/jsm/environments/RoomEnvironment.js';
import { Box, Flex, Text } from '@kushagradhawan/kookie-ui';

export type MaterialDef = { id: string; name: string; color: string; roughness: number; metalness: number; emissive?: string; opacity?: number };

export const MATERIALS: MaterialDef[] = [
  { id: 'clay', name: 'Clay', color: '#d4d4d4', roughness: 0.6, metalness: 0 },
  { id: 'chalk', name: 'Chalk', color: '#f4f1ea', roughness: 0.95, metalness: 0 },
  { id: 'plastic-red', name: 'Red plastic', color: '#e5484d', roughness: 0.35, metalness: 0 },
  { id: 'plastic-blue', name: 'Blue plastic', color: '#0090ff', roughness: 0.35, metalness: 0 },
  { id: 'rubber', name: 'Rubber', color: '#2b2b2b', roughness: 0.9, metalness: 0 },
  { id: 'wood', name: 'Wood', color: '#9a6a3c', roughness: 0.7, metalness: 0 },
  { id: 'gold', name: 'Gold', color: '#e8b64c', roughness: 0.25, metalness: 1 },
  { id: 'copper', name: 'Copper', color: '#c9774b', roughness: 0.3, metalness: 1 },
  { id: 'chrome', name: 'Chrome', color: '#e6e8ea', roughness: 0.08, metalness: 1 },
  { id: 'jade', name: 'Jade', color: '#30a46c', roughness: 0.2, metalness: 0.1 },
  { id: 'glass', name: 'Glass', color: '#bfe3ff', roughness: 0.05, metalness: 0, opacity: 0.45 },
  { id: 'neon', name: 'Neon', color: '#ff3d9a', roughness: 0.4, metalness: 0, emissive: '#ff3d9a' },
];

export const materialById = (id: string | undefined) => MATERIALS.find((m) => m.id === id) ?? MATERIALS[0];

/** The props a meshStandardMaterial takes for a material. */
export function materialProps(def: MaterialDef) {
  return {
    color: def.color,
    roughness: def.roughness,
    metalness: def.metalness,
    emissive: def.emissive ?? '#000000',
    emissiveIntensity: def.emissive ? 0.6 : 0,
    transparent: def.opacity !== undefined,
    opacity: def.opacity ?? 1,
  };
}

/**
 * One sphere per material, rendered once to a picture on a single offscreen renderer: a grid of
 * live canvases would be a WebGL context each.
 */
function useThumbnails(size: number) {
  const [thumbs, setThumbs] = React.useState<Record<string, string>>({});
  React.useEffect(() => {
    const px = size * Math.min(2, window.devicePixelRatio || 1);
    const renderer = new WebGLRenderer({ antialias: true, alpha: true, preserveDrawingBuffer: true });
    renderer.setSize(px, px, false);
    const scene = new Scene();
    // A room to reflect, so metals and glass read as themselves rather than black.
    const pmrem = new PMREMGenerator(renderer);
    const room = pmrem.fromScene(new RoomEnvironment(), 0.04);
    scene.environment = room.texture;
    scene.environmentIntensity = ENVIRONMENT_INTENSITY;
    scene.add(new AmbientLight('#ffffff', 0.6));
    const key = new DirectionalLight('#ffffff', 1.4);
    key.position.set(2, 3, 4);
    scene.add(key);
    const camera = new PerspectiveCamera(30, 1, 0.1, 10);
    camera.position.set(0, 0, 3.6);
    const geometry = new SphereGeometry(0.85, 48, 32);
    const material = new MeshStandardMaterial();
    scene.add(new Mesh(geometry, material));
    const next: Record<string, string> = {};
    for (const def of MATERIALS) {
      material.setValues(materialProps(def));
      material.needsUpdate = true;
      renderer.render(scene, camera);
      next[def.id] = renderer.domElement.toDataURL('image/png');
    }
    setThumbs(next);
    geometry.dispose();
    material.dispose();
    room.dispose();
    pmrem.dispose();
    renderer.dispose();
    renderer.forceContextLoss();
  }, [size]);
  return thumbs;
}

const ENVIRONMENT_INTENSITY = 0.4;

/** The same room for the editor's scene, so a material looks in the scene as it does in the pane. */
export function RoomLight() {
  const gl = useThree((s) => s.gl);
  const scene = useThree((s) => s.scene);
  const invalidate = useThree((s) => s.invalidate);
  React.useEffect(() => {
    const pmrem = new PMREMGenerator(gl);
    const room = pmrem.fromScene(new RoomEnvironment(), 0.04);
    scene.environment = room.texture;
    scene.environmentIntensity = ENVIRONMENT_INTENSITY;
    invalidate();
    return () => {
      scene.environment = null;
      room.dispose();
      pmrem.dispose();
    };
  }, [gl, scene, invalidate]);
  return null;
}

const SPHERE_PX = 72;

type GridProps = {
  /** A tap on a sphere. */
  onPick: (id: string) => void;
  /** A sphere dropped at a point on the screen. */
  onDrop: (id: string, clientX: number, clientY: number) => void;
};

/**
 * The materials, a grid of spheres. A tap applies one to the selection; a drag carries it onto an
 * object. A sideways swipe scrolls the row instead.
 */
export function MaterialsGrid({ onPick, onDrop }: GridProps) {
  const thumbs = useThumbnails(SPHERE_PX);
  const [ghost, setGhost] = React.useState<{ id: string; x: number; y: number } | null>(null);
  const sphereDrag = React.useRef<{ id: string; x0: number; y0: number; moved: boolean } | null>(null);

  const sphereHandlers = (id: string) => ({
    onPointerDown: (e: React.PointerEvent) => {
      sphereDrag.current = { id, x0: e.clientX, y0: e.clientY, moved: false };
      // Keep the pointer, so a drag that leaves the sphere at once still reports here (a touch
      // does this anyway; a mouse does not). A vertical swipe on a touch screen still scrolls.
      (e.currentTarget as HTMLElement).setPointerCapture(e.pointerId);
    },
    onPointerMove: (e: React.PointerEvent) => {
      const d = sphereDrag.current;
      if (!d) return;
      if (!d.moved) {
        const dx = e.clientX - d.x0;
        const dy = e.clientY - d.y0;
        if (Math.hypot(dx, dy) < 8) return;
        if (Math.abs(dx) > Math.abs(dy)) {
          sphereDrag.current = null;
          return;
        }
        d.moved = true;
      }
      setGhost({ id, x: e.clientX, y: e.clientY });
    },
    onPointerUp: (e: React.PointerEvent) => {
      const d = sphereDrag.current;
      sphereDrag.current = null;
      setGhost(null);
      if (!d) return;
      if (d.moved) onDrop(id, e.clientX, e.clientY);
      else onPick(id);
    },
    onPointerCancel: () => {
      sphereDrag.current = null;
      setGhost(null);
    },
  });

  return (
    <>
      {/* One row of spheres that scrolls sideways; the pane never grows. */}
      <Flex gap="3" px="3" align="center" height="100%" style={{ overflowX: 'auto', overflowY: 'hidden', touchAction: 'pan-x', scrollbarWidth: 'none', paddingBottom: 'env(safe-area-inset-bottom)' }}>
        {MATERIALS.map((m) => (
          <Box key={m.id} asChild>
            <button
              type="button"
              aria-label={m.name}
              {...sphereHandlers(m.id)}
              style={{ all: 'unset', cursor: 'pointer', display: 'grid', justifyItems: 'center', gap: 4, flexShrink: 0, touchAction: 'pan-x' }}
            >
              {thumbs[m.id] ? <img src={thumbs[m.id]} alt="" width={SPHERE_PX} height={SPHERE_PX} draggable={false} /> : <Box width={`${SPHERE_PX}px`} height={`${SPHERE_PX}px`} />}
              <Text size="1" emphasis="medium">
                {m.name}
              </Text>
            </button>
          </Box>
        ))}
      </Flex>
      {ghost && thumbs[ghost.id] ? (
        <img src={thumbs[ghost.id]} alt="" width={56} height={56} style={{ position: 'fixed', left: ghost.x, top: ghost.y, transform: 'translate(-50%, -110%)', pointerEvents: 'none', zIndex: 10 }} />
      ) : null}
    </>
  );
}
