import * as React from 'react';
import type { RootState } from '@react-three/fiber';
import type { Object3D, PerspectiveCamera } from 'three';
import { createDrag, hitTest, onScreenIn, pick, TAP_SLOP, type Axis, type Mode } from './transform';

export type DragResult = { mode: Mode; axis: Axis | null; text: string; x: number; y: number };
export type DragKind = 'object' | 'handle' | 'box';
type Entry = { id: number; object: Object3D };

/** A press held this long without moving opens the context menu. iOS never fires `contextmenu`. */
const LONG_PRESS_MS = 500;

type Options = {
  surface: React.RefObject<HTMLElement | null>;
  three: React.RefObject<(() => RootState) | null>;
  /** The selected objects, and every object in the scene. */
  selection(): Entry[];
  scene(): Entry[];
  mode: Mode;
  snap: boolean;
  /** Shift, latched: taps add and remove, a drag on empty space draws a selection box, handles constrain. */
  shift: boolean;
  /** The selection box while it is drawn, in the surface's pixels. */
  box: React.RefObject<HTMLElement | null>;
  onStart(kind: DragKind): void;
  /** Each drag, as it moves; the readout follows the finger without a React render. */
  onMove(text: string, x: number, y: number): void;
  /** A finished drag: one undo step. */
  onCommit(result: DragResult): void;
  onCancel(): void;
  /** A tap under Shift, on an object or (null) on empty space. */
  onToggle(id: number | null): void;
  /** A finished selection box: the objects whose centres it holds. */
  onBox(ids: number[]): void;
  onLongPress(id: number | null, x: number, y: number): void;
};

