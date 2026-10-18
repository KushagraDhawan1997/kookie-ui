'use client';

import * as React from 'react';
import { readBreakpoint, useBreakpoint } from '../../hooks/use-breakpoint.js';
import type { Breakpoint, PaneName, PresentationValue } from '../shell.types.js';
import {
  constantOf,
  notifyShellStore,
  tableAttributes,
  tableOf,
  usePeeking,
  useShellStore,
  useStableKey,
  warnOnce,
  type OpenChangeReason,
  type PaneEntry,
  type PaneValue,
  type Table,
} from './shell-store.js';

type ResponsiveValue = PaneValue | Partial<Record<Breakpoint, PaneValue>>;

export type UsePaneOptions = {
  name: PaneName;
  /** The component's display name, for warnings: `Inspector`, `Sidebar`, … */
  label: string;
  /** The prop names a warning should use: `open`/`defaultOpen`, or `state`/`defaultState`. */
  propNames: { controlled: string; default: string };
  id: string | undefined;
  /** The controlled value. A responsive object is deprecated: it is resolved against the current breakpoint. */
  controlled: ResponsiveValue | undefined;
  /**
   * The uncontrolled default. A single value fixes where the pane starts. A
   * responsive object leaves the pane untouched (`auto`), with that object as
   * what it shows at each breakpoint.
   */
  defaultValue: ResponsiveValue | undefined;
  /** The pane's presentation at every breakpoint. Pass a memoised table. */
  presentationTable: Table<PresentationValue>;
  /** What an untouched pane shows where no default says otherwise. Pass a module-level function. */
  builtIn: (presentation: PresentationValue) => PaneValue;
  /** Reports a change a user made. Never called on mount or on a resize. */
  onChange: ((value: PaneValue, reason: OpenChangeReason) => void) | undefined;
  /** The value a toggle moves to. Defaults to open and closed in turn. */
  toggleNext?: (current: PaneValue, defaultHere: PaneValue | undefined) => PaneValue;
  onExpand: (() => void) | undefined;
  onCollapse: (() => void) | undefined;
  /** The pane's designed open width, published for the panes beside it. */
  size: number;
};

export type PaneController = ReturnType<typeof usePane>;

const isMap = (value: ResponsiveValue | undefined): value is Partial<Record<Breakpoint, PaneValue>> => typeof value === 'object' && value !== null;

/** The first value a responsive object states, smallest breakpoint first. */
function firstStated(map: Partial<Record<Breakpoint, PaneValue>>): PaneValue {
  for (const bp of ['initial', 'xs', 'sm', 'md', 'lg', 'xl'] as const) {
    const value = map[bp];
    if (value !== undefined) return value;
  }
  return 'closed';
}

