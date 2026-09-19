'use client';

import * as React from 'react';
import { _BREAKPOINTS, type Breakpoint } from '../components/shell.types.js';

const QUERIES = Object.entries(_BREAKPOINTS) as Array<[Breakpoint, string]>;

type Listener = () => void;

/**
 * One set of `MediaQueryList`s and one set of listeners for the whole
 * application. Every component that asks for the breakpoint used to create and
 * subscribe to its own copy of all five queries.
 */
let mediaQueryLists: Array<[Breakpoint, MediaQueryList]> | null = null;
const listeners = new Set<Listener>();
let cachedBreakpoint: Breakpoint | null = null;

function getMediaQueryLists() {
  mediaQueryLists ??= QUERIES.map(([name, query]) => [name, window.matchMedia(query)] as [Breakpoint, MediaQueryList]);
  return mediaQueryLists;
}

function computeBreakpoint(): Breakpoint {
  // The largest matching query wins; `_BREAKPOINTS` is ordered smallest first.
  let matched: Breakpoint = 'initial';
  for (const [name, mql] of getMediaQueryLists()) {
    if (mql.matches) matched = name;
  }
  return matched;
}

function handleChange() {
  const next = computeBreakpoint();
  if (next === cachedBreakpoint) return;
  cachedBreakpoint = next;
  listeners.forEach((listener) => listener());
}

function subscribe(listener: Listener) {
  if (typeof window === 'undefined') return () => {};

  if (listeners.size === 0) {
    cachedBreakpoint = computeBreakpoint();
    for (const [, mql] of getMediaQueryLists()) {
      // Safari below 14 only has the deprecated listener API.
      if (typeof mql.addEventListener === 'function') mql.addEventListener('change', handleChange);
      else mql.addListener?.(handleChange);
    }
  }

  listeners.add(listener);

  return () => {
    listeners.delete(listener);
    if (listeners.size > 0) return;

    for (const [, mql] of getMediaQueryLists()) {
      try {
        if (typeof mql.removeEventListener === 'function') mql.removeEventListener('change', handleChange);
        else mql.removeListener?.(handleChange);
      } catch (error) {
        // Removal can throw in edge cases, e.g. the list was already torn down.
        if (process.env.NODE_ENV !== 'production') {
          console.warn('[useBreakpoint] MediaQueryList cleanup warning:', error);
        }
      }
    }
    cachedBreakpoint = null;
  };
}

/**
 * `getSnapshot` must return a referentially stable value between changes, so it
 * reads the cache that `handleChange` maintains rather than recomputing.
 */
function getSnapshot(): Breakpoint {
  if (typeof window === 'undefined') return 'initial';
  cachedBreakpoint ??= computeBreakpoint();
  return cachedBreakpoint;
}

function getServerSnapshot(): Breakpoint {
  return 'initial';
}

const getReadySnapshot = () => true;
const getReadyServerSnapshot = () => false;

const noopSubscribe = () => () => {};
const getInitialSnapshot = (): Breakpoint => 'initial';

/**
 * The current breakpoint, and whether it has been resolved against a real
 * viewport yet (`false` on the server and during hydration).
 *
 * Reads through `useSyncExternalStore` rather than settling into state from an
 * effect. On a client render the very first pass already has the real
 * breakpoint, instead of rendering the whole shell at `initial` and correcting
 * it after the browser has painted.
 *
 * Pass `enabled = false` to skip the subscription (the breakpoint then reads as
 * `initial`).
 */
export function useBreakpoint(enabled = true): { breakpoint: Breakpoint; ready: boolean } {
  // Callers with a non-responsive value pass `enabled = false` so they neither
  // subscribe to the media queries nor re-render when the viewport crosses one.
  const breakpoint = React.useSyncExternalStore(
    enabled ? subscribe : noopSubscribe,
    enabled ? getSnapshot : getInitialSnapshot,
    getServerSnapshot,
  );
  const ready = React.useSyncExternalStore(
    enabled ? subscribe : noopSubscribe,
    getReadySnapshot,
    getReadyServerSnapshot,
  );

  return React.useMemo(() => ({ breakpoint, ready }), [breakpoint, ready]);
}
