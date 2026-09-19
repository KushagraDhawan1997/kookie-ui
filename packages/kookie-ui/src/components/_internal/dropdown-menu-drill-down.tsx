'use client';

import * as React from 'react';

import type { submenuBehaviors } from './base-menu.props.js';

type SubmenuBehavior = (typeof submenuBehaviors)[number];

/*
 * Drill-down navigation for DropdownMenu.
 *
 * The stack of open submenus lives in a small external store rather than in
 * React state, so each part subscribes only to the slice it renders from:
 * a panel re-renders when it enters or leaves the stack, a Sub when its own
 * open state changes, and nothing else on the path re-renders on navigation.
 *
 * Only the levels on the stack mount their children, and only the top level
 * mounts its items (see `DrillDownLevelContext`). That keeps the Radix item
 * collection limited to what is on screen, so roving focus and typeahead
 * never land on a hidden item.
 */

type AnimationDirection = 'forward' | 'backward' | null;
type Modality = 'keyboard' | 'pointer';

interface StackEntry {
  id: string;
  /** Accessible name of the submenu, taken from its trigger text */
  name: string;
  /** Scroll position of the parent level when this entry was pushed */
  scrollTop: number;
}

type LastChange =
  | { type: 'push'; id: string; modality: Modality | null }
  | { type: 'pop'; id: string; modality: Modality | null; scrollTop: number }
  | { type: 'reset' };

interface DrillDownState {
  stack: StackEntry[];
  direction: AnimationDirection;
  lastChange: LastChange | null;
}

const INITIAL_STATE: DrillDownState = { stack: [], direction: null, lastChange: null };

const PANEL_ITEM_SELECTOR = '[role^="menuitem"]:not([data-disabled])';
const BACK_ITEM_CLASS = 'rt-DropdownMenuDrillDownBackItem';

