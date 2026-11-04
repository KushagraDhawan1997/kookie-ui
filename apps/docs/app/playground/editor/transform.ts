import { Box3, MathUtils, Matrix4, Object3D, PerspectiveCamera, Plane, Quaternion, Raycaster, Sphere, Vector2, Vector3 } from 'three';

export type Mode = 'move' | 'rotate' | 'scale';
export type Axis = 'x' | 'y' | 'z';
export const AXES: Axis[] = ['x', 'y', 'z'];
export const AXIS_COLOR: Record<Axis, string> = { x: '#e5484d', y: '#30a46c', z: '#0090ff' };

/** A pointer that moves less than this is a tap, not a drag. */
export const TAP_SLOP = 8;
/** One scene unit is 100 mm: a new cube is 100 mm on a side. */
export const MM_PER_UNIT = 100;
export const SNAP = { move: 0.1, rotate: MathUtils.degToRad(15), scale: 0.1 };

// Handle sizes in screen pixels, so they read the same at any zoom.
const ARM_GAP_PX = 6;
const ARM_PX = 44;
const KNOB_PX = 9;
const RING_GAP_PX = 30;
// Reach past the visible shape on every side, so the touch target is at least 44 px wide.
const HIT_PX = 22;

const UNIT: Record<Axis, Vector3> = { x: new Vector3(1, 0, 0), y: new Vector3(0, 1, 0), z: new Vector3(0, 0, 1) };
// For the ring around each axis, two directions in its plane, in the order that keeps it right-handed.
const RING_BASIS: Record<Axis, [Axis, Axis]> = { x: ['y', 'z'], y: ['z', 'x'], z: ['x', 'y'] };

export type Layout = {
  center: Vector3;
  /** Handle directions: the world axes, or the object's own axes while scaling. */
  dirs: Record<Axis, Vector3>;
  armStart: number;
  knobDistance: number;
  knobRadius: number;
  ringRadius: number;
};

/**
 * What the handles wrap: one object around its own origin, or several around the centre of their
 * shared box. One object scales along its own axes; anything else works along the world's.
 */
export type Frame = { center: Vector3; radius: number; quaternion: Quaternion };

export function frameOf(objects: Object3D[], mode: Mode): Frame | null {
  if (objects.length === 0) return null;
  const box = new Box3();
  for (const object of objects) box.expandByObject(object);
  const sphere = box.getBoundingSphere(new Sphere());
  if (objects.length === 1) {
    const center = objects[0].getWorldPosition(new Vector3());
    return {
      center,
      radius: box.isEmpty() ? 0.5 : sphere.center.distanceTo(center) + sphere.radius,
      quaternion: mode === 'scale' ? objects[0].quaternion.clone() : new Quaternion(),
    };
  }
  return { center: box.getCenter(new Vector3()), radius: sphere.radius, quaternion: new Quaternion() };
}

/** Where the handles sit around a frame seen through this camera. */
export function layoutFor(frame: Frame, camera: PerspectiveCamera, heightPx: number): Layout {
  const { center, radius, quaternion: turn } = frame;
  const unitsPerPx = (2 * camera.position.distanceTo(center) * Math.tan(MathUtils.degToRad(camera.fov / 2))) / heightPx;
  return {
    center,
    dirs: { x: UNIT.x.clone().applyQuaternion(turn), y: UNIT.y.clone().applyQuaternion(turn), z: UNIT.z.clone().applyQuaternion(turn) },
    armStart: radius + ARM_GAP_PX * unitsPerPx,
    knobDistance: radius + ARM_PX * unitsPerPx,
    knobRadius: KNOB_PX * unitsPerPx,
    ringRadius: radius + RING_GAP_PX * unitsPerPx,
  };
}

/** The turn that lays a unit circle drawn in the XY plane around a world axis. */
export function ringTurn(axis: Axis) {
  const [u, v] = RING_BASIS[axis];
  return new Quaternion().setFromRotationMatrix(new Matrix4().makeBasis(UNIT[u], UNIT[v], UNIT[axis]));
}

export type Target = { kind: 'object'; index: number } | { kind: 'handle'; axis: Axis };
type Size = { width: number; height: number };

function toScreen(point: Vector3, camera: PerspectiveCamera, size: Size) {
  const p = point.clone().project(camera);
  return new Vector2(((p.x + 1) / 2) * size.width, ((1 - p.y) / 2) * size.height);
}

