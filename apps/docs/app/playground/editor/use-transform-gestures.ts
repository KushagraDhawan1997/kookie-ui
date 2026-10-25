import * as React from 'react';
import type { RootState } from '@react-three/fiber';
import type { Object3D, PerspectiveCamera } from 'three';
import { createDrag, hitTest, TAP_SLOP, type Axis, type Mode } from './transform';

export type DragResult = { mode: Mode; axis: Axis | null; text: string; x: number; y: number };

type Options = {
  surface: React.RefObject<HTMLElement | null>;
  three: React.RefObject<(() => RootState) | null>;
  object: React.RefObject<Object3D | null>;
  mode: Mode;
  snap: boolean;
  /** Each drag, as it moves; the readout follows the finger without a React render. */
  onMove(text: string, x: number, y: number): void;
  onStart(): void;
  /** A finished drag: one undo step. */
  onCommit(result: DragResult): void;
  onCancel(): void;
};

/**
 * One finger on a handle or the selected object transforms it; anywhere else it orbits. Two
 * fingers are always the camera: a second finger cancels the drag and hands both to the orbit
 * controls, so a pinch over the object zooms and never scales it.
 *
 * The listeners sit on the canvas's parent in the capture phase, so they decide before the orbit
 * controls on the canvas see the touch. A touch they keep never reaches the orbit controls.
 */
export function useTransformGestures(options: Options) {
  const latest = React.useRef(options);
  latest.current = options;

  React.useEffect(() => {
    const surface = latest.current.surface.current;
    if (!surface) return;
    const pointers = new Set<number>();
    let gesture: {
      id: number;
      x0: number;
      y0: number;
      last: { clientX: number; clientY: number };
      target: NonNullable<ReturnType<typeof hitTest>>;
      drag: ReturnType<typeof createDrag> | null;
      text: string | null;
    } | null = null;
    let swallowClick = false;

    const local = (e: PointerEvent) => {
      const rect = surface.getBoundingClientRect();
      return { x: e.clientX - rect.left, y: e.clientY - rect.top, size: { width: rect.width, height: rect.height } };
    };

    const end = () => {
      if (gesture && surface.hasPointerCapture(gesture.id)) surface.releasePointerCapture(gesture.id);
      gesture = null;
    };

    const onPointerDown = (e: PointerEvent) => {
      pointers.add(e.pointerId);
      swallowClick = false;
      const get = latest.current.three.current;
      if (!get) return;

      if (gesture) {
        // A second finger: undo the drag and give the first finger to the orbit controls, which
        // never saw it go down. This event then reaches them as the second.
        const first = gesture;
        if (first.drag) {
          first.drag.revert();
          latest.current.onCancel();
        }
        end();
        get().gl.domElement.dispatchEvent(
          new PointerEvent('pointerdown', {
            bubbles: true,
            cancelable: true,
            pointerId: first.id,
            pointerType: e.pointerType,
            isPrimary: true,
            button: 0,
            buttons: 1,
            clientX: first.last.clientX,
            clientY: first.last.clientY,
          }),
        );
        get().invalidate();
        return;
      }
      // Only touches on the canvas itself; the readout and anything else over it keep their own.
      if (pointers.size > 1 || e.button !== 0 || !(e.target instanceof HTMLCanvasElement)) return;

      const object = latest.current.object.current;
      if (!object) return;
      const { x, y, size } = local(e);
      const target = hitTest(x, y, object, get().camera as PerspectiveCamera, size, latest.current.mode);
      if (!target) return;

      e.stopPropagation();
      surface.setPointerCapture(e.pointerId);
      gesture = { id: e.pointerId, x0: x, y0: y, last: e, target, drag: null, text: null };
      swallowClick = true;
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!gesture || e.pointerId !== gesture.id) return;
      e.stopPropagation();
      gesture.last = e;
      const get = latest.current.three.current;
      const object = latest.current.object.current;
      if (!get || !object) return;
      const { x, y, size } = local(e);
      if (!gesture.drag) {
        if (Math.hypot(x - gesture.x0, y - gesture.y0) < TAP_SLOP) return;
        // The drag counts from here, so the object keeps its distance from the finger.
        gesture.drag = createDrag(object, gesture.target, latest.current.mode, x, y, get().camera as PerspectiveCamera, size);
        latest.current.onStart();
      }
      const text = gesture.drag.update(x, y, latest.current.snap);
      if (text !== null) {
        gesture.text = text;
        latest.current.onMove(text, x, y);
      }
      get().invalidate();
    };

    const onPointerUp = (e: PointerEvent) => {
      pointers.delete(e.pointerId);
      if (!gesture || e.pointerId !== gesture.id) return;
      e.stopPropagation();
      const { drag, text } = gesture;
      const { x, y } = local(e);
      end();
      if (drag && text !== null) latest.current.onCommit({ mode: latest.current.mode, axis: drag.axis, text, x, y });
      else if (drag) {
        drag.revert();
        latest.current.onCancel();
      }
      latest.current.three.current?.().invalidate();
    };

    const onPointerCancel = (e: PointerEvent) => {
      pointers.delete(e.pointerId);
      if (!gesture || e.pointerId !== gesture.id) return;
      gesture.drag?.revert();
      if (gesture.drag) latest.current.onCancel();
      end();
      latest.current.three.current?.().invalidate();
    };

    // A kept touch still ends in a click; it must not reach the canvas as a tap on the background.
    const onClick = (e: MouseEvent) => {
      if (!swallowClick) return;
      swallowClick = false;
      e.stopPropagation();
    };

    const capture = { capture: true };
    surface.addEventListener('pointerdown', onPointerDown, capture);
    surface.addEventListener('pointermove', onPointerMove, capture);
    surface.addEventListener('pointerup', onPointerUp, capture);
    surface.addEventListener('pointercancel', onPointerCancel, capture);
    surface.addEventListener('click', onClick, capture);
    return () => {
      surface.removeEventListener('pointerdown', onPointerDown, capture);
      surface.removeEventListener('pointermove', onPointerMove, capture);
      surface.removeEventListener('pointerup', onPointerUp, capture);
      surface.removeEventListener('pointercancel', onPointerCancel, capture);
      surface.removeEventListener('click', onClick, capture);
    };
  }, []);
}
