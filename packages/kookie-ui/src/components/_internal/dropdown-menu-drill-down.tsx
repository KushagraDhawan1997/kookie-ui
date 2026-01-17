'use client';

import * as React from 'react';
import type { Breakpoint, Responsive } from '../../props/prop-def.js';
import type { submenuBehaviors } from './base-menu.props.js';
import { _BREAKPOINTS } from '../shell.types.js';

type SubmenuBehavior = (typeof submenuBehaviors)[number];

/**
 * Hook to get the current breakpoint based on window width.
 * Returns 'initial' on the server and during initial hydration.
 * Uses shared breakpoint values from shell.types.js.
 */
function useBreakpoint(): { breakpoint: Breakpoint; ready: boolean } {
  const [currentBp, setCurrentBp] = React.useState<Breakpoint>('initial');
  const [ready, setReady] = React.useState(false);

  React.useEffect(() => {
    if (typeof window === 'undefined') return;

    // Use shared breakpoint media queries from shell.types
    const queries = Object.entries(_BREAKPOINTS) as [keyof typeof _BREAKPOINTS, string][];
    const mqls = queries.map(([k, q]) => [k, window.matchMedia(q)] as const);

    const compute = () => {
      // Highest matched breakpoint wins
      const matched = mqls.filter(([, m]) => m.matches).map(([k]) => k);
      const next = (matched[matched.length - 1] as Breakpoint | undefined) ?? 'initial';
      setCurrentBp(next);
      setReady(true);
    };

    compute();

    const cleanups: Array<() => void> = [];
    mqls.forEach(([, m]) => {
      const mm = m as MediaQueryList & {
        addEventListener?: (type: 'change', listener: () => void) => void;
        removeEventListener?: (type: 'change', listener: () => void) => void;
        addListener?: (listener: () => void) => void;
        removeListener?: (listener: () => void) => void;
      };
      if (typeof mm.addEventListener === 'function') {
        mm.addEventListener('change', compute);
        cleanups.push(() => mm.removeEventListener?.('change', compute));
      } else if (typeof mm.addListener === 'function') {
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
          // Log in development to aid debugging
          if (process.env.NODE_ENV !== 'production') {
            console.warn('[DropdownMenu] MediaQueryList cleanup warning:', e);
          }
        }
      });
    };
  }, []);

  return { breakpoint: currentBp, ready };
}

/**
 * Resolves a responsive value to its current value based on the breakpoint.
 * Falls back through smaller breakpoints if the current one isn't defined.
 */
function resolveResponsiveValue<T>(
  value: T | Partial<Record<Breakpoint, T>> | undefined,
  currentBreakpoint: Breakpoint,
  defaultValue: T
): T {
  if (value === undefined || value === null) {
    return defaultValue;
  }

  // Non-object values are returned directly
  if (typeof value !== 'object') {
    return value;
  }

  const map = value as Partial<Record<Breakpoint, T>>;

  // Check if current breakpoint has a value
  if (map[currentBreakpoint] !== undefined) {
    return map[currentBreakpoint] as T;
  }

  // Fall back through smaller breakpoints
  const bpOrder: Breakpoint[] = ['xl', 'lg', 'md', 'sm', 'xs', 'initial'];
  const startIdx = bpOrder.indexOf(currentBreakpoint);

  for (let i = startIdx + 1; i < bpOrder.length; i++) {
    const bp = bpOrder[i];
    if (map[bp] !== undefined) {
      return map[bp] as T;
    }
  }

  return defaultValue;
}

// ============================================================================
// DrillDown Context
// ============================================================================

type AnimationDirection = 'forward' | 'backward' | null;

/**
 * Stable actions context - callbacks that don't change identity.
 * Separated from state to prevent unnecessary re-renders of components
 * that only need to call push/pop/reset.
 */
interface DrillDownActionsContextValue {
  /** Navigate into a submenu */
  push: (id: string) => void;
  /** Navigate back to parent menu */
  pop: () => void;
  /** Reset to root menu */
  reset: () => void;
}

/**
 * Mutable state context - values that change when navigation occurs.
 * Subscribers to this context will re-render on stack changes.
 */
interface DrillDownStateContextValue {
  /** Current submenu behavior mode */
  behavior: SubmenuBehavior;
  /** Whether the breakpoint has been resolved (client-side only) */
  ready: boolean;
  /** Stack of active submenu IDs. Empty means root menu is shown. */
  stack: string[];
  /** Check if a specific submenu is the currently active one */
  isActive: (id: string) => boolean;
  /** Check if we're at root level (no submenus open) */
  isRoot: boolean;
  /** The currently active submenu ID (or null if at root) */
  currentId: string | null;
  /** Current animation direction for transitions */
  animationDirection: AnimationDirection;
}

/** Combined context value for backwards compatibility */
interface DrillDownContextValue extends DrillDownActionsContextValue, DrillDownStateContextValue {}

const DrillDownActionsContext = React.createContext<DrillDownActionsContextValue | null>(null);
const DrillDownStateContext = React.createContext<DrillDownStateContextValue | null>(null);

// Legacy combined context for backwards compatibility
const DrillDownContext = React.createContext<DrillDownContextValue | null>(null);