/**
 * One finger on a handle or a selected object transforms the selection; anywhere else it orbits,
 * or draws a selection box under Shift. Two fingers are always the camera: a second finger cancels
 * whatever the first was doing and hands both to the orbit controls, so a pinch over the selection
 * zooms and never scales it.
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
      kind: 'transform' | 'box';
      target: ReturnType<typeof hitTest>;
      drag: ReturnType<typeof createDrag> | null;
      moved: boolean;
      text: string | null;
    } | null = null;
    let press: { id: number; x: number; y: number; timer: number } | null = null;
    let swallowClick = false;

    const local = (e: { clientX: number; clientY: number }) => {
      const rect = surface.getBoundingClientRect();
      return { x: e.clientX - rect.left, y: e.clientY - rect.top, size: { width: rect.width, height: rect.height } };
    };

    const camera = () => latest.current.three.current?.().camera as PerspectiveCamera | undefined;
    const invalidate = () => latest.current.three.current?.().invalidate();

    const clearPress = () => {
      if (press) window.clearTimeout(press.timer);
      press = null;
    };

    const drawBox = (x: number, y: number) => {
      const box = latest.current.box.current;
      if (!box || !gesture) return null;
      const rect = { left: Math.min(gesture.x0, x), top: Math.min(gesture.y0, y), right: Math.max(gesture.x0, x), bottom: Math.max(gesture.y0, y) };
      Object.assign(box.style, { display: 'block', left: `${rect.left}px`, top: `${rect.top}px`, width: `${rect.right - rect.left}px`, height: `${rect.bottom - rect.top}px` });
      return rect;
    };
    const hideBox = () => {
      const box = latest.current.box.current;
      if (box) box.style.display = 'none';
    };

    const end = () => {
      if (gesture && surface.hasPointerCapture(gesture.id)) surface.releasePointerCapture(gesture.id);
      gesture = null;
      hideBox();
    };

    const cancel = () => {
      if (gesture?.drag) {
        gesture.drag.revert();
        latest.current.onCancel();
      }
      end();
      invalidate();
    };

    const longPress = () => {
      if (!press) return;
      const { x, y } = press;
      const cam = camera();
      const rect = surface.getBoundingClientRect();
      const scene = latest.current.scene();
      const index = cam
        ? pick(
            x,
            y,
            scene.map((s) => s.object),
            cam,
            { width: rect.width, height: rect.height },
          )
        : -1;
      press = null;
      // The finger stays down; whatever it was doing stops, and its click is not a tap.
      cancel();
      swallowClick = true;
      latest.current.onLongPress(index >= 0 ? scene[index].id : null, x, y);
    };

    const onPointerDown = (e: PointerEvent) => {
      pointers.add(e.pointerId);
      swallowClick = false;
      clearPress();
      const get = latest.current.three.current;
      if (!get) return;

      if (gesture) {
        // A second finger: undo the first finger's work and give it to the orbit controls, which
        // never saw it go down. This event then reaches them as the second.
        const first = gesture;
        cancel();
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
        return;
      }
      // Only touches on the canvas itself; the readout and anything else over it keep their own.
      if (pointers.size > 1 || e.button !== 0 || !(e.target instanceof HTMLCanvasElement)) return;

      const cam = camera();
      if (!cam) return;
      const { x, y, size } = local(e);
      press = { id: e.pointerId, x, y, timer: window.setTimeout(longPress, LONG_PRESS_MS) };

      const selection = latest.current.selection();
      const target = selection.length
        ? hitTest(
            x,
            y,
            selection.map((s) => s.object),
            cam,
            size,
            latest.current.mode,
          )
        : null;
      if (!target && !latest.current.shift) return;

      e.stopPropagation();
      surface.setPointerCapture(e.pointerId);
      gesture = { id: e.pointerId, x0: x, y0: y, last: e, kind: target ? 'transform' : 'box', target, drag: null, moved: false, text: null };
      swallowClick = true;
    };

    const onPointerMove = (e: PointerEvent) => {
      if (press && e.pointerId === press.id) {
        const { x, y } = local(e);
        if (Math.hypot(x - press.x, y - press.y) >= TAP_SLOP) clearPress();
      }
      if (!gesture || e.pointerId !== gesture.id) return;
      e.stopPropagation();
      gesture.last = e;
      const cam = camera();
      if (!cam) return;
      const { x, y, size } = local(e);
      if (!gesture.moved) {
        if (Math.hypot(x - gesture.x0, y - gesture.y0) < TAP_SLOP) return;
        gesture.moved = true;
        const { target } = gesture;
        if (gesture.kind === 'transform' && target) {
          // The drag counts from here, so the selection keeps its distance from the finger.
          const objects = latest.current.selection().map((s) => s.object);
          gesture.drag = createDrag(objects, target, latest.current.mode, x, y, cam, size, latest.current.shift && target.kind === 'handle');
          latest.current.onStart(target.kind);
        } else {
          latest.current.onStart('box');
        }
      }
      if (gesture.drag) {
        const text = gesture.drag.update(x, y, latest.current.snap);
        if (text !== null) {
          gesture.text = text;
          latest.current.onMove(text, x, y);
        }
        invalidate();
      } else {
        drawBox(x, y);
      }
    };

    const onPointerUp = (e: PointerEvent) => {
      pointers.delete(e.pointerId);
      if (press?.id === e.pointerId) clearPress();
      if (!gesture || e.pointerId !== gesture.id) return;
      e.stopPropagation();
      const g = gesture;
      const { x, y, size } = local(e);
      const cam = camera();

      if (g.kind === 'box' && g.moved) {
        const rect = drawBox(x, y);
        end();
        if (rect && cam) {
          const inside = latest.current.scene().filter((s) => onScreenIn(s.object.getWorldPosition(s.object.position.clone()), rect, cam, size));
          latest.current.onBox(inside.map((s) => s.id));
        }
      } else if (g.drag) {
        end();
        if (g.text !== null) latest.current.onCommit({ mode: latest.current.mode, axis: g.drag.axis, text: g.text, x, y });
        else {
          g.drag.revert();
          latest.current.onCancel();
        }
      } else {
        end();
        // A tap. Under Shift it adds or removes whatever it lands on.
        if (latest.current.shift && cam) {
          const scene = latest.current.scene();
          const index = pick(
            x,
            y,
            scene.map((s) => s.object),
            cam,
            size,
          );
          latest.current.onToggle(index >= 0 ? scene[index].id : null);
        }
      }
      invalidate();
    };

    const onPointerCancel = (e: PointerEvent) => {
      pointers.delete(e.pointerId);
      if (press?.id === e.pointerId) clearPress();
      if (!gesture || e.pointerId !== gesture.id) return;
      cancel();
    };

    // A kept touch still ends in a click; it must not reach the canvas as a tap on the background.
    const onClick = (e: MouseEvent) => {
      if (!swallowClick) return;
      swallowClick = false;
      e.stopPropagation();
    };

    // A right click, or a long press where the browser sends one: the same menu as the timer.
    const onContextMenu = (e: MouseEvent) => {
      if (!(e.target instanceof HTMLCanvasElement)) return;
      e.preventDefault();
      clearPress();
      const { x, y } = local(e);
      press = { id: -1, x, y, timer: 0 };
      longPress();
    };

    const capture = { capture: true };
    surface.addEventListener('pointerdown', onPointerDown, capture);
    surface.addEventListener('pointermove', onPointerMove, capture);
    surface.addEventListener('pointerup', onPointerUp, capture);
    surface.addEventListener('pointercancel', onPointerCancel, capture);
    surface.addEventListener('click', onClick, capture);
    surface.addEventListener('contextmenu', onContextMenu, capture);
    return () => {
      clearPress();
      surface.removeEventListener('pointerdown', onPointerDown, capture);
      surface.removeEventListener('pointermove', onPointerMove, capture);
      surface.removeEventListener('pointerup', onPointerUp, capture);
      surface.removeEventListener('pointercancel', onPointerCancel, capture);
      surface.removeEventListener('click', onClick, capture);
      surface.removeEventListener('contextmenu', onContextMenu, capture);
    };
  }, []);
}
