'use client';

/**
 * Since 0.8.0 the Shell has two contexts: the pane registry (the store) and
 * the inset set. They live in `_internal/shell-store.tsx`. This module keeps
 * the two hooks consumers can reach: `useSidebarMode`, and the deprecated
 * `useShell`.
 */
import * as React from 'react';
import { useBreakpoint } from '../hooks/use-breakpoint.js';
import type { Breakpoint, PaneMode, PaneName, PaneTarget, SidebarMode } from './shell.types.js';
import { setShellPeek, subscribeShellStore, useShellStore, warnOnce, type PaneValue, type ShellStore } from './_internal/shell-store.js';

const toSidebarMode = (value: PaneValue | undefined): SidebarMode | undefined => (value === undefined ? undefined : value === 'closed' ? 'collapsed' : value === 'thin' ? 'thin' : 'expanded');

const fromSidebarMode = (mode: SidebarMode): PaneValue => (mode === 'collapsed' ? 'closed' : mode === 'thin' ? 'thin' : 'open');

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
  panelMode: PaneMode;
  sidebarMode: SidebarMode;
  inspectorMode: PaneMode;
  bottomMode: PaneMode;
  peekTarget: PaneTarget | null;
  currentBreakpoint: Breakpoint;
  currentBreakpointReady: boolean;
  togglePane: (target: PaneTarget) => void;
  expandPane: (target: PaneTarget) => void;
  collapsePane: (target: PaneTarget) => void;
  peekPane: (target: PaneTarget) => void;
  clearPeek: () => void;
}

/**
 * @deprecated The whole-shell reader re-renders its consumer on every change
 * to any pane. Use `Shell.Trigger` to drive a pane, `Shell.useSidebarMode`
 * for the Sidebar, and each pane's `open`/`onOpenChange` for its state.
 * Removed in 1.0.
 */
export function useShell(): ShellContextValue {
  const store = useShellStore('useShell');
  React.useEffect(() => {
    warnOnce("Shell.useShell is deprecated and is removed in 1.0. Use Shell.Trigger, Shell.useSidebarMode, or a pane's own open/onOpenChange.");
  }, []);
  useStoreVersion(store);
  const { breakpoint, ready } = useBreakpoint();
  const actions = React.useMemo(
    () => ({
      togglePane: (target: PaneTarget) => store.entries.get(paneName(target))?.toggle('toggle'),
      expandPane: (target: PaneTarget) => store.entries.get(paneName(target))?.setValue('open', 'toggle'),
      collapsePane: (target: PaneTarget) => store.entries.get(paneName(target))?.setValue('closed', 'toggle'),
      peekPane: (target: PaneTarget) => setShellPeek(store, paneName(target)),
      clearPeek: () => setShellPeek(store, null),
    }),
    [store],
  );
  const value = (name: PaneName) => store.entries.get(name)?.value;
  return {
    leftMode: toPaneMode(value('rail')),
    panelMode: toPaneMode(value('panel')),
    sidebarMode: toSidebarMode(value('sidebar')) ?? 'expanded',
    inspectorMode: toPaneMode(value('inspector')),
    bottomMode: toPaneMode(value('bottom')),
    peekTarget: store.peek,
    currentBreakpoint: breakpoint,
    currentBreakpointReady: ready,
    ...actions,
  };
}
