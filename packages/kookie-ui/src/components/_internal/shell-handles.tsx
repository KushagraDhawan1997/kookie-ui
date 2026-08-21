import * as React from 'react';
import classNames from 'classnames';
import { usePaneResize } from './shell-resize.js';

/** How long a held arrow key waits before the resize is treated as finished. */
const KEY_COMMIT_DELAY_MS = 120;

const TARGET_LABELS: Record<string, string> = {
  left: 'Navigation',
  rail: 'Navigation',
  panel: 'Navigation panel',
  sidebar: 'Sidebar',
  inspector: 'Inspector',
  bottom: 'Bottom panel',
};

function readSize(container: HTMLElement, cssVarName: string, fallback: number) {
  const raw = getComputedStyle(container).getPropertyValue(cssVarName);
  const parsed = Number.parseFloat(raw.trim());
  return Number.isFinite(parsed) ? parsed : fallback;
}

export const PaneHandle = React.forwardRef<HTMLDivElement, React.ComponentPropsWithoutRef<'div'>>(
  ({ className, children, onKeyDown, onKeyUp, onBlur, onPointerDown, onDoubleClick, ...props }, ref) => {
    const {
      containerRef,
      cssVarName,
      minSize,
      maxSize,
      defaultSize,
      currentSize,
      orientation,
      edge,
      computeNext,
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
    const keySessionRef = React.useRef<{ timeout: ReturnType<typeof setTimeout> | null; size: number } | null>(null);

    const endKeySession = React.useCallback(() => {
      const session = keySessionRef.current;
      if (!session) return;
      if (session.timeout) clearTimeout(session.timeout);
      keySessionRef.current = null;
      onResizeEnd?.(session.size);
    }, [onResizeEnd]);

    React.useEffect(
      () => () => {
        try {
          activeCleanupRef.current?.();
        } catch {
          /* the pane may already be detached */
        }
        activeCleanupRef.current = null;
        const session = keySessionRef.current;
        if (session?.timeout) clearTimeout(session.timeout);
        keySessionRef.current = null;
      },
      [],
    );

    const clamp = React.useCallback((value: number) => Math.min(Math.max(value, minSize), maxSize), [minSize, maxSize]);

    /** Writes a size to the DOM during an interaction. React state catches up when the gesture commits. */
    const paint = React.useCallback(
      (container: HTMLElement, next: number) => {
        container.style.setProperty(cssVarName, `${next}px`);
        handleRef.current?.setAttribute('aria-valuenow', String(Math.round(next)));
        onResize?.(next);
      },
      [cssVarName, onResize],
    );

    const handlePointerDown = React.useCallback(
      (event: React.PointerEvent<HTMLDivElement>) => {
        onPointerDown?.(event);
        if (event.defaultPrevented) return;
        const container = containerRef.current;
        if (!container) return;

        event.preventDefault();
        const handleEl = event.currentTarget;
        const pointerId = event.pointerId;

        try {
          activeCleanupRef.current?.();
        } catch {
          /* a previous gesture may already be gone */
        }
        endKeySession();

        container.setAttribute('data-resizing', '');
        try {
          handleEl.setPointerCapture(pointerId);
        } catch {
          /* pointer capture is best-effort */
        }

        const startClient = orientation === 'vertical' ? event.clientX : event.clientY;
        const startSize = readSize(container, cssVarName, defaultSize);
        const body = document.body;
        const previousCursor = body.style.cursor;
        const previousUserSelect = body.style.userSelect;
        body.style.cursor = orientation === 'vertical' ? 'col-resize' : 'row-resize';
        body.style.userSelect = 'none';
        onResizeStart?.(startSize);

        const handleMove = (moveEvent: PointerEvent) => {
          const client = orientation === 'vertical' ? moveEvent.clientX : moveEvent.clientY;
          paint(container, clamp(computeNext(client, startClient, startSize)));
        };

        const cleanup = () => {
          try {
            handleEl.releasePointerCapture(pointerId);
          } catch {
            /* capture may already be released */
          }
          window.removeEventListener('pointermove', handleMove);
          window.removeEventListener('pointerup', handleUp);
          window.removeEventListener('pointercancel', handleUp);
          window.removeEventListener('keydown', handleKey);
          handleEl.removeEventListener('lostpointercapture', handleUp);
          container.removeAttribute('data-resizing');
          body.style.cursor = previousCursor;
          body.style.userSelect = previousUserSelect;
          activeCleanupRef.current = null;
        };

        const handleUp = () => {
          const finalSize = readSize(container, cssVarName, defaultSize);
          let committed = finalSize;

          if (snapPoints && snapPoints.length) {
            const nearest = snapPoints.reduce((acc, point) => (Math.abs(point - finalSize) < Math.abs(acc - finalSize) ? point : acc), snapPoints[0]);
            if (Math.abs(nearest - finalSize) <= (snapTolerance ?? 8)) {
              committed = nearest;
              paint(container, committed);
            }
          }

          if (collapsible && typeof collapseThreshold === 'number' && finalSize <= collapseThreshold) {
            requestCollapse?.();
          }

          onResizeEnd?.(committed);
          cleanup();
        };

        const handleKey = (keyEvent: KeyboardEvent) => {
          if (keyEvent.key !== 'Escape') return;
          paint(container, startSize);
          onResizeEnd?.(startSize);
          cleanup();
        };

        // One listener per event: the pointer is captured, so window sees every move.
        window.addEventListener('pointermove', handleMove);
        window.addEventListener('pointerup', handleUp);
        window.addEventListener('pointercancel', handleUp);
        window.addEventListener('keydown', handleKey);
        handleEl.addEventListener('lostpointercapture', handleUp);
        activeCleanupRef.current = cleanup;
      },
      [
        clamp,
        collapseThreshold,
        collapsible,
        computeNext,
        containerRef,
        cssVarName,
        defaultSize,
        endKeySession,
        onPointerDown,
        onResizeEnd,
        onResizeStart,
        orientation,
        paint,
        requestCollapse,
        snapPoints,
        snapTolerance,
      ],
    );

    const handleKeyDown = React.useCallback(
      (event: React.KeyboardEvent<HTMLDivElement>) => {
        onKeyDown?.(event);
        if (event.defaultPrevented) return;
        const container = containerRef.current;
        if (!container) return;

        const current = readSize(container, cssVarName, defaultSize);
        const step = event.shiftKey ? 32 : 8;

        let next: number | null = null;
        if (event.key === 'Home') {
          next = clamp(minSize);
        } else if (event.key === 'End') {
          next = clamp(maxSize);
        } else {
          let delta = 0;
          if (orientation === 'vertical') {
            const documentDirection = typeof document !== 'undefined' ? document.dir : undefined;
            const computedDirection = getComputedStyle(container).direction;
            const hasRtlAncestor = Boolean(container.closest?.('[dir="rtl"]'));
            const isRtl = documentDirection === 'rtl' || computedDirection === 'rtl' || hasRtlAncestor;
            if (event.key === 'ArrowRight') delta = isRtl ? -step : step;
            else if (event.key === 'ArrowLeft') delta = isRtl ? step : -step;
          } else {
            if (event.key === 'ArrowDown') delta = step;
            else if (event.key === 'ArrowUp') delta = -step;
          }
          if (delta === 0) return;
          // A handle on the start edge grows the pane when it moves away from the pane's content,
          // so the key delta is inverted there — for both orientations.
          next = clamp(current + (edge === 'start' ? -delta : delta));
        }

        event.preventDefault();

        // One resize session per burst of keys: start once, commit when the keys stop.
        if (!keySessionRef.current) {
          onResizeStart?.(current);
          keySessionRef.current = { timeout: null, size: current };
        }
        paint(container, next);

        const session = keySessionRef.current;
        session.size = next;
        if (session.timeout) clearTimeout(session.timeout);
        session.timeout = setTimeout(endKeySession, KEY_COMMIT_DELAY_MS);
      },
      [clamp, containerRef, cssVarName, defaultSize, edge, endKeySession, maxSize, minSize, onKeyDown, onResizeStart, orientation, paint],
    );

    const handleKeyUp = React.useCallback(
      (event: React.KeyboardEvent<HTMLDivElement>) => {
        onKeyUp?.(event);
        endKeySession();
      },
      [endKeySession, onKeyUp],
    );

    const handleBlur = React.useCallback(
      (event: React.FocusEvent<HTMLDivElement>) => {
        onBlur?.(event);
        endKeySession();
      },
      [endKeySession, onBlur],
    );

    const handleDoubleClick = React.useCallback(
      (event: React.MouseEvent<HTMLDivElement>) => {
        onDoubleClick?.(event);
        if (event.defaultPrevented) return;
        if (collapsible) requestToggle?.();
      },
      [collapsible, onDoubleClick, requestToggle],
    );

    const paneLabel = TARGET_LABELS[target] ?? target;

    // A focusable `separator` is the ARIA window-splitter pattern: it is a widget, so it takes
    // keyboard focus and key handlers. jsx-a11y only models the non-focusable, decorative variant.
    /* eslint-disable jsx-a11y/no-noninteractive-element-interactions, jsx-a11y/no-noninteractive-tabindex */
    return (
      <div
        {...props}
        ref={setRef}
        className={classNames('rt-ShellResizer', className)}
        data-orientation={orientation}
        data-edge={edge}
        role="separator"
        aria-label={`Resize ${paneLabel}`}
        aria-orientation={orientation}
        aria-valuemin={minSize}
        aria-valuemax={maxSize}
        aria-valuenow={Math.round(currentSize)}
        aria-valuetext={`${Math.round(currentSize)} pixels`}
        tabIndex={0}
        onPointerDown={handlePointerDown}
        onDoubleClick={handleDoubleClick}
        onKeyDown={handleKeyDown}
        onKeyUp={handleKeyUp}
        onBlur={handleBlur}
      >
        {children}
      </div>
    );
    /* eslint-enable jsx-a11y/no-noninteractive-element-interactions, jsx-a11y/no-noninteractive-tabindex */
  },
);
PaneHandle.displayName = 'Shell.Handle';

export const PanelHandle = React.forwardRef<HTMLDivElement, React.ComponentPropsWithoutRef<'div'>>((props, ref) => <PaneHandle {...props} ref={ref} />);
PanelHandle.displayName = 'Shell.Panel.Handle';

export const SidebarHandle = React.forwardRef<HTMLDivElement, React.ComponentPropsWithoutRef<'div'>>((props, ref) => <PaneHandle {...props} ref={ref} />);
SidebarHandle.displayName = 'Shell.Sidebar.Handle';

export const InspectorHandle = React.forwardRef<HTMLDivElement, React.ComponentPropsWithoutRef<'div'>>((props, ref) => <PaneHandle {...props} ref={ref} />);
InspectorHandle.displayName = 'Shell.Inspector.Handle';

export const BottomHandle = React.forwardRef<HTMLDivElement, React.ComponentPropsWithoutRef<'div'>>((props, ref) => <PaneHandle {...props} ref={ref} />);
BottomHandle.displayName = 'Shell.Bottom.Handle';
