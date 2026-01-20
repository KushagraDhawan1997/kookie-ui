'use client';

import * as React from 'react';
import { _BREAKPOINTS, type Breakpoint } from '../components/shell.types.js';

/**
 * Hook to get the current breakpoint based on window width.
 * Returns 'initial' on the server and during initial hydration.
 * Uses shared breakpoint values from shell.types.js.
 */
export function useBreakpoint(): { breakpoint: Breakpoint; ready: boolean } {
  const [currentBp, setCurrentBp] = React.useState<Breakpoint>('initial');
  const [ready, setReady] = React.useState(false);

  React.useEffect(() => {
    if (typeof window === 'undefined') return;

    const queries = Object.entries(_BREAKPOINTS) as [keyof typeof _BREAKPOINTS, string][];
    const mqls = queries.map(([k, q]) => [k, window.matchMedia(q)] as const);

    // Accept optional event param to satisfy MediaQueryList listener signature
    const compute = (_e?: MediaQueryListEvent) => {
      // Highest matched wins
      const matched = mqls.filter(([, m]) => m.matches).map(([k]) => k);
      const next = (matched[matched.length - 1] as Breakpoint | undefined) ?? 'initial';
      setCurrentBp(next);
      setReady(true);
    };

    compute();
    const cleanups: Array<() => void> = [];
    mqls.forEach(([, m]) => {
      const mm = m as MediaQueryList & {
        addEventListener?: (type: 'change', listener: (e: MediaQueryListEvent) => void) => void;
        removeEventListener?: (type: 'change', listener: (e: MediaQueryListEvent) => void) => void;
        addListener?: (listener: (e: MediaQueryListEvent) => void) => void;
        removeListener?: (listener: (e: MediaQueryListEvent) => void) => void;
      };
      if (typeof mm.addEventListener === 'function' && typeof mm.removeEventListener === 'function') {
        mm.addEventListener('change', compute);
        cleanups.push(() => mm.removeEventListener?.('change', compute));
      } else if (typeof mm.addListener === 'function' && typeof mm.removeListener === 'function') {
        mm.addListener(compute);
        cleanups.push(() => mm.removeListener?.(compute));
      }
    });

    return () => {
      cleanups.forEach((fn) => {
        try {
          fn();
        } catch (e) {
          // MediaQueryList cleanup can fail in edge cases (e.g., already removed)
          if (process.env.NODE_ENV !== 'production') {
            console.warn('[useBreakpoint] MediaQueryList cleanup warning:', e);
          }
        }
      });
    };
  }, []);

  return { breakpoint: currentBp, ready };
}
