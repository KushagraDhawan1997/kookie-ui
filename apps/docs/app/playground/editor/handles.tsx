'use client';

import * as React from 'react';
import { useFrame } from '@react-three/fiber';
import { Line } from '@react-three/drei';
import { Group, Object3D, PerspectiveCamera, Quaternion, Vector3 } from 'three';
import { AXES, AXIS_COLOR, layoutFor, ringTurn, type Axis, type Mode } from './transform';

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
export function Handles({ target, mode }: { target: React.RefObject<Object3D | null>; mode: Mode }) {
  const arms = React.useRef<Record<Axis, Group | null>>({ x: null, y: null, z: null });
  const knobs = React.useRef<Record<Axis, Group | null>>({ x: null, y: null, z: null });
  const rings = React.useRef<Record<Axis, Group | null>>({ x: null, y: null, z: null });
  const turns = React.useMemo(() => ({ x: ringTurn('x'), y: ringTurn('y'), z: ringTurn('z') }), []);

  useFrame(({ camera, size }) => {
    const object = target.current;
    if (!object) return;
    const layout = layoutFor(object, camera as PerspectiveCamera, size.height, mode);
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
        knob.quaternion.copy(mode === 'scale' ? object.quaternion : new Quaternion());
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