function rayAt(x: number, y: number, camera: PerspectiveCamera, size: Size) {
  const raycaster = new Raycaster();
  raycaster.setFromCamera(new Vector2((x / size.width) * 2 - 1, -(y / size.height) * 2 + 1), camera);
  return raycaster;
}

/** Which of these objects is under (x, y), nearest first; -1 for none. */
export function pick(x: number, y: number, objects: Object3D[], camera: PerspectiveCamera, size: Size) {
  const hit = rayAt(x, y, camera, size).intersectObjects(objects, true)[0];
  if (!hit) return -1;
  return objects.findIndex((object) => {
    let o: Object3D | null = hit.object;
    while (o && o !== object) o = o.parent;
    return o === object;
  });
}

/** Whether a point in the scene lands inside a rectangle on screen. */
export function onScreenIn(point: Vector3, rect: { left: number; top: number; right: number; bottom: number }, camera: PerspectiveCamera, size: Size) {
  const p = toScreen(point, camera, size);
  return p.x >= rect.left && p.x <= rect.right && p.y >= rect.top && p.y <= rect.bottom;
}

/** What a touch at (x, y) lands on: a handle first, then a selected object. Null is anywhere else. */
export function hitTest(x: number, y: number, objects: Object3D[], camera: PerspectiveCamera, size: Size, mode: Mode): Target | null {
  const frame = frameOf(objects, mode);
  if (!frame) return null;
  const layout = layoutFor(frame, camera, size.height);
  const finger = new Vector2(x, y);
  let best: { axis: Axis; distance: number } | null = null;
  for (const axis of AXES) {
    let distance: number;
    let reach: number;
    if (mode === 'rotate') {
      const [u, v] = RING_BASIS[axis];
      distance = Infinity;
      for (let i = 0; i < 48; i++) {
        const a = (i / 48) * Math.PI * 2;
        const point = layout.center
          .clone()
          .addScaledVector(UNIT[u], Math.cos(a) * layout.ringRadius)
          .addScaledVector(UNIT[v], Math.sin(a) * layout.ringRadius);
        distance = Math.min(distance, toScreen(point, camera, size).distanceTo(finger));
      }
      reach = HIT_PX;
    } else {
      const knob = layout.center.clone().addScaledVector(layout.dirs[axis], layout.knobDistance);
      distance = toScreen(knob, camera, size).distanceTo(finger);
      reach = KNOB_PX + HIT_PX;
    }
    if (distance <= reach && (!best || distance < best.distance)) best = { axis, distance };
  }
  if (best) return { kind: 'handle', axis: best.axis };
  const index = pick(x, y, objects, camera, size);
  return index >= 0 ? { kind: 'object', index } : null;
}

/** Along the line through `origin` in `dir`, the point nearest the ray under the finger. */
function alongLine(origin: Vector3, dir: Vector3, x: number, y: number, camera: PerspectiveCamera, size: Size) {
  const ray = rayAt(x, y, camera, size).ray;
  const b = dir.dot(ray.direction);
  const denom = 1 - b * b;
  // The line points straight at the eye: no drag along it can be read.
  if (denom < 1e-4) return null;
  const w = origin.clone().sub(ray.origin);
  return (b * ray.direction.dot(w) - dir.dot(w)) / denom;
}

function onGround(height: number, x: number, y: number, camera: PerspectiveCamera, size: Size) {
  return rayAt(x, y, camera, size).ray.intersectPlane(new Plane(new Vector3(0, 1, 0), -height), new Vector3());
}

const snapTo = (value: number, step: number, on: boolean) => (on ? Math.round(value / step) * step : value);
const signed = (value: number, digits = 0) => `${value > 0 ? '+' : value < 0 ? '−' : ''}${Math.abs(value).toFixed(digits)}`;
const mm = (units: number) => signed(units * MM_PER_UNIT);
const deg = (radians: number) => `${signed(MathUtils.radToDeg(radians))}°`;

export type Start = { position: Vector3; quaternion: Quaternion; scale: Vector3 };

/**
 * One drag, from the point it crossed the tap slop. Every move is measured from that point, so the
 * objects keep their distance from the finger and never jump to it.
 *
 * The drag moves a stand-in at the frame's centre, then carries every object by the stand-in's
 * change, so several objects turn and scale as one unit around their shared centre. For a single
 * object the stand-in is the object's own transform, so nothing is approximated.
 *
 * `constrain` locks proportions when scaling and holds rotation to 15° steps, snapping or not.
 */