interface DrillDownProviderProps {
  children: React.ReactNode;
  submenuBehavior: Responsive<SubmenuBehavior> | undefined;
}

function DrillDownProvider({ children, submenuBehavior }: DrillDownProviderProps) {
  const { breakpoint, ready } = useBreakpoint();
  const [stack, setStack] = React.useState<string[]>([]);
  const [animationDirection, setAnimationDirection] = React.useState<AnimationDirection>(null);

  // Resolve the current behavior based on breakpoint
  const behavior = React.useMemo(
    () => resolveResponsiveValue(submenuBehavior, breakpoint, 'cascade'),
    [submenuBehavior, breakpoint]
  );

  // Reset stack when behavior changes from drill-down to cascade
  const prevBehaviorRef = React.useRef(behavior);
  React.useEffect(() => {
    if (prevBehaviorRef.current === 'drill-down' && behavior === 'cascade') {
      setStack([]);
      setAnimationDirection(null);
    }
    prevBehaviorRef.current = behavior;
  }, [behavior]);

  // Stable action callbacks - these never change identity
  const push = React.useCallback((id: string) => {
    setAnimationDirection('forward');
    setStack((prev) => [...prev, id]);
  }, []);

  const pop = React.useCallback(() => {
    setAnimationDirection('backward');
    setStack((prev) => prev.slice(0, -1));
  }, []);

  const reset = React.useCallback(() => {
    setStack([]);
    setAnimationDirection(null);
  }, []);

  // Memoize actions context value - completely stable, never changes
  const actionsValue = React.useMemo(
    (): DrillDownActionsContextValue => ({ push, pop, reset }),
    [push, pop, reset]
  );

  // isActive depends on stack - this is expected to change
  const isActive = React.useCallback(
    (id: string) => {
      if (stack.length === 0) return false;
      return stack[stack.length - 1] === id;
    },
    [stack]
  );

  // Memoize state context value - changes when stack/behavior changes
  const stateValue = React.useMemo(
    (): DrillDownStateContextValue => ({
      behavior,
      ready,
      stack,
      isActive,
      isRoot: stack.length === 0,
      currentId: stack.length > 0 ? stack[stack.length - 1] : null,
      animationDirection,
    }),
    [behavior, ready, stack, isActive, animationDirection]
  );

  // Combined value for legacy context
  const combinedValue = React.useMemo(
    (): DrillDownContextValue => ({ ...actionsValue, ...stateValue }),
    [actionsValue, stateValue]
  );

  return (
    <DrillDownActionsContext.Provider value={actionsValue}>
      <DrillDownStateContext.Provider value={stateValue}>
        <DrillDownContext.Provider value={combinedValue}>
          {children}
        </DrillDownContext.Provider>
      </DrillDownStateContext.Provider>
    </DrillDownActionsContext.Provider>
  );
}

function useDrillDown() {
  const ctx = React.useContext(DrillDownContext);
  if (!ctx) {
    throw new Error('useDrillDown must be used within a DropdownMenu.Content');
  }
  return ctx;
}

/**
 * Hook to check if drill-down context is available (i.e., we're inside Content)
 */
function useDrillDownOptional() {
  return React.useContext(DrillDownContext);
}

/**
 * Hook to access only the stable action callbacks (push, pop, reset).
 * Use this in components that only need to trigger navigation,
 * not react to state changes. Prevents unnecessary re-renders.
 */
function useDrillDownActions() {
  const ctx = React.useContext(DrillDownActionsContext);
  if (!ctx) {
    throw new Error('useDrillDownActions must be used within a DropdownMenu.Content');
  }
  return ctx;
}

/**
 * Hook to access drill-down state (behavior, stack, isActive, etc.).
 * Components using this will re-render when navigation state changes.
 */
function useDrillDownState() {
  const ctx = React.useContext(DrillDownStateContext);
  if (!ctx) {
    throw new Error('useDrillDownState must be used within a DropdownMenu.Content');
  }
  return ctx;
}

/**
 * Optional version of useDrillDownActions for components that may be outside Content.
 */
function useDrillDownActionsOptional() {
  return React.useContext(DrillDownActionsContext);
}

/**
 * Optional version of useDrillDownState for components that may be outside Content.
 */
function useDrillDownStateOptional() {
  return React.useContext(DrillDownStateContext);
}

// ============================================================================
// Sub Context (for individual submenu instances)
// ============================================================================

interface SubContextValue {
  /** Unique ID for this submenu */
  id: string;
  /** Label for the back button */
  label: React.ReactNode;
}

const SubContext = React.createContext<SubContextValue | null>(null);

function useSubContext() {
  return React.useContext(SubContext);
}

export {
  DrillDownProvider,
  DrillDownContext,
  DrillDownActionsContext,
  DrillDownStateContext,
  SubContext,
  useDrillDown,
  useDrillDownOptional,
  useDrillDownActions,
  useDrillDownActionsOptional,
  useDrillDownState,
  useDrillDownStateOptional,
  useSubContext,
  useBreakpoint,
  resolveResponsiveValue,
};

export type {
  SubmenuBehavior,
  DrillDownContextValue,
  DrillDownActionsContextValue,
  DrillDownStateContextValue,
  SubContextValue,
  AnimationDirection,
};
