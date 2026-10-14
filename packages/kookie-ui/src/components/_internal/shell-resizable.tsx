'use client';

import * as React from 'react';
import { normalizeToPx } from '../../helpers/normalize-to-px.js';
import type { PaneName, PaneSizePersistence } from '../shell.types.js';
import type { PaneResizeContextValue } from './shell-resize.js';

export type SizeChangeMeta = { reason: 'init' | 'resize' | 'controlled' };

export type ResizableOptions = {
  name: PaneName;
  /** The pane's element id, which the handle names in `aria-controls`. */
  elementId: string;
  elementRef: React.RefObject<HTMLElement | null>;
  cssVarName: string;
  orientation: 'vertical' | 'horizontal';
  edge: 'start' | 'end';
  growth: (isRtl: boolean) => 1 | -1;
  expandedSize: number;
  minSize: number;
  maxSize: number;
  resizable: boolean;
  collapsible: boolean;
  size: number | string | undefined;
  defaultSize: number | string | undefined;
  onSizeChange: ((size: number, meta: SizeChangeMeta) => void) | undefined;
  sizeUpdate: 'throttle' | 'debounce' | undefined;
  sizeUpdateMs: number;
  onResize: ((size: number) => void) | undefined;
  onResizeStart: ((size: number) => void) | undefined;
  onResizeEnd: ((size: number) => void) | undefined;
  snapPoints: number[] | undefined;
  snapTolerance: number | undefined;
  collapseThreshold: number | undefined;
  paneId: string | undefined;
  persistence: PaneSizePersistence | undefined;
  /** Whether the pane is presented as an overlay right now. An overlay keeps its designed size and persists nothing. */
  overlaying: boolean;
  /** The same question asked at effect time, for a pane whose presentation is learnt after its first render. */
  overlayingNow: () => boolean;
  requestCollapse: () => void;
  requestToggle: () => void;
};

const clampTo = (value: number, min: number | undefined, max: number | undefined) => Math.min(max ?? value, Math.max(min ?? value, value));

