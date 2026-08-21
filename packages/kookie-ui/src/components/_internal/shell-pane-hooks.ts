import * as React from 'react';
import type { PaneMode, PaneSizePersistence, SidebarMode } from '../shell.types.js';
import { normalizeToPx } from '../../helpers/normalize-to-px.js';

/** Panes report every size change with one of these reasons. */
export type PaneSizeReason = 'init' | 'resize' | 'controlled';
export type PaneSizeChangeMeta = { reason: PaneSizeReason };

type SizeCallback = (size: number, meta: PaneSizeChangeMeta) => void;

/** Keeps a value in a ref so effects can read the latest one without listing it as a dependency. */
function useLatest<T>(value: T) {
  const ref = React.useRef(value);
  React.useLayoutEffect(() => {
    ref.current = value;
  });
  return ref;
}

function clampSize(px: number, minSize?: number, maxSize?: number) {
  const min = typeof minSize === 'number' ? minSize : undefined;
  const max = typeof maxSize === 'number' ? maxSize : undefined;
  return Math.min(max ?? px, Math.max(min ?? px, px));
}

/**
 * Throttled/debounced emitter for `onSizeChange`.
 *
 * The throttle keeps a trailing call so the last size is never dropped — panes emit at the
 * *end* of a resize, and a leading-only throttle silently discarded those terminal values.
 */
