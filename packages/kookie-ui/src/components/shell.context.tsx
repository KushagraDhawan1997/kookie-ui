'use client';

/**
 * The Shell has two contexts: the pane registry (the store) and the set of panes off the frame.
 * They live in `_internal/shell-store.tsx`. This module keeps the hook consumers can reach:
 * `useSidebarMode`.
 */
import * as React from 'react';
import type { SidebarMode } from './shell.types.js';
import { subscribeShellStore, useShellStore, type PaneValue } from './_internal/shell-store.js';

const toSidebarMode = (value: PaneValue | undefined): SidebarMode | undefined => (value === undefined ? undefined : value === 'closed' ? 'collapsed' : 'expanded');

const fromSidebarMode = (mode: SidebarMode): PaneValue => (mode === 'collapsed' ? 'closed' : 'open');

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
