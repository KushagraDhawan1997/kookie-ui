import * as React from 'react';
import type { Breakpoint, PresentationValue, ResponsivePresentation } from './shell.types.js';
import { _BREAKPOINTS } from './shell.types.js';
import { useShell } from './shell.context.js';

/**
 * Breakpoint chain, widest first. Resolution walks down from the current breakpoint.
 */
const BREAKPOINT_FALLBACK_ORDER: Breakpoint[] = ([...(Object.keys(_BREAKPOINTS) as Array<keyof typeof _BREAKPOINTS>)].reverse() as Breakpoint[]).concat('initial' as Breakpoint);

/**
 * Resolve a responsive value against a breakpoint, without React.
 * Falls back through smaller breakpoints down to `initial`.
 */
function resolveResponsiveValue<T>(value: T | Partial<Record<Breakpoint, T>> | undefined, breakpoint: Breakpoint): T | undefined {
  if (value == null) return undefined;
  if (typeof value !== 'object') return value as T;

  const map = value as Partial<Record<Breakpoint, T>>;
  if (map[breakpoint] !== undefined) return map[breakpoint];

  const startIdx = BREAKPOINT_FALLBACK_ORDER.indexOf(breakpoint);
  for (let i = startIdx + 1; i < BREAKPOINT_FALLBACK_ORDER.length; i++) {
    const bp = BREAKPOINT_FALLBACK_ORDER[i];
    if (map[bp] !== undefined) return map[bp];
  }
  return undefined;
}

function useResponsivePresentation(presentation: ResponsivePresentation): PresentationValue {
  const { currentBreakpoint } = useShell();

  return React.useMemo(() => resolveResponsiveValue<PresentationValue>(presentation, currentBreakpoint) ?? 'fixed', [presentation, currentBreakpoint]);
}

/**
 * Resolve a responsive value (T or responsive map keyed by breakpoints) against the current Shell breakpoint.
 * If no value is defined for the current breakpoint, search smaller breakpoints down to 'initial'.
 * Returns undefined when passed a responsive map with no matching key across the chain.
 */
function useResponsiveValue<T>(value: T | Partial<Record<Breakpoint, T>> | undefined): T | undefined {
  const { currentBreakpoint } = useShell();

  return React.useMemo(() => resolveResponsiveValue<T>(value, currentBreakpoint), [value, currentBreakpoint]);
}

type ResponsiveStateValue<T> = T | Partial<Record<Breakpoint, T>>;

interface UseResponsiveInitialStateOptions<T> {
  controlledValue?: ResponsiveStateValue<T>;
  defaultValue?: ResponsiveStateValue<T>;
  currentValue: T;
  setValue: (value: T) => void;
  breakpointReady: boolean;
  onInit?: (value: T) => void;
  onResponsiveChange?: (value: T) => void;
  controlledIsResponsive?: boolean;
}

interface UseResponsiveInitialStateResult<T> {
  resolvedControlled?: T;
  resolvedDefault?: T;
}

function useResponsiveInitialState<T>({
  controlledValue,
  defaultValue,
  currentValue,
  setValue,
  breakpointReady,
  onInit,
  onResponsiveChange,
  controlledIsResponsive = false,
}: UseResponsiveInitialStateOptions<T>): UseResponsiveInitialStateResult<T> {
  const resolvedControlled = useResponsiveValue(controlledValue);
  const resolvedDefault = useResponsiveValue(defaultValue);

  const lastControlledRef = React.useRef<T | undefined>(undefined);
  const pendingSyncRef = React.useRef<ReturnType<typeof setTimeout> | null>(null);
  const latestControlledRef = React.useRef<T | undefined>(resolvedControlled);
  const latestValueRef = React.useRef(currentValue);
  const setValueRef = React.useRef(setValue);

  React.useLayoutEffect(() => {
    latestControlledRef.current = resolvedControlled;
    latestValueRef.current = currentValue;
    setValueRef.current = setValue;
  });

  React.useEffect(() => {
    if (resolvedControlled === undefined) return;

    const prevControlled = lastControlledRef.current;
    const controlledChanged = prevControlled !== resolvedControlled;
    lastControlledRef.current = resolvedControlled;

    if (currentValue === resolvedControlled) {
      if (pendingSyncRef.current) {
        clearTimeout(pendingSyncRef.current);
        pendingSyncRef.current = null;
      }
      if (controlledIsResponsive) {
        onResponsiveChange?.(resolvedControlled);
      }
      return;
    }

    if (controlledChanged) {
      if (pendingSyncRef.current) {
        clearTimeout(pendingSyncRef.current);
        pendingSyncRef.current = null;
      }
      setValue(resolvedControlled);
      if (controlledIsResponsive) {
        onResponsiveChange?.(resolvedControlled);
      }
      return;
    }

    if (!pendingSyncRef.current) {
      pendingSyncRef.current = setTimeout(() => {
        pendingSyncRef.current = null;
        const latestControlled = latestControlledRef.current;
        const latestValue = latestValueRef.current;
        if (latestControlled === undefined) return;
        if (latestValue === latestControlled) return;
        setValueRef.current(latestControlled);
      }, 0);
    }
  }, [resolvedControlled, currentValue, setValue, onResponsiveChange, controlledIsResponsive]);

  React.useEffect(() => {
    return () => {
      if (pendingSyncRef.current) {
        clearTimeout(pendingSyncRef.current);
        pendingSyncRef.current = null;
      }
    };
  }, []);

  const didInitRef = React.useRef(false);
  React.useEffect(() => {
    if (didInitRef.current) return;
    if (!breakpointReady) return;
    if (typeof controlledValue !== 'undefined') return;
    if (resolvedDefault === undefined) return;
    didInitRef.current = true;
    if (currentValue !== resolvedDefault) {
      setValue(resolvedDefault);
    }
    onInit?.(resolvedDefault);
  }, [breakpointReady, controlledValue, resolvedDefault, currentValue, setValue, onInit]);

  return { resolvedControlled, resolvedDefault };
}

export { useResponsivePresentation, useResponsiveValue, useResponsiveInitialState, resolveResponsiveValue };