function useSizeEmitter(onSizeChange: SizeCallback | undefined, strategy: 'throttle' | 'debounce' | undefined, ms: number) {
  const timeoutRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const lastRunRef = React.useRef(0);
  const callbackRef = useLatest(onSizeChange);
  const hasCallback = Boolean(onSizeChange);

  const clear = React.useCallback(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  React.useEffect(() => clear, [clear, strategy, ms]);

  return React.useCallback(
    (size: number, meta: PaneSizeChangeMeta) => {
      if (!hasCallback) return;
      if (strategy === 'debounce') {
        clear();
        timeoutRef.current = setTimeout(() => {
          timeoutRef.current = null;
          callbackRef.current?.(size, meta);
        }, ms);
        return;
      }
      if (strategy === 'throttle') {
        const now = Date.now();
        const elapsed = now - lastRunRef.current;
        if (elapsed >= ms) {
          lastRunRef.current = now;
          clear();
          callbackRef.current?.(size, meta);
          return;
        }
        // Trailing edge: keep the newest value and emit it when the window closes.
        clear();
        timeoutRef.current = setTimeout(() => {
          timeoutRef.current = null;
          lastRunRef.current = Date.now();
          callbackRef.current?.(size, meta);
        }, ms - elapsed);
        return;
      }
      callbackRef.current?.(size, meta);
    },
    [hasCallback, strategy, ms, clear, callbackRef],
  );
}

interface UsePaneSizeOptions {
  containerRef: React.RefObject<HTMLElement | null>;
  /** CSS custom property the pane's width/height is read from. */
  cssVar: string;
  /** localStorage namespace used when only `paneId` is supplied. */
  storageNamespace: 'panel' | 'sidebar' | 'inspector' | 'bottom';
  /** Which viewport dimension percentage sizes resolve against. */
  orientation: 'horizontal' | 'vertical';
  componentName: string;
  expandedSize: number;
  minSize?: number;
  maxSize?: number;
  size?: number | string;
  defaultSize?: number | string;
  onSizeChange?: SizeCallback;
  sizeUpdate?: 'throttle' | 'debounce';
  sizeUpdateMs?: number;
  onResize?: (size: number) => void;
  paneId?: string;
  persistence?: PaneSizePersistence;
  /** Persistence only applies to in-flow presentations that can actually be resized. */
  persistenceEnabled: boolean;
}

interface UsePaneSizeResult {
  /** Current size in px. Drives the pane's CSS variable, and the handle's `aria-valuenow`. */
  currentSize: number;
  /** Records a size produced by a drag or a key press. */
  commitSize: (size: number, reason?: PaneSizeReason) => void;
  persistenceAdapter?: PaneSizePersistence;
}

/**
 * Owns a pane's size: default/controlled props, persistence, and the throttled change callback.
 *
 * The size lives in React state so it survives re-renders and so the resize handle can expose a
 * truthful `aria-valuenow`. Drags still write the CSS variable directly (no render per frame) and
 * call `commitSize` once at the end.
 */
export function usePaneSize({
  containerRef,
  cssVar,
  storageNamespace,
  orientation,
  componentName,
  expandedSize,
  minSize,
  maxSize,
  size,
  defaultSize,
  onSizeChange,
  sizeUpdate,
  sizeUpdateMs = 50,
  onResize,
  paneId,
  persistence,
  persistenceEnabled,
}: UsePaneSizeOptions): UsePaneSizeResult {
  const [currentSize, setCurrentSize] = React.useState(() => clampSize(expandedSize, minSize, maxSize));
  const emitSizeChange = useSizeEmitter(onSizeChange, sizeUpdate, sizeUpdateMs);
  const onResizeRef = useLatest(onResize);

  const applySize = React.useCallback(
    (px: number, reason: PaneSizeReason) => {
      const clamped = clampSize(px, minSize, maxSize);
      containerRef.current?.style.setProperty(cssVar, `${clamped}px`);
      setCurrentSize((prev) => (prev === clamped ? prev : clamped));
      emitSizeChange(clamped, { reason });
      return clamped;
    },
    [containerRef, cssVar, emitSizeChange, minSize, maxSize],
  );

  const commitSize = React.useCallback((px: number, reason: PaneSizeReason = 'resize') => applySize(px, reason), [applySize]);

  // Default persistence adapter derived from `paneId`.
  const persistenceAdapter = React.useMemo(() => {
    if (!paneId || persistence) return persistence;
    const key = `kookie-ui:shell:${storageNamespace}:${paneId}`;
    const warn = (message: string, err: unknown) => {
      if (process.env.NODE_ENV !== 'production') {
        console.warn(`${componentName}: ${message}`, err);
      }
    };
    const adapter: PaneSizePersistence = {
      load: () => {
        if (typeof window === 'undefined') return undefined;
        try {
          const value = window.localStorage.getItem(key);
          if (value === null) return undefined;
          const parsed = Number(value);
          return Number.isFinite(parsed) ? parsed : undefined;
        } catch (err) {
          warn('failed to load persisted size', err);
          return undefined;
        }
      },
      save: (next: number) => {
        if (typeof window === 'undefined') return;
        try {
          window.localStorage.setItem(key, String(next));
        } catch (err) {
          warn('failed to save persisted size', err);
        }
      },
    };
    return adapter;
  }, [paneId, persistence, storageNamespace, componentName]);

  // Load the persisted size once. `onResize` is deliberately not a dependency: consumers pass it
  // inline, which would re-run this effect on every render and stamp the stored size back over
  // whatever the user is currently dragging to.
  const didLoadRef = React.useRef(false);
  React.useEffect(() => {
    if (!persistenceEnabled) return;
    if (didLoadRef.current) return;
    const load = persistenceAdapter?.load;
    if (!load) return;
    didLoadRef.current = true;

    let active = true;
    const apply = (value?: number) => {
      if (!active || typeof value !== 'number' || !Number.isFinite(value)) return;
      const clamped = clampSize(value, minSize, maxSize);
      containerRef.current?.style.setProperty(cssVar, `${clamped}px`);
      setCurrentSize((prev) => (prev === clamped ? prev : clamped));
      onResizeRef.current?.(clamped);
    };

    let loaded: number | Promise<number | undefined> | undefined;
    try {
      loaded = load();
    } catch (err) {
      if (process.env.NODE_ENV !== 'production') {
        console.warn(`${componentName}: failed to load persisted size`, err);
      }
      return;
    }

    if (loaded instanceof Promise) {
      loaded.then(apply).catch((err) => {
        if (process.env.NODE_ENV !== 'production') {
          console.warn(`${componentName}: failed to load persisted size`, err);
        }
      });
    } else {
      apply(loaded);
    }

    return () => {
      active = false;
    };
  }, [persistenceEnabled, persistenceAdapter, containerRef, cssVar, componentName, minSize, maxSize, onResizeRef]);

  // `defaultSize` is an uncontrolled initial value: apply it once, on mount only.
  const didApplyDefaultRef = React.useRef(false);
  React.useLayoutEffect(() => {
    if (didApplyDefaultRef.current) return;
    if (typeof size !== 'undefined' || typeof defaultSize === 'undefined') return;
    didApplyDefaultRef.current = true;
    const px = normalizeToPx(defaultSize, orientation);
    if (typeof px === 'number' && Number.isFinite(px)) {
      applySize(px, 'init');
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Controlled size stays in sync with the prop.
  React.useLayoutEffect(() => {
    if (typeof size === 'undefined') return;
    const px = normalizeToPx(size, orientation);
    if (typeof px === 'number' && Number.isFinite(px)) {
      applySize(px, 'controlled');
    }
  }, [size, orientation, applySize]);

  return { currentSize, commitSize, persistenceAdapter };
}

interface UsePaneChangeNotifyOptions<T> {
  /** The pane's current internal mode. */
  value: T;
  /** Controlled prop resolved for the current breakpoint, or undefined when uncontrolled. */
  resolvedControlled: T | undefined;
  isControlled: boolean;
  /** Called for changes the consumer has not already driven through the controlled prop. */
  notify: (value: T, previous: T) => void;
}

/**
 * Emits open/state changes, and skips the ones that only mirror the controlled prop back to the
 * consumer. Shared by Left, Panel, Sidebar, Inspector and Bottom.
 */
export function usePaneChangeNotify<T>({ value, resolvedControlled, isControlled, notify }: UsePaneChangeNotifyOptions<T>) {
  const notifyRef = useLatest(notify);
  const previousValueRef = React.useRef<T | null>(null);
  const previousControlledRef = React.useRef<T | undefined>(undefined);

  React.useEffect(() => {
    const previousValue = previousValueRef.current;
    const controlledChanged = previousControlledRef.current !== resolvedControlled;

    if (previousValue !== null && previousValue !== value) {
      if (!isControlled || (!controlledChanged && value !== resolvedControlled)) {
        notifyRef.current(value, previousValue);
      }
    }

    previousValueRef.current = value;
    previousControlledRef.current = resolvedControlled;
  }, [value, resolvedControlled, isControlled, notifyRef]);
}

interface UsePaneExpandCollapseOptions<T> {
  mode: T;
  /** True while the pane counts as visible — Sidebar treats `thin` as visible. */
  isOpen: (mode: T) => boolean;
  breakpointReady: boolean;
  onExpand?: () => void;
  onCollapse?: () => void;
}

/**
 * Fires `onExpand`/`onCollapse` for real transitions only.
 *
 * The first run after the breakpoint resolves is skipped: that pass carries the initial state sync,
 * not a user action.
 */
export function usePaneExpandCollapse<T extends PaneMode | SidebarMode>({ mode, isOpen, breakpointReady, onExpand, onCollapse }: UsePaneExpandCollapseOptions<T>) {
  const onExpandRef = useLatest(onExpand);
  const onCollapseRef = useLatest(onCollapse);
  const isOpenRef = useLatest(isOpen);
  const previousModeRef = React.useRef<T | null>(null);
  const hasInitializedRef = React.useRef(false);

  React.useEffect(() => {
    if (!breakpointReady) {
      previousModeRef.current = mode;
      return;
    }

    if (!hasInitializedRef.current) {
      hasInitializedRef.current = true;
      previousModeRef.current = mode;
      return;
    }

    const previousMode = previousModeRef.current;
    if (previousMode === null || previousMode === mode) return;

    previousModeRef.current = mode;
    const wasOpen = isOpenRef.current(previousMode);
    const isNowOpen = isOpenRef.current(mode);
    if (!wasOpen && isNowOpen) onExpandRef.current?.();
    else if (wasOpen && !isNowOpen) onCollapseRef.current?.();
  }, [mode, breakpointReady, onExpandRef, onCollapseRef, isOpenRef]);
}

/**
 * Dev-only guard for panes that switch between controlled and uncontrolled.
 * The warning is stripped from production builds.
 */
export function useControlledSwitchWarning(componentName: string, prop: string, isControlled: boolean) {
  const wasControlledRef = React.useRef<boolean | null>(null);
  React.useEffect(() => {
    if (process.env.NODE_ENV === 'production') return;
    if (wasControlledRef.current === null) {
      wasControlledRef.current = isControlled;
      return;
    }
    if (wasControlledRef.current !== isControlled) {
      console.warn(`${componentName}: Switching between controlled and uncontrolled \`${prop}\` is not supported.`);
      wasControlledRef.current = isControlled;
    }
  }, [componentName, prop, isControlled]);
}

export { useLatest, clampSize };