/** Everything the togglable panes share: their state, their registry entry and their callbacks. */
export function usePane(options: UsePaneOptions) {
  const { name, label, propNames, presentationTable, builtIn } = options;
  const store = useShellStore(`Shell.${label}`);
  const generatedId = React.useId();
  const id = options.id ?? `shell-${name}${generatedId}`;

  const controlled = options.controlled !== undefined;
  const controlledIsMap = isMap(options.controlled);
  if (controlledIsMap) {
    warnOnce(
      `Shell.${label}: a responsive \`${propNames.controlled}\` is deprecated and is removed in 1.0. ` +
        `Pass a boolean and decide it from your own state, or use \`${propNames.default}\` with a responsive object.`,
    );
  }

  // A responsive controlled value is resolved the way a responsive default
  // is: it becomes the table an untouched pane follows, so the stylesheet
  // answers it at each breakpoint (right in the server HTML, with no
  // callback on a crossing) and the app's prop is still the only writer.
  const controlledMap = controlledIsMap ? (options.controlled as Partial<Record<Breakpoint, PaneValue>>) : undefined;
  const autoSource = controlledMap ?? (isMap(options.defaultValue) ? options.defaultValue : undefined);
  const autoKey = useStableKey(autoSource);
  const [inner, setInner] = React.useState<'auto' | PaneValue>(() => (typeof options.defaultValue === 'string' ? options.defaultValue : 'auto'));

  // What an untouched pane shows at each breakpoint: a responsive default
  // where it states one, the pane's own default where it does not.
  const autoTable = React.useMemo(
    () => (controlledMap ? tableOf<PaneValue>(controlledMap, () => firstStated(controlledMap)) : tableOf<PaneValue>(autoSource, (bp) => builtIn(presentationTable[bp]))),
    // `autoKey` stands for the responsive object, which is usually a new literal each render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [autoKey, controlledIsMap, presentationTable, builtIn],
  );

  let state: 'auto' | PaneValue = inner;
  if (controlled) state = controlledMap ? 'auto' : (options.controlled as PaneValue);

  // Only a pane whose answer depends on the window subscribes to it, so a
  // pane with one presentation and one default never re-renders on a resize.
  const needsBreakpoint = constantOf(presentationTable) === undefined || (state === 'auto' && constantOf(autoTable) === undefined);
  const { breakpoint, ready } = useBreakpoint(needsBreakpoint);

  /** A table's value now: known without the window when it holds one value, else once the breakpoint is known. */
  const now = <T,>(table: Table<T>): T | undefined => {
    const constant = constantOf(table);
    if (constant !== undefined) return constant;
    return ready ? table[breakpoint] : undefined;
  };

  const value: PaneValue | undefined = state === 'auto' ? now(autoTable) : state;
  const presentation = now(presentationTable);
  const overlaying = presentation === 'overlay';
  const shown = value === undefined ? undefined : value !== 'closed';
  const overlayLive = shown === true && overlaying;

  // Stable actions over the latest values, so the registry entry changes only
  // when a fact it carries changes.
  const defaultValue = options.defaultValue;
  const latest = React.useRef({ state, value, autoTable, defaultValue, controlled, onChange: options.onChange, toggleNext: options.toggleNext });
  React.useLayoutEffect(() => {
    latest.current = { state, value, autoTable, defaultValue, controlled, onChange: options.onChange, toggleNext: options.toggleNext };
  });

  /**
   * What the pane shows, and its default, at the window's breakpoint right
   * now. Asked at the moment of an action rather than taken from the last
   * render: a touched pane no longer follows the window, and a click can land
   * before the mirror has resolved after hydration.
   */
  const valueNow = React.useCallback((): PaneValue | undefined => {
    const current = latest.current;
    if (current.value !== undefined) return current.value;
    return current.state === 'auto' ? current.autoTable[readBreakpoint()] : undefined;
  }, []);
  const defaultHereNow = React.useCallback((): PaneValue | undefined => {
    const current = latest.current;
    if (typeof current.defaultValue === 'string') return current.defaultValue;
    return isMap(current.defaultValue) ? current.autoTable[readBreakpoint()] : undefined;
  }, []);

  const setValue = React.useCallback(
    (next: PaneValue, reason: OpenChangeReason) => {
      const current = latest.current;
      if (valueNow() === next) return;
      current.onChange?.(next, reason);
      if (!current.controlled) setInner(next);
    },
    [valueNow],
  );

  const toggle = React.useCallback(
    (reason: OpenChangeReason) => {
      const current = latest.current;
      const from = valueNow() ?? 'closed';
      const next = current.toggleNext ? current.toggleNext(from, defaultHereNow()) : from === 'closed' ? 'open' : 'closed';
      setValue(next, reason);
    },
    [setValue, valueNow, defaultHereNow],
  );

  // The pane's element, for the Root's containment and focus.
  const elementRef = React.useRef<HTMLElement | null>(null);
  const setElement = React.useCallback((node: HTMLElement | null) => {
    elementRef.current = node;
  }, []);

  // Registration. A layout effect so a Trigger's aria attributes and the
  // Root's containment are right before the browser paints.
  React.useLayoutEffect(() => {
    const entry: PaneEntry = {
      name,
      id,
      el: elementRef.current,
      value,
      presentation,
      presentationTable,
      overlayLive,
      size: options.size,
      setValue,
      toggle,
    };
    store.entries.set(name, entry);
    notifyShellStore(store);
    return () => {
      if (store.entries.get(name) === entry) {
        store.entries.delete(name);
        notifyShellStore(store);
      }
    };
  }, [store, name, id, value, presentation, presentationTable, overlayLive, options.size, setValue, toggle]);

  // onExpand/onCollapse fire when the pane's state changes and that changes
  // whether it is shown: a user's toggle, or a controlled prop. Never on
  // mount, and never because the window crossed a breakpoint.
  const callbacks = React.useRef({ onExpand: options.onExpand, onCollapse: options.onCollapse });
  React.useLayoutEffect(() => {
    callbacks.current = { onExpand: options.onExpand, onCollapse: options.onCollapse };
  });
  const previous = React.useRef({ state, shown });
  React.useEffect(() => {
    const before = previous.current;
    if (before.state !== state && before.shown !== undefined && shown !== undefined && before.shown !== shown) {
      if (shown) callbacks.current.onExpand?.();
      else callbacks.current.onCollapse?.();
    }
    previous.current = { state, shown };
  }, [state, shown]);

  // Development guards. Once per mount, not once per render.
  React.useLayoutEffect(() => {
    if (process.env.NODE_ENV === 'production') return;
    if (options.controlled !== undefined && options.defaultValue !== undefined) {
      console.error(`Shell.${label}: Do not pass both \`${propNames.controlled}\` and \`${propNames.default}\`. Choose one.`);
    }
    // Mount only: this is the once-per-mount guard.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const wasControlled = React.useRef(controlled);
  React.useEffect(() => {
    if (process.env.NODE_ENV === 'production') return;
    if (wasControlled.current !== controlled) {
      console.warn(`Shell.${label}: Switching between controlled and uncontrolled \`${propNames.controlled}\` is not supported.`);
      wasControlled.current = controlled;
    }
  }, [controlled, label, propNames.controlled]);

  const peeking = usePeeking(store, name) && shown === false && !overlaying;

  return {
    store,
    id,
    state,
    value,
    shown,
    presentation,
    overlaying,
    overlayLive,
    peeking,
    ready,
    breakpoint,
    autoTable,
    setValue,
    toggle,
    defaultHereNow,
    setElement,
  };
}

/** The data attributes every togglable pane renders. */
export function paneAttributes(pane: PaneController, presentationAttributes: Record<string, string>) {
  const { state, value, presentation, shown } = pane;
  return {
    ...presentationAttributes,
    'data-state': state,
    ...(state === 'auto' ? tableAttributes('auto', pane.autoTable) : {}),
    'data-presentation': presentation,
    'data-mode': value === undefined ? undefined : value === 'closed' ? 'collapsed' : 'expanded',
    // Kept for stylesheets written against 0.7: set while a stacked pane is open.
    'data-open': presentation === 'stacked' && shown ? '' : undefined,
    'data-peek': pane.peeking ? '' : undefined,
  } as const;
}

/** A pane's own presentation, as a table and as the attributes the stylesheet reads. */
export function usePresentationTable(presentation: Parameters<typeof tableOf<PresentationValue>>[0], fallback: PresentationValue) {
  const key = useStableKey(presentation);
  const table = React.useMemo(
    () => tableOf<PresentationValue>(presentation, () => fallback),
    // `key` stands for `presentation`, which is usually a new literal each render.
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [key, fallback],
  );
  // One value is the plain `data-presentation` the pane renders anyway; several
  // are written per breakpoint, so the stylesheet can place the pane before
  // any script runs.
  const attributes = React.useMemo(() => (constantOf(table) === undefined ? tableAttributes('presentation', table) : ({} as Record<string, string>)), [table]);
  return { table, attributes };
}