export function createDrag(objects: Object3D[], target: Target, mode: Mode, x0: number, y0: number, camera: PerspectiveCamera, size: Size, constrain: boolean) {
  const frame = frameOf(objects, mode)!;
  const object = new Object3D();
  if (objects.length === 1) {
    object.position.copy(objects[0].position);
    object.quaternion.copy(objects[0].quaternion);
    object.scale.copy(objects[0].scale);
  } else {
    object.position.copy(frame.center);
  }
  object.updateMatrix();
  const standInStart = object.matrix.clone().invert();
  const objectStarts = objects.map((o) => {
    o.updateMatrix();
    return o.matrix.clone();
  });
  const start: Start = { position: object.position.clone(), quaternion: object.quaternion.clone(), scale: object.scale.clone() };
  const layout = layoutFor(frame, camera, size.height);
  const axis = target.kind === 'handle' ? target.axis : null;
  const dir = axis ? layout.dirs[axis] : null;
  const t0 = dir ? alongLine(start.position, dir, x0, y0, camera, size) : null;
  const ground0 = onGround(start.position.y, x0, y0, camera, size);
  const center = toScreen(start.position, camera, size);
  let angle = 0;
  let previous = Math.atan2(y0 - center.y, x0 - center.x);

  function carry() {
    object.updateMatrix();
    const change = object.matrix.clone().multiply(standInStart);
    objects.forEach((o, i) => new Matrix4().multiplyMatrices(change, objectStarts[i]).decompose(o.position, o.quaternion, o.scale));
  }

  function update(x: number, y: number, snap: boolean) {
    const text = place(x, y, snap);
    carry();
    return text;
  }

  function place(x: number, y: number, snap: boolean): string | null {
    object.position.copy(start.position);
    object.quaternion.copy(start.quaternion);
    object.scale.copy(start.scale);

    if (mode === 'move') {
      if (axis && dir && t0 !== null) {
        const t = alongLine(start.position, dir, x, y, camera, size);
        if (t === null) return null;
        const delta = snapTo(t - t0, SNAP.move, snap);
        object.position.addScaledVector(dir, delta);
        return `${mm(delta)} mm ${axis.toUpperCase()}`;
      }
      const ground = onGround(start.position.y, x, y, camera, size);
      if (!ground || !ground0) return null;
      const dx = snapTo(ground.x - ground0.x, SNAP.move, snap);
      const dz = snapTo(ground.z - ground0.z, SNAP.move, snap);
      object.position.x += dx;
      object.position.z += dz;
      return `X ${mm(dx)} · Z ${mm(dz)} mm`;
    }

    if (mode === 'rotate') {
      let turn: number;
      let around: Vector3;
      if (axis) {
        // Follow the finger around the object's centre on screen, unwrapping past half a turn.
        const now = Math.atan2(y - center.y, x - center.x);
        let step = now - previous;
        if (step > Math.PI) step -= Math.PI * 2;
        if (step < -Math.PI) step += Math.PI * 2;
        previous = now;
        angle += step;
        around = UNIT[axis];
        // Screen angles run clockwise; an axis facing the eye turns counter-clockwise.
        const facing = around.dot(camera.position.clone().sub(start.position)) > 0;
        turn = facing ? -angle : angle;
      } else {
        around = UNIT.y;
        turn = MathUtils.degToRad((x - x0) * 0.5);
      }
      turn = snapTo(turn, SNAP.rotate, snap || constrain);
      object.quaternion.premultiply(new Quaternion().setFromAxisAngle(around, turn));
      return `${deg(turn)} ${(axis ?? 'y').toUpperCase()}`;
    }

    if (axis && dir && t0 !== null && t0 > 0) {
      const t = alongLine(start.position, dir, x, y, camera, size);
      if (t === null) return null;
      const factor = Math.max(SNAP.scale, snapTo(t / t0, SNAP.scale, snap));
      if (constrain) {
        object.scale.multiplyScalar(factor);
        return `×${factor.toFixed(2)}`;
      }
      object.scale[axis] = start.scale[axis] * factor;
      return `×${factor.toFixed(2)} ${axis.toUpperCase()}`;
    }
    // Up or right grows, down or left shrinks.
    const factor = Math.max(SNAP.scale, snapTo(Math.exp((x - x0 - (y - y0)) / 200), SNAP.scale, snap));
    object.scale.copy(start.scale).multiplyScalar(factor);
    return `×${factor.toFixed(2)}`;
  }

  function revert() {
    object.position.copy(start.position);
    object.quaternion.copy(start.quaternion);
    object.scale.copy(start.scale);
    carry();
  }

  return { update, revert, axis };
}