function escapeAttributeValue(value: string) {
  return value.replace(/["\\]/g, '\\$&');
}

class DrillDownStore {
  private state = INITIAL_STATE;
  private listeners = new Set<() => void>();
  private modality: Modality = 'keyboard';
  /** The drill-down root element, set by the provider */
  rootElement: HTMLElement | null = null;

  setRootElement = (element: HTMLElement | null) => {
    this.rootElement = element;
  };

  getState = () => this.state;

  subscribe = (listener: () => void) => {
    this.listeners.add(listener);
    return () => {
      this.listeners.delete(listener);
    };
  };

  private setState(next: DrillDownState) {
    this.state = next;
    this.listeners.forEach((listener) => listener());
  }

  /** Records how the user is interacting, so focus can follow the same model as Radix. */
  setModality = (modality: Modality) => {
    this.modality = modality;
  };

  getModality = () => this.modality;

  getDepth = () => this.state.stack.length;

  isOpen = (id: string) => this.state.stack.some((entry) => entry.id === id);

  private getScrollContainer() {
    const root = this.rootElement;
    if (!root) return null;
    return (
      root.closest<HTMLElement>('.rt-ScrollAreaViewport') ??
      root.closest<HTMLElement>('.rt-BaseMenuViewport')
    );
  }

  private getTrigger(id: string) {
    return this.rootElement?.querySelector<HTMLElement>(
      `[data-drill-down-trigger="${escapeAttributeValue(id)}"]`,
    );
  }

  /**
   * Opens a submenu. `modality` decides where focus goes: the first item for
   * keyboard, the menu for pointer, and nowhere for a programmatic open
   * (`null`) unless focus was lost.
   */
  push = (id: string, modality: Modality | null = this.modality) => {
    const { stack } = this.state;
    if (stack.some((entry) => entry.id === id)) return;
    const trigger = this.getTrigger(id);
    const name = (trigger?.dataset.drillDownName ?? trigger?.textContent ?? '').trim();
    const scrollTop = this.getScrollContainer()?.scrollTop ?? 0;
    this.setState({
      stack: [...stack, { id, name, scrollTop }],
      direction: 'forward',
      lastChange: { type: 'push', id, modality },
    });
  };

  pop = (modality: Modality = this.modality) => {
    const { stack } = this.state;
    const top = stack[stack.length - 1];
    if (!top) return;
    this.setState({
      stack: stack.slice(0, -1),
      direction: 'backward',
      lastChange: { type: 'pop', id: top.id, modality, scrollTop: top.scrollTop },
    });
  };

  /** Closes a submenu and everything opened from it, without moving focus to its trigger. */
  close = (id: string) => {
    const { stack } = this.state;
    const index = stack.findIndex((entry) => entry.id === id);
    if (index === -1) return;
    this.setState({
      stack: stack.slice(0, index),
      direction: 'backward',
      lastChange: { type: 'pop', id, modality: null, scrollTop: stack[index].scrollTop },
    });
  };

  reset = () => {
    if (this.state.stack.length === 0 && this.state.direction === null) return;
    this.setState({ stack: [], direction: null, lastChange: { type: 'reset' } });
  };

  /**
   * Moves focus and scroll after a navigation step has been committed. Runs in
   * a layout effect, so the new level is already in the DOM and nothing paints
   * with focus on `<body>` or at the old scroll position.
   */
  applyLastChange() {
    const change = this.state.lastChange;
    const root = this.rootElement;
    if (!change || !root) return;
    this.state = { ...this.state, lastChange: null };

    const content = root.closest<HTMLElement>('[role="menu"]');
    const scroller = this.getScrollContainer();
    const focus = (element: HTMLElement | null | undefined) => element?.focus({ preventScroll: true });

    if (change.type === 'push') {
      if (scroller) scroller.scrollTop = 0;
      const panel = root.querySelector<HTMLElement>(
        `[data-drill-down-panel="${escapeAttributeValue(change.id)}"]`,
      );
      if (change.modality === 'keyboard') {
        // Land on the first real option; the back row stays one ArrowUp away.
        const items = panel ? Array.from(panel.querySelectorAll<HTMLElement>(PANEL_ITEM_SELECTOR)) : [];
        focus(items.find((item) => !item.classList.contains(BACK_ITEM_CLASS)) ?? items[0] ?? content);
      } else if (change.modality === 'pointer' || !root.contains(document.activeElement)) {
        // Match Radix: pointer users get focus on the menu, not a highlighted item.
        focus(content);
      }
      return;
    }

    if (change.type === 'pop') {
      if (scroller) scroller.scrollTop = change.scrollTop;
      const trigger = this.getTrigger(change.id);
      if (change.modality === 'keyboard') {
        focus(trigger ?? content);
      } else if (change.modality === 'pointer' || !root.contains(document.activeElement)) {
        focus(content);
      }
      return;
    }

    if (scroller) scroller.scrollTop = 0;
  }
}

const DrillDownStoreContext = React.createContext<DrillDownStore | null>(null);

/**
 * Whether the items of the current level are on screen. The root level and
 * every panel provide it; menu parts render nothing when it is false.
 */
const DrillDownLevelContext = React.createContext(true);

function useDrillDownStore() {
  return React.useContext(DrillDownStoreContext);
}

function useCreateDrillDownStore() {
  const [store] = React.useState(() => new DrillDownStore());
  return store;
}

const selectDepth = (state: DrillDownState) => state.stack.length;
const selectDirection = (state: DrillDownState) => state.direction;
const getServerDepth = () => 0;
const getServerDirection = (): AnimationDirection => null;

interface DrillDownRootProps {
  store: DrillDownStore;
  behavior: SubmenuBehavior;
  /** Open state of the menu; the stack resets every time the menu opens */
  open: boolean;
  children: React.ReactNode;
}

/**
 * Provides the drill-down store and renders the root level. The wrapper is
 * the same element in both behaviors, so crossing a breakpoint that switches
 * between cascade and drill-down does not remount the items.
 */
function DrillDownRoot({ store, behavior, open, children }: DrillDownRootProps) {
  const isDrillDown = behavior === 'drill-down';
  const depth = React.useSyncExternalStore(
    store.subscribe,
    () => selectDepth(store.getState()),
    getServerDepth,
  );
  const direction = React.useSyncExternalStore(
    store.subscribe,
    () => selectDirection(store.getState()),
    getServerDirection,
  );
  const isRoot = !isDrillDown || depth === 0;

  // Cascade mode has no stack. A reset while switching modes keeps the next
  // switch back to drill-down from resuming a stale level.
  React.useLayoutEffect(() => {
    if (!isDrillDown) store.reset();
  }, [isDrillDown, store]);

  // Start every opening at the root. Content usually remounts on open anyway;
  // this covers `forceMount`. Resetting on open rather than on close keeps the
  // closing animation on the level the user was looking at.
  const wasOpenRef = React.useRef(open);
  React.useLayoutEffect(() => {
    if (open && !wasOpenRef.current) store.reset();
    wasOpenRef.current = open;
  }, [open, store]);

  // Focus and scroll follow each navigation step once it is in the DOM.
  React.useLayoutEffect(() => {
    store.applyLastChange();
  }, [depth, store]);

  const rootRef = React.useCallback((element: HTMLDivElement | null) => store.setRootElement(element), [store]);
  const handleKeyDownCapture = React.useCallback(() => store.setModality('keyboard'), [store]);
  const handlePointerDownCapture = React.useCallback(() => store.setModality('pointer'), [store]);

  return (
    <DrillDownStoreContext.Provider value={isDrillDown ? store : null}>
      {/* Event capture only records the input modality; it does not handle interaction. */}
      <div
        ref={rootRef}
        className="rt-DropdownMenuDrillDownRoot"
        data-submenu-behavior={behavior}
        data-drill-down-active={isRoot ? undefined : true}
        data-animation-direction={isDrillDown ? (direction ?? undefined) : undefined}
        onKeyDownCapture={isDrillDown ? handleKeyDownCapture : undefined}
        onPointerDownCapture={isDrillDown ? handlePointerDownCapture : undefined}
      >
        <DrillDownLevelContext.Provider value={isRoot}>{children}</DrillDownLevelContext.Provider>
      </div>
    </DrillDownStoreContext.Provider>
  );
}

/** Where a submenu sits in the stack: not open, open under another level, or on top. */
type PanelPosition = 'closed' | 'open' | 'top';

function usePanelPosition(store: DrillDownStore | null, id: string): PanelPosition {
  const getSnapshot = React.useCallback((): PanelPosition => {
    if (!store) return 'closed';
    const { stack } = store.getState();
    if (stack.length > 0 && stack[stack.length - 1].id === id) return 'top';
    return stack.some((entry) => entry.id === id) ? 'open' : 'closed';
  }, [store, id]);
  return React.useSyncExternalStore(store?.subscribe ?? noopSubscribe, getSnapshot, getClosed);
}

function useStackEntry(store: DrillDownStore | null, id: string): StackEntry | undefined {
  const getSnapshot = React.useCallback(
    () => store?.getState().stack.find((entry) => entry.id === id),
    [store, id],
  );
  return React.useSyncExternalStore(store?.subscribe ?? noopSubscribe, getSnapshot, getUndefined);
}

function useDrillDownDirection(store: DrillDownStore | null): AnimationDirection {
  const getSnapshot = React.useCallback(() => store?.getState().direction ?? null, [store]);
  return React.useSyncExternalStore(store?.subscribe ?? noopSubscribe, getSnapshot, getServerDirection);
}

const noopSubscribe = () => () => {};
const getClosed = (): PanelPosition => 'closed';
const getUndefined = () => undefined;

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
  DrillDownRoot,
  DrillDownLevelContext,
  SubContext,
  useCreateDrillDownStore,
  useDrillDownStore,
  useDrillDownDirection,
  usePanelPosition,
  useStackEntry,
  useSubContext,
};

export type { SubmenuBehavior, DrillDownStore, PanelPosition, SubContextValue, AnimationDirection };
