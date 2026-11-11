'use client';

/**
 * The Shell's state model (0.8.0), ported from kookie-ui-v2's Shell.
 *
 * - State lives on the pane. Each pane holds `auto | open | closed`.
 *   `auto` means untouched: the stylesheet decides what
 *   it shows at each breakpoint, so first paint is right with no script, the
 *   server and the client render the same markup, and no open-state callback
 *   can fire on mount or on a resize.
 * - The one thing that crosses the Shell is a registry keyed by pane name.
 *   Each pane registers what it is and how to drive it; a Trigger looks its
 *   pane up, and the Root reads the set of live overlays. Nothing scans
 *   children and nothing checks `displayName`.
 * - The responsive props are resolved into a table with one value per
 *   breakpoint, from the props alone, with no window. The table is written to
 *   the DOM as data attributes for the stylesheet, and read again in JS by the
 *   mirror that sets `aria-expanded`. One table, two readers, so they agree by
 *   construction.
 */
import * as React from 'react';
import { useLayoutEffect } from 'radix-ui/internal';
import { SHELL_BREAKPOINTS } from '../shell.types.js';
import type { Breakpoint, PaneName, PresentationValue } from '../shell.types.js';

/* ── Breakpoint tables ─────────────────────────────────────────────────────── */

export type Table<T> = Record<Breakpoint, T>;

/** What a pane shows: open or closed. */
export type PaneValue = 'open' | 'closed';

type ResponsiveInput<T> = T | Partial<Record<Breakpoint, T>> | undefined;

function isMap<T>(value: ResponsiveInput<T>): value is Partial<Record<Breakpoint, T>> {
  return typeof value === 'object' && value !== null;
}

/**
 * A responsive value at every breakpoint. A breakpoint takes the largest key
 * at or below it, the same fallback `useResponsiveValue` used; a breakpoint
 * below every key takes `fallback`.
 */
export function tableOf<T>(value: ResponsiveInput<T>, fallback: (bp: Breakpoint) => T): Table<T> {
  const table = {} as Table<T>;
  let carried: { value: T } | null = null;
  for (const bp of SHELL_BREAKPOINTS) {
    if (value !== undefined && !isMap(value)) {
      table[bp] = value;
      continue;
    }
    const entry = isMap(value) ? value[bp] : undefined;
    if (entry !== undefined) carried = { value: entry };
    table[bp] = carried ? carried.value : fallback(bp);
  }
  return table;
}

/** The table's one value, when it has only one. */
export function constantOf<T>(table: Table<T>): T | undefined {
  const first = table.initial;
  return SHELL_BREAKPOINTS.every((bp) => table[bp] === first) ? first : undefined;
}

/**
 * The table as data attributes: `data-<name>` when it holds one value, one
 * `data-<name>-<bp>` per breakpoint when it holds several. The stylesheet has
 * a rule for each spelling.
 */
export function tableAttributes(name: string, table: Table<string>): Record<string, string> {
  const constant = constantOf(table);
  if (constant !== undefined) return { [`data-${name}`]: constant };
  const attributes: Record<string, string> = {};
  for (const bp of SHELL_BREAKPOINTS) attributes[`data-${name}-${bp}`] = table[bp];
  return attributes;
}

/**
 * A responsive prop object is usually an inline literal, a new identity every
 * render. Keying memoisation on its contents keeps the tables, and so the
 * registry entries, stable across renders that change nothing.
 */
export function useStableKey(value: unknown): string {
  return typeof value === 'object' && value !== null ? JSON.stringify(value) : String(value);
}

export const FIXED_TABLE: Table<PresentationValue> = tableOf<PresentationValue>('fixed', () => 'fixed');

/* ── The registry ──────────────────────────────────────────────────────────── */

export type OpenChangeReason = 'toggle' | 'dismiss';

export type PaneEntry = {
  name: PaneName;
  id: string;
  el: HTMLElement | null;
  /** What the pane shows now; `undefined` while an untouched pane cannot know (before the breakpoint is known). */
  value: PaneValue | undefined;
  /** How the pane is presented now, when known. */
  presentation: PresentationValue | undefined;
  /** The pane's own presentation at every breakpoint. A Panel with none of its own follows the Rail's. */
  presentationTable: Table<PresentationValue>;
  /** Open and presented as an overlay: what the scrim and Escape close, and what containment exempts. */
  overlayLive: boolean;
  /** The pane's designed open width, for panes that sit beside it when floating. */
  size: number;
  setValue: (value: PaneValue, reason: OpenChangeReason) => void;
  toggle: (reason: OpenChangeReason) => void;
};

export type ShellStore = {
  entries: Map<PaneName, PaneEntry>;
  listeners: Set<() => void>;
  /**
   * What a subscriber reads. useSyncExternalStore needs a value that is stable
   * between notifications, and a number is; the Map, or anything derived from
   * it, would be a new identity on every read.
   */
  version: number;
};

export function createShellStore(): ShellStore {
  return { entries: new Map(), listeners: new Set(), version: 0 };
}

export function notifyShellStore(store: ShellStore) {
  store.version += 1;
  for (const listener of store.listeners) listener();
}

export function subscribeShellStore(store: ShellStore, listener: () => void) {
  store.listeners.add(listener);
  return () => {
    store.listeners.delete(listener);
  };
}

export const ShellStoreContext = React.createContext<ShellStore | null>(null);

export function useShellStore(part: string): ShellStore {
  const store = React.useContext(ShellStoreContext);
  if (!store) throw new Error(`${part} must be used within <Shell.Root>`);
  return store;
}

/** One pane's registry entry. Re-renders only when that entry is replaced. */
export function usePaneEntry(store: ShellStore, name: PaneName): PaneEntry | undefined {
  const subscribe = React.useCallback((listener: () => void) => subscribeShellStore(store, listener), [store]);
  const getSnapshot = React.useCallback(() => store.entries.get(name), [store, name]);
  return React.useSyncExternalStore(subscribe, getSnapshot, () => undefined);
}

/* ── Off the frame ─────────────────────────────────────────────────────────── */

export type FramePaneId = 'rail' | 'panel' | 'sidebar' | 'content' | 'inspector' | 'bottom';

export const ShellFrameContext = React.createContext<{
  registerOffFrame: (id: FramePaneId) => void;
  unregisterOffFrame: (id: FramePaneId) => void;
} | null>(null);

/** Tells the Root a pane is off the frame (`flush={false}`); the Rail's card moves a floating Panel over. */
export function useFrameRegistration(id: FramePaneId, flush: boolean) {
  const ctx = React.useContext(ShellFrameContext);
  if (!ctx) throw new Error('Shell panes must be used within <Shell.Root>');
  const { registerOffFrame, unregisterOffFrame } = ctx;
  useLayoutEffect(() => {
    if (flush) return;
    registerOffFrame(id);
    return () => unregisterOffFrame(id);
  }, [id, flush, registerOffFrame, unregisterOffFrame]);
}