/** Everything a resizable pane shares: size props, persistence, and the handle's context. */
export function useResizablePane(options: ResizableOptions): PaneResizeContextValue {
  const { name, elementRef, cssVarName, orientation, minSize, maxSize, resizable, size, defaultSize, paneId, persistence } = options;

  // The latest callbacks, so the size emitter does not change identity when a
  // consumer passes an inline function. A controlled `size` is reported again
  // only when the size, the minimum or the maximum changes.
  const latest = React.useRef(options);
  React.useLayoutEffect(() => {
    latest.current = options;
  });

  const debounceRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const throttleRef = React.useRef(0);
  React.useEffect(
    () => () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    },
    [],
  );
  const emitSizeChange = React.useCallback((value: number, meta: SizeChangeMeta) => {
    const { onSizeChange, sizeUpdate, sizeUpdateMs } = latest.current;
    if (!onSizeChange) return;
    if (sizeUpdate === 'debounce') {
      if (debounceRef.current) clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => {
        debounceRef.current = null;
        latest.current.onSizeChange?.(value, meta);
      }, sizeUpdateMs);
      return;
    }
    if (sizeUpdate === 'throttle') {
      const now = Date.now();
      if (now - throttleRef.current < sizeUpdateMs) return;
      throttleRef.current = now;
    }
    onSizeChange(value, meta);
  }, []);

  const toPx = React.useCallback((value: number | string | undefined) => normalizeToPx(value, orientation === 'vertical' ? 'horizontal' : 'vertical'), [orientation]);

  // defaultSize: applied once, on mount.
  React.useLayoutEffect(() => {
    const el = elementRef.current;
    if (!el || size !== undefined || defaultSize === undefined) return;
    const px = toPx(defaultSize);
    if (typeof px !== 'number' || !Number.isFinite(px)) return;
    const clamped = clampTo(px, minSize, maxSize);
    el.style.setProperty(cssVarName, `${clamped}px`);
    emitSizeChange(clamped, { reason: 'init' });
    // An uncontrolled initial value: applied on mount and never re-applied.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Controlled size. A drag stands until the app passes a different value.
  React.useLayoutEffect(() => {
    const el = elementRef.current;
    if (!el || size === undefined) return;
    const px = toPx(size);
    if (typeof px !== 'number' || !Number.isFinite(px)) return;
    const clamped = clampTo(px, minSize, maxSize);
    el.style.setProperty(cssVarName, `${clamped}px`);
    emitSizeChange(clamped, { reason: 'controlled' });
  }, [size, minSize, maxSize, cssVarName, elementRef, toPx, emitSizeChange]);

  // A persistence adapter from `paneId` when none is given.
  const adapter = React.useMemo<PaneSizePersistence | undefined>(() => {
    if (!paneId || persistence) return persistence;
    const key = `kookie-ui:shell:${name}:${paneId}`;
    return {
      load: () => {
        if (typeof window === 'undefined') return undefined;
        try {
          const stored = window.localStorage.getItem(key);
          return stored ? Number(stored) : undefined;
        } catch (err) {
          if (process.env.NODE_ENV !== 'production') console.warn(`Shell.${name}: failed to load persisted size`, err);
          return undefined;
        }
      },
      save: (value: number) => {
        if (typeof window === 'undefined') return;
        try {
          window.localStorage.setItem(key, String(value));
        } catch (err) {
          if (process.env.NODE_ENV !== 'production') console.warn(`Shell.${name}: failed to save persisted size`, err);
        }
      },
    };
  }, [name, paneId, persistence]);

  // Persisted size, loaded in a layout effect and clamped, so a reload does
  // not paint the default and then jump. Only where the pane is in the frame:
  // an overlay keeps its designed size.
  React.useLayoutEffect(() => {
    if (!resizable || !adapter?.load || latest.current.overlayingNow()) return undefined;
    let mounted = true;
    const apply = (value: number | undefined) => {
      const el = elementRef.current;
      if (!mounted || typeof value !== 'number' || !Number.isFinite(value) || !el) return;
      const clamped = clampTo(value, minSize, maxSize);
      el.style.setProperty(cssVarName, `${clamped}px`);
      latest.current.onResize?.(clamped);
    };
    const loaded = adapter.load();
    if (loaded instanceof Promise) {
      loaded.then(apply).catch((err) => {
        if (process.env.NODE_ENV !== 'production') console.warn(`Shell.${name}: failed to load persisted size`, err);
      });
    } else {
      apply(loaded);
    }
    return () => {
      mounted = false;
    };
  }, [resizable, adapter, options.overlaying, cssVarName, elementRef, minSize, maxSize, name]);

  const onResize = React.useCallback((value: number) => latest.current.onResize?.(value), []);
  const onResizeStart = React.useCallback((value: number) => latest.current.onResizeStart?.(value), []);
  const onResizeEnd = React.useCallback(
    (value: number) => {
      latest.current.onResizeEnd?.(value);
      emitSizeChange(value, { reason: 'resize' });
      adapter?.save?.(value);
    },
    [emitSizeChange, adapter],
  );
  const requestCollapse = React.useCallback(() => latest.current.requestCollapse(), []);
  const requestToggle = React.useCallback(() => latest.current.requestToggle(), []);

  return React.useMemo(
    () => ({
      containerRef: elementRef,
      controls: options.elementId,
      cssVarName,
      minSize,
      maxSize,
      defaultSize: options.expandedSize,
      orientation,
      edge: options.edge,
      growth: options.growth,
      onResize,
      onResizeStart,
      onResizeEnd,
      target: name,
      collapsible: options.collapsible,
      snapPoints: options.snapPoints,
      snapTolerance: options.snapTolerance ?? 8,
      collapseThreshold: options.collapseThreshold,
      requestCollapse,
      requestToggle,
    }),
    [
      elementRef,
      options.elementId,
      cssVarName,
      minSize,
      maxSize,
      options.expandedSize,
      orientation,
      options.edge,
      options.growth,
      onResize,
      onResizeStart,
      onResizeEnd,
      name,
      options.collapsible,
      options.snapPoints,
      options.snapTolerance,
      options.collapseThreshold,
      requestCollapse,
      requestToggle,
    ],
  );
}

/** Splits a pane's children into its handles and the rest. */
export function splitHandles(children: React.ReactNode, handleType: React.ElementType) {
  const all = React.Children.toArray(children);
  const handles = all.filter((el) => React.isValidElement(el) && el.type === handleType) as React.ReactElement[];
  const content = all.filter((el) => !(React.isValidElement(el) && el.type === handleType));
  return { handles, content };
}
