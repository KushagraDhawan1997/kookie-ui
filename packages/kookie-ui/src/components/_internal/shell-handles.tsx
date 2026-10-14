import * as React from 'react';
import classNames from 'classnames';
import { usePaneResize } from './shell-resize.js';

/**
 * The resize handle: the WAI-ARIA window splitter. `role="separator"` with a
 * value, focusable because it is operable, `aria-controls` naming its pane.
 *
 * A drag writes the size variable directly on the pane and sets no React
 * state, so nothing re-renders per move. `onResize` is called at most once per
 * animation frame, and once more with the final size when the drag ends. The
 * direction and the ceiling are read once, when the drag starts.
 */
export const PaneHandle = React.forwardRef<HTMLDivElement, React.ComponentPropsWithoutRef<'div'>>(({ className, children, ...props }, ref) => {
  const {
    containerRef,
    controls,
    cssVarName,
    minSize,
    maxSize,
    defaultSize,
    orientation,
    edge,
    growth,
    onResize,
    onResizeStart,
    onResizeEnd,
    snapPoints,
    snapTolerance,
    collapseThreshold,
    collapsible,
    target,
    requestCollapse,
    requestToggle,
  } = usePaneResize();

  const handleRef = React.useRef<HTMLDivElement | null>(null);
  const setRef = React.useCallback(
    (node: HTMLDivElement | null) => {
      handleRef.current = node;
      if (typeof ref === 'function') ref(node);
      else if (ref) (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
    },
    [ref],
  );

  const activeCleanupRef = React.useRef<(() => void) | null>(null);
  React.useEffect(
    () => () => {
      activeCleanupRef.current?.();
      activeCleanupRef.current = null;
    },
    [],
  );

  /** The pane's size as the stylesheet sees it. Read at the edges of a gesture, never during one. */
  const readSize = React.useCallback(() => {
    const container = containerRef.current;
    if (!container) return defaultSize;
    const parsed = Number.parseFloat(getComputedStyle(container).getPropertyValue(cssVarName));
    return Number.isFinite(parsed) ? parsed : defaultSize;
  }, [containerRef, cssVarName, defaultSize]);

  /**
   * The largest size a resize may reach: the stated maximum, and never so
   * large that the handle leaves the frame. The room is measured from the
   * pane's anchored edge, which does not move, to the far edge of the frame,
   * so a pane that starts after a Rail has less room than the frame's width.
   * Without the cap a pane with a generous `maxSize` could be resized until
   * its own handle was off screen.
   */
  const ceiling = React.useCallback(() => {
    const container = containerRef.current;
    const handle = handleRef.current;
    const frame = container?.closest('.rt-ShellRoot')?.getBoundingClientRect();
    if (!container || !frame || !handle) return maxSize;
    const pane = container.getBoundingClientRect();
    const hitBox = handle.getBoundingClientRect();
    const sign = growth(getComputedStyle(container).direction === 'rtl');
    let room: number;
    if (orientation === 'vertical') room = sign > 0 ? frame.right - pane.left : pane.right - frame.left;
    else room = sign > 0 ? frame.bottom - pane.top : pane.bottom - frame.top;
    const hit = orientation === 'vertical' ? hitBox.width : hitBox.height;
    if (!(frame.width > 0 && frame.height > 0) || !Number.isFinite(room)) return maxSize;
    return Math.max(minSize, Math.min(maxSize, Math.round(room - hit)));
  }, [containerRef, growth, maxSize, minSize, orientation]);

  // The announced maximum is what a resize can reach now, not only the prop.
  const announceCeiling = () => {
    handleRef.current?.setAttribute('aria-valuemax', String(ceiling()));
  };

  // The announced value is seeded from the real size once the pane has a box.
  React.useLayoutEffect(() => {
    handleRef.current?.setAttribute('aria-valuenow', String(Math.round(readSize())));
  }, [readSize]);

  const write = (container: HTMLElement, size: number) => {
    container.style.setProperty(cssVarName, `${size}px`);
    handleRef.current?.setAttribute('aria-valuenow', String(Math.round(size)));
  };

  const targetLabel = target.charAt(0).toUpperCase() + target.slice(1);

  return (
    // A focusable separator with a value is the WAI-ARIA window splitter, an
    // interactive widget; jsx-a11y classes every separator as static.
    // eslint-disable-next-line jsx-a11y/no-noninteractive-element-interactions
    <div
      ref={setRef}
      className={classNames('rt-ShellResizer', className)}
      data-orientation={orientation}
      data-edge={edge}
      role="separator"
      // eslint-disable-next-line jsx-a11y/no-noninteractive-tabindex
      tabIndex={0}
      aria-label={`Resize ${targetLabel} pane`}
      aria-controls={controls}
      aria-orientation={orientation}
      aria-valuemin={minSize}
      aria-valuemax={maxSize}
      {...props}
      onPointerDown={(e) => {
        props.onPointerDown?.(e);
        const container = containerRef.current;
        if (!container || e.defaultPrevented || e.button !== 0) return;
        e.preventDefault();
        const handleEl = e.currentTarget as HTMLElement;
        const pointerId = e.pointerId;
        activeCleanupRef.current?.();
        try {
          handleEl.setPointerCapture(pointerId);
        } catch {
          // Capture can fail for a pointer that is already gone; the window listeners below still carry the drag.
        }

        // Everything a move needs is read here, once.
        const startStyle = getComputedStyle(container);
        const parsedStart = Number.parseFloat(startStyle.getPropertyValue(cssVarName));
        const startSize = Number.isFinite(parsedStart) ? parsedStart : defaultSize;
        const startClient = orientation === 'vertical' ? e.clientX : e.clientY;
        const sign = growth(startStyle.direction === 'rtl');
        const cap = ceiling();
        handleEl.setAttribute('aria-valuemax', String(cap));
        const clamp = (v: number) => Math.min(Math.max(v, minSize), cap);

        container.setAttribute('data-resizing', '');
        handleEl.setAttribute('data-dragging', '');
        const body = document.body;
        const prevCursor = body.style.cursor;
        const prevUserSelect = body.style.userSelect;
        body.style.cursor = orientation === 'vertical' ? 'col-resize' : 'row-resize';
        body.style.userSelect = 'none';
        onResizeStart?.(startSize);

        let current = startSize;
        // The unclamped size, so `collapseThreshold` is compared before the
        // clamp: a threshold below `minSize` can then still collapse the pane.
        let raw = startSize;
        let frame = 0;
        let pending: number | null = null;
        const flush = () => {
          frame = 0;
          if (pending === null) return;
          const size = pending;
          pending = null;
          onResize?.(size);
        };

        // The move handler listens on the handle, the document and the window,
        // so a drag survives environments where pointer events do not reach
        // all three. One movement can therefore arrive several times: once per
        // node it propagates through, and again as the compatibility mouse
        // event. Only the first copy does any work.
        let lastHandledMove: Event | null = null;
        let seenPointerEvent = false;
        const shouldHandle = (ev: Event, pointerType: string) => {
          if (ev.type === pointerType) seenPointerEvent = true;
          else if (seenPointerEvent) return false;
          return true;
        };

        const handleMove = (ev: PointerEvent) => {
          if (!shouldHandle(ev, 'pointermove')) return;
          if (ev === lastHandledMove) return;
          lastHandledMove = ev;
          const client = orientation === 'vertical' ? ev.clientX : ev.clientY;
          raw = startSize + (client - startClient) * sign;
          current = clamp(raw);
          write(container, current);
          pending = current;
          if (!frame) frame = requestAnimationFrame(flush);
        };

        const cleanup = () => {
          if (frame) cancelAnimationFrame(frame);
          frame = 0;
          try {
            handleEl.releasePointerCapture(pointerId);
          } catch {
            // Already released.
          }
          window.removeEventListener('pointermove', handleMove as EventListener);
          document.removeEventListener('pointermove', handleMove as EventListener);
          window.removeEventListener('mousemove', handleMove as EventListener);
          document.removeEventListener('mousemove', handleMove as EventListener);
          handleEl.removeEventListener('pointermove', handleMove as EventListener);
          window.removeEventListener('pointerup', handleUp as EventListener);
          document.removeEventListener('pointerup', handleUp as EventListener);
          window.removeEventListener('mouseup', handleUp as EventListener);
          document.removeEventListener('mouseup', handleUp as EventListener);
          window.removeEventListener('pointercancel', handleUp as EventListener);
          document.removeEventListener('pointercancel', handleUp as EventListener);
          window.removeEventListener('keydown', handleKey as EventListener);
          handleEl.removeEventListener('lostpointercapture', handleUp as EventListener);
          container.removeAttribute('data-resizing');
          handleEl.removeAttribute('data-dragging');
          body.style.cursor = prevCursor;
          body.style.userSelect = prevUserSelect;
          activeCleanupRef.current = null;
        };

        let finished = false;
        const handleUp = () => {
          if (finished) return;
          finished = true;
          // The last move's size is delivered now rather than on the next frame.
          if (frame) cancelAnimationFrame(frame);
          flush();

          if (collapsible && typeof collapseThreshold === 'number' && raw <= collapseThreshold) {
            // A drag past the threshold closes the pane and keeps no size: the
            // pane opens again at the size it had before the drag. The drag
            // still ends, at that size, so a consumer that started something
            // in onResizeStart can stop it.
            write(container, startSize);
            onResize?.(startSize);
            cleanup();
            requestCollapse?.();
            onResizeEnd?.(startSize);
            return;
          }

          let settled = current;
          if (snapPoints && snapPoints.length) {
            const nearest = snapPoints.reduce((acc, p) => (Math.abs(p - current) < Math.abs(acc - current) ? p : acc), snapPoints[0]);
            if (Math.abs(nearest - current) <= snapTolerance) {
              settled = clamp(nearest);
              write(container, settled);
              onResize?.(settled);
            }
          }
          onResizeEnd?.(settled);
          cleanup();
        };

        const handleKey = (kev: KeyboardEvent) => {
          if (kev.key !== 'Escape') return;
          if (frame) cancelAnimationFrame(frame);
          frame = 0;
          pending = null;
          write(container, startSize);
          onResize?.(startSize);
          finished = true;
          onResizeEnd?.(startSize);
          cleanup();
        };

        window.addEventListener('pointermove', handleMove as EventListener);
        document.addEventListener('pointermove', handleMove as EventListener);
        window.addEventListener('mousemove', handleMove as EventListener);
        document.addEventListener('mousemove', handleMove as EventListener);
        handleEl.addEventListener('pointermove', handleMove as EventListener);
        window.addEventListener('pointerup', handleUp as EventListener);
        document.addEventListener('pointerup', handleUp as EventListener);
        window.addEventListener('mouseup', handleUp as EventListener);
        document.addEventListener('mouseup', handleUp as EventListener);
        window.addEventListener('pointercancel', handleUp as EventListener);
        document.addEventListener('pointercancel', handleUp as EventListener);
        window.addEventListener('keydown', handleKey as EventListener);
        handleEl.addEventListener('lostpointercapture', handleUp as EventListener);
        activeCleanupRef.current = cleanup;
      }}
      onDoubleClick={(e) => {
        props.onDoubleClick?.(e);
        if (!e.defaultPrevented && collapsible) requestToggle?.();
      }}
      onFocus={(e) => {
        props.onFocus?.(e);
        announceCeiling();
      }}
      onKeyDown={(e) => {
        props.onKeyDown?.(e);
        const container = containerRef.current;
        if (!container || e.defaultPrevented) return;
        const current = readSize();
        // The keys reach as far as a drag does: the frame caps both.
        const cap = ceiling();
        const clamp = (v: number) => Math.min(Math.max(v, minSize), cap);
        let next: number | undefined;
        if (e.key === 'Home') next = clamp(minSize);
        else if (e.key === 'End') next = clamp(cap);
        else {
          // The key moves the boundary along its axis; the pane grows or
          // shrinks the way a drag in that direction would, so Bottom's
          // ArrowUp grows it and an end-anchored pane mirrors in RTL.
          const along = orientation === 'vertical' ? (e.key === 'ArrowRight' ? 1 : e.key === 'ArrowLeft' ? -1 : 0) : e.key === 'ArrowDown' ? 1 : e.key === 'ArrowUp' ? -1 : 0;
          if (along === 0) return;
          const step = e.shiftKey ? 32 : 8;
          next = clamp(current + along * step * growth(getComputedStyle(container).direction === 'rtl'));
        }
        e.preventDefault();
        onResizeStart?.(current);
        write(container, next);
        onResize?.(next);
        onResizeEnd?.(next);
      }}
    >
      {children}
    </div>
  );
});
PaneHandle.displayName = 'Shell.Handle';

export const PanelHandle = React.forwardRef<HTMLDivElement, React.ComponentPropsWithoutRef<'div'>>((props, ref) => <PaneHandle {...props} ref={ref} />);
PanelHandle.displayName = 'Shell.Panel.Handle';

export const SidebarHandle = React.forwardRef<HTMLDivElement, React.ComponentPropsWithoutRef<'div'>>((props, ref) => <PaneHandle {...props} ref={ref} />);
SidebarHandle.displayName = 'Shell.Sidebar.Handle';

export const InspectorHandle = React.forwardRef<HTMLDivElement, React.ComponentPropsWithoutRef<'div'>>((props, ref) => <PaneHandle {...props} ref={ref} />);
InspectorHandle.displayName = 'Shell.Inspector.Handle';

export const BottomHandle = React.forwardRef<HTMLDivElement, React.ComponentPropsWithoutRef<'div'>>((props, ref) => <PaneHandle {...props} ref={ref} />);
BottomHandle.displayName = 'Shell.Bottom.Handle';
