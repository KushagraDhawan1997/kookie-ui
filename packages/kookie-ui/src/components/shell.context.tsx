'use client';

/**
 * Since 0.8.0 the Shell has two contexts: the pane registry (the store) and
 * the inset set. They live in `_internal/shell-store.tsx`. This module keeps
 * the two hooks consumers can reach: `useSidebarMode`, and the deprecated
 * `useShell`.
 */
import * as React from 'react';
import { useBreakpoint } from '../hooks/use-breakpoint.js';
import type { Breakpoint, PaneMode, PaneName, PaneTarget, PresentationValue, SidebarMode } from './shell.types.js';
import { setShellPeek, subscribeShellStore, useShellStore, warnOnce, type PaneValue, type ShellStore } from './_internal/shell-store.js';

const toSidebarMode = (value: PaneValue | undefined): SidebarMode | undefined => (value === undefined ? undefined : value === 'closed' ? 'collapsed' : 'expanded');

const fromSidebarMode = (mode: SidebarMode): PaneValue => (mode === 'collapsed' ? 'closed' : 'open');

const toPaneMode = (value: PaneValue | undefined): PaneMode => (value === undefined || value === 'closed' ? 'collapsed' : 'expanded');

const paneName = (target: PaneTarget): PaneName => (target === 'left' ? 'rail' : target);

/** Re-renders on every change to the registry. For the deprecated whole-shell reader only. */
function useStoreVersion(store: ShellStore) {
  const subscribe = React.useCallback((listener: () => void) => subscribeShellStore(store, listener), [store]);
  return React.useSyncExternalStore(
    subscribe,
    () => store.version,
    () => 0,
  );
}

/**
 * The Sidebar's mode, and a setter. The setter is a user action: it reports
 * through the Sidebar's `onStateChange` the way a Trigger does.
 */
export function useSidebarMode(): { sidebarMode: SidebarMode; setSidebarMode: (mode: SidebarMode) => void } {
  const store = useShellStore('useSidebarMode');
  const subscribe = React.useCallback((listener: () => void) => subscribeShellStore(store, listener), [store]);
  const value = React.useSyncExternalStore(
    subscribe,
    () => store.entries.get('sidebar')?.value,
    () => undefined,
  );
  const setSidebarMode = React.useCallback(
    (mode: SidebarMode) => {
      store.entries.get('sidebar')?.setValue(fromSidebarMode(mode), 'toggle');
    },
    [store],
  );
  return { sidebarMode: toSidebarMode(value) ?? 'expanded', setSidebarMode };
}

export interface ShellContextValue {
  leftMode: PaneMode;
  setLeftMode: (mode: PaneMode) => void;
  /** The Rail's open state, resolved, when it is controlled. */
  leftControlledOpen?: boolean;
  panelMode: PaneMode;
  setPanelMode: (mode: PaneMode) => void;
  sidebarMode: SidebarMode;
  setSidebarMode: (mode: SidebarMode) => void;
  inspectorMode: PaneMode;
  setInspectorMode: (mode: PaneMode) => void;
  bottomMode: PaneMode;
  setBottomMode: (mode: PaneMode) => void;
  peekTarget: PaneTarget | null;
  setPeekTarget: (target: PaneTarget | null) => void;
  peekPane: (target: PaneTarget) => void;
  clearPeek: () => void;
  /** Whether a Rail is mounted. */
  hasLeft: boolean;
  /** No effect since 0.8.0: the registry knows which panes are mounted. */
  setHasLeft: (has: boolean) => void;
  /** Whether a Sidebar is mounted. */
  hasSidebar: boolean;
  /** No effect since 0.8.0: the registry knows which panes are mounted. */
  setHasSidebar: (has: boolean) => void;
  currentBreakpoint: Breakpoint;
  currentBreakpointReady: boolean;
  /** The Rail's presentation at the current breakpoint, when known. */
  leftResolvedPresentation?: PresentationValue;
  togglePane: (target: PaneTarget) => void;
  expandPane: (target: PaneTarget) => void;
  collapsePane: (target: PaneTarget) => void;
}

const noop = () => {};

/**
 * @deprecated The whole-shell reader re-renders its consumer on every change
 * to any pane. Use `Shell.Trigger` to drive a pane, `Shell.useSidebarMode`
 * for the Sidebar, and each pane's `open`/`onOpenChange` for its state.
 * Removed in 1.0.
 *
 * Keeps 0.7's shape. The setters act as a user would: they report through
 * the pane's own callback with `reason: 'toggle'`, and a controlled pane
 * changes only when the app passes the new value.
 */
export function useShell(): ShellContextValue {
  const store = useShellStore('useShell');
  React.useEffect(() => {
    warnOnce("Shell.useShell is deprecated and is removed in 1.0. Use Shell.Trigger, Shell.useSidebarMode, or a pane's own open/onOpenChange.");
  }, []);
  useStoreVersion(store);
  const { breakpoint, ready } = useBreakpoint();
  const actions = React.useMemo(() => {
    const setMode = (name: PaneName) => (mode: PaneMode) => store.entries.get(name)?.setValue(mode === 'collapsed' ? 'closed' : 'open', 'toggle');
    const setPeekTarget = (target: PaneTarget | null) => setShellPeek(store, target === null ? null : paneName(target));
    return {
      setLeftMode: setMode('rail'),
      setPanelMode: setMode('panel'),
      setInspectorMode: setMode('inspector'),
      setBottomMode: setMode('bottom'),
      setSidebarMode: (mode: SidebarMode) => store.entries.get('sidebar')?.setValue(fromSidebarMode(mode), 'toggle'),
      setPeekTarget,
      peekPane: (target: PaneTarget) => setPeekTarget(target),
      clearPeek: () => setPeekTarget(null),
      setHasLeft: noop,
      setHasSidebar: noop,
      togglePane: (target: PaneTarget) => store.entries.get(paneName(target))?.toggle('toggle'),
      expandPane: (target: PaneTarget) => store.entries.get(paneName(target))?.setValue('open', 'toggle'),
      collapsePane: (target: PaneTarget) => store.entries.get(paneName(target))?.setValue('closed', 'toggle'),
    };
  }, [store]);
  const value = (name: PaneName) => store.entries.get(name)?.value;
  const rail = store.entries.get('rail');
  return {
    leftMode: toPaneMode(value('rail')),
    leftControlledOpen: rail?.value === undefined ? undefined : rail.value !== 'closed',
    panelMode: toPaneMode(value('panel')),
    sidebarMode: toSidebarMode(value('sidebar')) ?? 'expanded',
    inspectorMode: toPaneMode(value('inspector')),
    bottomMode: toPaneMode(value('bottom')),
    peekTarget: store.peek,
    hasLeft: store.entries.has('rail'),
    hasSidebar: store.entries.has('sidebar'),
    currentBreakpoint: breakpoint,
    currentBreakpointReady: ready,
    leftResolvedPresentation: rail?.presentation,
    ...actions,
  };
}
