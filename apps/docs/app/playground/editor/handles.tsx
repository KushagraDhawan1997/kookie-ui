'use client';

import * as React from 'react';
import { useFrame } from '@react-three/fiber';
import { Line } from '@react-three/drei';
import { Box3, Group, Mesh, Object3D, PerspectiveCamera, Vector3 } from 'three';
import { AXES, AXIS_COLOR, frameOf, layoutFor, ringTurn, type Axis, type Mode } from './transform';

const X = new Vector3(1, 0, 0);
const SEGMENT: [number, number, number][] = [
  [0, 0, 0],
  [1, 0, 0],
];
const CIRCLE: [number, number, number][] = Array.from({ length: 65 }, (_, i) => {
  const a = (i / 64) * Math.PI * 2;
  return [Math.cos(a), Math.sin(a), 0];
});

/**
 * The active mode's handles on the selected object. They are laid out every frame from the object
 * and the camera, so they keep one size on screen at any zoom and follow the object while it drags.
 * They draw over everything, so an object never hides its own handles.
 */
export function Handles({ targets, mode }: { targets: () => Object3D[]; mode: Mode }) {
  const arms = React.useRef<Record<Axis, Group | null>>({ x: null, y: null, z: null });
  const knobs = React.useRef<Record<Axis, Group | null>>({ x: null, y: null, z: null });
  const rings = React.useRef<Record<Axis, Group | null>>({ x: null, y: null, z: null });
  const turns = React.useMemo(() => ({ x: ringTurn('x'), y: ringTurn('y'), z: ringTurn('z') }), []);

  useFrame(({ camera, size }) => {
    const frame = frameOf(targets(), mode);
    if (!frame) return;
    const layout = layoutFor(frame, camera as PerspectiveCamera, size.height);
    for (const axis of AXES) {
      const dir = layout.dirs[axis];
      const arm = arms.current[axis];
      if (arm) {
        arm.position.copy(layout.center).addScaledVector(dir, layout.armStart);
        arm.quaternion.setFromUnitVectors(X, dir);
        arm.scale.setScalar(layout.knobDistance - layout.armStart);
      }
      const knob = knobs.current[axis];
      if (knob) {
        knob.position.copy(layout.center).addScaledVector(dir, layout.knobDistance);
        knob.quaternion.copy(frame.quaternion);
        knob.scale.setScalar(layout.knobRadius);
      }
      const ring = rings.current[axis];
      if (ring) {
        ring.position.copy(layout.center);
        ring.quaternion.copy(turns[axis]);
        ring.scale.setScalar(layout.ringRadius);
      }
    }
  });

  return (
    <group renderOrder={10}>
      {AXES.map((axis) =>
        mode === 'rotate' ? (
          <group key={axis} ref={(g) => void (rings.current[axis] = g)}>
            <Line points={CIRCLE} color={AXIS_COLOR[axis]} lineWidth={3} depthTest={false} transparent renderOrder={10} />
          </group>
        ) : (
          <React.Fragment key={axis}>
            <group ref={(g) => void (arms.current[axis] = g)}>
              <Line points={SEGMENT} color={AXIS_COLOR[axis]} lineWidth={3} depthTest={false} transparent renderOrder={10} />
            </group>
            <group ref={(g) => void (knobs.current[axis] = g)}>
              <mesh renderOrder={11}>
                {mode === 'scale' ? <boxGeometry args={[1.6, 1.6, 1.6]} /> : <sphereGeometry args={[1, 20, 12]} />}
                <meshBasicMaterial color={AXIS_COLOR[axis]} depthTest={false} transparent />
              </mesh>
            </group>
          </React.Fragment>
        ),
      )}
    </group>
  );
}

const SELECTION = '#3d5afe';
/** Corner ticks run this share of each edge. */
const TICK = 0.22;

/** The 12 edges of a box, and three ticks out of each of its 8 corners, as line segment pairs. */
function boxLines(box: Box3) {
  const { min, max } = box;
  const corners = [0, 1, 2, 3, 4, 5, 6, 7].map((i) => new Vector3(i & 1 ? max.x : min.x, i & 2 ? max.y : min.y, i & 4 ? max.z : min.z));
  const edges: Vector3[] = [];
  const ticks: Vector3[] = [];
  for (let i = 0; i < 8; i++) {
    for (const bit of [1, 2, 4]) {
      const j = i ^ bit;
      if (j > i) edges.push(corners[i], corners[j]);
      ticks.push(corners[i], corners[i].clone().lerp(corners[j], TICK));
    }
  }
  return { edges, ticks };
}

/**
 * The selection mark: the object's own box, a faint outline with firm corner ticks. It reads the
 * same on every shape, where outlined edges are noise on a sphere and missing on text, and it
 * shows the extent being scaled. It follows the object's transform every frame, so it rides along
 * with a drag.
 */
export function SelectionBox({ target }: { target: () => Object3D | undefined }) {
  const group = React.useRef<Group>(null);
  const [box, setBox] = React.useState<Box3 | null>(null);

  useFrame(() => {
    const object = target();
    const g = group.current;
    if (!(object instanceof Mesh) || !g) return;
    object.updateMatrixWorld();
    g.matrix.copy(object.matrixWorld);
    // Text lays out its geometry after the first frame, so keep reading until a box appears.
    const geometry = object.geometry;
    if (!geometry.boundingBox) geometry.computeBoundingBox();
    const next = geometry.boundingBox;
    if (next && !next.isEmpty() && !(box && box.equals(next))) setBox(next.clone());
  });

  const lines = React.useMemo(() => (box ? boxLines(box) : null), [box]);

  return (
    <group ref={group} matrixAutoUpdate={false}>
      {lines ? (
        <>
          <Line points={lines.edges} segments color={SELECTION} lineWidth={1} transparent opacity={0.45} depthTest={false} renderOrder={9} />
          <Line points={lines.ticks} segments color={SELECTION} lineWidth={2.5} depthTest={false} transparent renderOrder={9} />
        </>
      ) : null}
    </group>
  );
}
