/**
 * Shell: the app frame.
 *
 * Since 0.8.0 the Shell is built on kookie-ui-v2's model, behind v1's API:
 *
 * - The Root is a CSS grid and renders its children as given, in JSX order.
 *   Each pane claims its own grid area, so the Root never scans or reorders
 *   children, any child renders, and a pane mounted after the Root works.
 * - State lives on each pane: `auto` (untouched), `open` or `closed`, and the
 *   Sidebar's `thin`. An untouched pane follows the window, resolved by the
 *   stylesheet, so first paint needs no script and no open-state callback
 *   fires on mount or on a resize.
 * - A pane is one element at every width. `overlay` is a posture of that
 *   element, not a Sheet swapped in: crossing a breakpoint keeps its scroll
 *   position, its focus and its children's state.
 * - The Root owns what an overlay needs: one scrim, `inert` on everything
 *   else, focus moved in and returned, Escape, and a scroll lock.
 * - Nothing links panes to each other. A Rail closing no longer closes the
 *   Panel; an app that wants that writes it in `onOpenChange`.
 */
'use client';

import * as React from 'react';
import classNames from 'classnames';
import { useComposedRefs } from 'radix-ui/internal';
import { PaneResizeContext } from './_internal/shell-resize.js';
import { PaneHandle, PanelHandle } from './_internal/shell-handles.js';
import { Sidebar } from './_internal/shell-sidebar.js';
import { Bottom } from './_internal/shell-bottom.js';
import { Inspector } from './_internal/shell-inspector.js';
import { usePane, paneAttributes, usePresentationTable } from './_internal/shell-pane.js';
import { splitHandles, useResizablePane } from './_internal/shell-resizable.js';
import {
  FIXED_TABLE,
  ShellInsetContext,
  ShellStoreContext,
  createShellStore,
  setShellPeek,
  subscribeShellStore,
  useInsetRegistration,
  usePaneEntry,
  useShellStore,
  warnOnce,
  type InsetPaneId,
} from './_internal/shell-store.js';
import { navigationRest, detailRest, toPaneValue, startAnchoredGrowth, withoutRemovedPaneProps } from './_internal/shell-rest.js';
import { useShell, useSidebarMode } from './shell.context.js';
import { useResponsivePresentation } from './shell.hooks.js';
import { readBreakpoint } from '../hooks/use-breakpoint.js';
import type { Breakpoint, CSSPropertiesWithVars, PaneBaseProps, PaneMode, PaneName, PaneTarget, ResponsivePresentation, SidebarMode } from './shell.types.js';

/* ── Root ──────────────────────────────────────────────────────────────────── */

export interface ShellRootProps extends React.ComponentPropsWithoutRef<'div'> {
  children: React.ReactNode;
  height?: 'full' | 'auto' | string | number;
}

/**
 * Every Shell with a live overlay holds the page still, counted across Shells,
 * through an attribute the stylesheet reads. Saving and restoring the
 * document's inline `overflow` would fight any other scroll lock on the page.
 */
let pageLockHolders = 0;
function updatePageLock(delta: 1 | -1) {
  pageLockHolders = Math.max(0, pageLockHolders + delta);
  const doc = document.documentElement;
  if (pageLockHolders > 0) doc.setAttribute('data-rt-shell-lock', '');
  else doc.removeAttribute('data-rt-shell-lock');
}

const Root = React.forwardRef<HTMLDivElement, ShellRootProps>(({ className, children, height = 'full', style, ...props }, ref) => {
  const [store] = React.useState(createShellStore);
  const subscribe = React.useCallback((listener: () => void) => subscribeShellStore(store, listener), [store]);
  // Subscribed for the re-render, not for a value: a pane opening or closing
  // must bring the Root back so containment and the scrim follow it.
  React.useSyncExternalStore(
    subscribe,
    () => store.version,
    () => 0,
  );

  const rootRef = React.useRef<HTMLDivElement | null>(null);
  const composedRef = useComposedRefs(ref, rootRef);

  // Inset: the Root paints the backdrop while any pane is inset.
  const [insetPanes, setInsetPanes] = React.useState<ReadonlySet<InsetPaneId>>(() => new Set());
  const registerInset = React.useCallback((id: InsetPaneId) => {
    setInsetPanes((prev) => (prev.has(id) ? prev : new Set(prev).add(id)));
  }, []);
  const unregisterInset = React.useCallback((id: InsetPaneId) => {
    setInsetPanes((prev) => {
      if (!prev.has(id)) return prev;
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }, []);
  const insetContext = React.useMemo(() => ({ registerInset, unregisterInset }), [registerInset, unregisterInset]);

  const closeOverlays = React.useCallback(() => {
    for (const entry of store.entries.values()) {
      if (entry.overlayLive) entry.setValue('closed', 'dismiss');
    }
  }, [store]);

  const liveCount = [...store.entries.values()].filter((entry) => entry.overlayLive && entry.el).length;

  /*
   * Containment is the Root's, not the pane's. Only the Root can see every live
   * overlay and every child at once. A per-pane effect, given two overlays,
   * inerts the other live overlay and restores values the other effect wrote,
   * which can leave the whole frame inert for good.
   *
   * One pass, one snapshot filled lazily per element:
   * - exempt are the scrim and each root child that CONTAINS a live overlay,
   *   so a pane wrapped in a plain element is not inerted with its wrapper;
   * - a child is snapshotted the first time it is inerted, so a child mounted
   *   during an overlay is contained and restored correctly;
   * - focus is captured before inerting, because inerting the subtree that
   *   holds the trigger blurs it.
   *
   * No dependency array, on purpose: a child mounted behind the scrim notifies
   * nothing, but a child appearing is a render of this component.
   */
  const [inertSnapshot] = React.useState(() => new Map<HTMLElement, boolean>());
  const returnFocusTo = React.useRef<HTMLElement | null>(null);
  const lastLive = React.useRef<HTMLElement[]>([]);
  const holdsLock = React.useRef(false);

  React.useEffect(
    () => () => {
      if (holdsLock.current) {
        holdsLock.current = false;
        updatePageLock(-1);
      }
    },
    [],
  );

  React.useEffect(() => {
    const rootEl = rootRef.current;
    if (!rootEl) return;
    const liveEls = [...store.entries.values()].filter((entry) => entry.overlayLive && entry.el).map((entry) => entry.el as HTMLElement);

    const wantsLock = liveEls.length > 0;
    if (wantsLock !== holdsLock.current) {
      holdsLock.current = wantsLock;
      updatePageLock(wantsLock ? 1 : -1);
    }

    if (liveEls.length === 0) {
      for (const [el, previous] of inertSnapshot) {
        if (el.isConnected) el.inert = previous;
      }
      inertSnapshot.clear();
      const before = returnFocusTo.current;
      const leaving = lastLive.current;
      returnFocusTo.current = null;
      lastLive.current = [];
      // Focus goes back if it is nowhere useful, or still inside the pane
      // that just closed: the browser has not always blurred it yet.
      const active = document.activeElement;
      const stranded = active === null || active === document.body || leaving.some((el) => el.contains(active));
      if (before && before.isConnected && stranded) before.focus({ preventScroll: true });
      return;
    }

    if (returnFocusTo.current === null) {
      returnFocusTo.current = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    }

    const exempt = new Set<Element>();
    for (const el of liveEls) {
      for (const child of rootEl.children) {
        if (child === el || child.contains(el)) exempt.add(child);
      }
    }

    for (const child of rootEl.children) {
      if (!(child instanceof HTMLElement)) continue;
      if (child.classList.contains('rt-ShellScrim')) continue;
      if (exempt.has(child)) {
        if (inertSnapshot.has(child)) {
          child.inert = inertSnapshot.get(child) ?? false;
          inertSnapshot.delete(child);
        }
        continue;
      }
      if (!inertSnapshot.has(child)) inertSnapshot.set(child, child.inert);
      child.inert = true;
    }

    // Focus moves in on the opening edge and nowhere else, and only when it
    // is not already somewhere the user put it inside the live set.
    const previous = lastLive.current;
    lastLive.current = liveEls;
    const opened = liveEls.filter((el) => !previous.includes(el));
    const active = document.activeElement;
    if (opened.length > 0 && !liveEls.some((el) => el.contains(active))) {
      opened[0].focus({ preventScroll: true });
    }
  });

  /*
   * Escape closes the overlays. Listened on the Root rather than the document,
   * so a dialog opened from inside a pane keeps its own Escape. It stops here
   * when it closes something, so a Shell placed inside a dialog does not close
   * the dialog too. It does not call preventDefault: a dismissal is not a
   * cancelled default.
   */
  React.useEffect(() => {
    const rootEl = rootRef.current;
    if (!rootEl || liveCount === 0) return;
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape' || event.defaultPrevented) return;
      closeOverlays();
      event.stopPropagation();
    };
    rootEl.addEventListener('keydown', onKeyDown);
    return () => rootEl.removeEventListener('keydown', onKeyDown);
  }, [liveCount, closeOverlays]);

  // A floating Panel sits beside the Rail when the Rail is showing.
  const rail = store.entries.get('rail');
  const railOffset = rail && rail.value !== undefined && rail.value !== 'closed' ? rail.size : 0;

  // `full` writes no inline height: the stylesheet states it as 100vh with a
  // 100dvh override where supported, and an inline value would beat both.
  const heightStyle: React.CSSProperties = height === 'full' ? {} : height === 'auto' ? { height: 'auto' } : typeof height === 'number' ? { height: `${height}px` } : { height };

  return (
    <ShellStoreContext.Provider value={store}>
      <ShellInsetContext.Provider value={insetContext}>
        <div
          {...props}
          ref={composedRef}
          className={classNames('rt-ShellRoot', className)}
          data-has-inset={insetPanes.size > 0 || undefined}
          data-overlay-live={liveCount > 0 || undefined}
          style={{ ...heightStyle, ...(railOffset ? ({ '--shell-rail-offset': `${railOffset}px` } as CSSPropertiesWithVars) : {}), ...style }}
        >
          {children}
          {/* Root-owned and always mounted. The stylesheet shows it while an
              overlay is live; containment takes the rest of the frame out of
              the accessibility tree, so the scrim itself is hidden from it. */}
          <div className="rt-ShellScrim" aria-hidden onClick={closeOverlays} />
        </div>
      </ShellInsetContext.Provider>
    </ShellStoreContext.Provider>
  );
});
Root.displayName = 'Shell.Root';

/* ── Header ────────────────────────────────────────────────────────────────── */

interface ShellHeaderProps extends React.ComponentPropsWithoutRef<'header'> {
  height?: number;
}

const Header = React.forwardRef<HTMLElement, ShellHeaderProps>(({ className, height = 64, style, ...props }, ref) => (
  <header
    {...props}
    ref={ref}
    className={classNames('rt-ShellHeader', className)}
    style={
      {
        ...style,
        '--shell-header-height': `${height}px`,
      } as CSSPropertiesWithVars
    }
  />
));
Header.displayName = 'Shell.Header';

/* ── Left (deprecated) ─────────────────────────────────────────────────────── */

interface LeftProps extends React.ComponentPropsWithoutRef<'div'> {
  presentation?: ResponsivePresentation;
  open?: boolean;
  defaultOpen?: boolean;
  onOpenChange?: (open: boolean, meta: { reason: 'init' | 'toggle' | 'panel' | 'responsive' | 'dismiss' }) => void;
  collapsible?: boolean;
  onExpand?: () => void;
  onCollapse?: () => void;
  inset?: boolean;
}

/**
 * @deprecated The Root no longer wraps the Rail and Panel in a Left
 * container: each is its own pane. `Shell.Left` renders its children and
 * ignores its own props. Removed in 1.0.
 */
const Left = React.forwardRef<HTMLDivElement, LeftProps>(({ children }, _ref) => {
  React.useEffect(() => {
    warnOnce('Shell.Left is deprecated and is removed in 1.0. Render Shell.Rail and Shell.Panel directly in Shell.Root.');
  }, []);
  return <>{children}</>;
});
Left.displayName = 'Shell.Left';

/* ── Rail ──────────────────────────────────────────────────────────────────── */

type RailOpenChangeMeta = { reason: 'init' | 'toggle' | 'responsive' | 'panel' | 'dismiss' };

type RailControlledProps = { open: boolean | Partial<Record<Breakpoint, boolean>>; onOpenChange?: (open: boolean, meta: RailOpenChangeMeta) => void; defaultOpen?: never };
type RailUncontrolledProps = { defaultOpen?: boolean | Partial<Record<Breakpoint, boolean>>; onOpenChange?: (open: boolean, meta: RailOpenChangeMeta) => void; open?: never };

type RailProps = React.ComponentPropsWithoutRef<'div'> & {
  presentation?: ResponsivePresentation;
  expandedSize?: number;
  collapsible?: boolean;
  /** @deprecated Use `onOpenChange`. */
  onExpand?: () => void;
  /** @deprecated Use `onOpenChange`. */
  onCollapse?: () => void;
  /** When true, adds margin and triggers the gray backdrop on the Shell. */
  inset?: boolean;
} & (RailControlledProps | RailUncontrolledProps);

const RAIL_PROP_NAMES = { controlled: 'open', default: 'defaultOpen' };

const Rail = React.forwardRef<HTMLDivElement, RailProps>((props, ref) => {
  const { className, presentation, expandedSize = 64, collapsible: _collapsible, onExpand, onCollapse, children, style, open, defaultOpen, onOpenChange, inset, id, ...domProps } = props;
  const { table, attributes } = usePresentationTable(presentation, 'fixed');
  const pane = usePane({
    name: 'rail',
    label: 'Rail',
    propNames: RAIL_PROP_NAMES,
    id,
    controlled: toPaneValue(open),
    defaultValue: toPaneValue(defaultOpen),
    presentationTable: table,
    builtIn: navigationRest,
    onChange: (value, reason) => onOpenChange?.(value !== 'closed', { reason }),
    onExpand,
    onCollapse,
    size: expandedSize,
  });
  useInsetRegistration('rail', inset);
  const composedRef = useComposedRefs(ref, pane.setElement);

  return (
    <div
      {...domProps}
      id={pane.id}
      ref={composedRef}
      className={classNames('rt-ShellPane', 'rt-ShellRail', className)}
      {...paneAttributes(pane, attributes)}
      data-inset={inset || undefined}
      tabIndex={pane.overlaying ? -1 : domProps.tabIndex}
      style={{ ...style, '--rail-size': `${expandedSize}px` } as CSSPropertiesWithVars}
    >
      <div className="rt-ShellRailContent">{children}</div>
    </div>
  );
});
Rail.displayName = 'Shell.Rail';

/* ── Panel ─────────────────────────────────────────────────────────────────── */

type HandleComponent = React.ForwardRefExoticComponent<React.ComponentPropsWithoutRef<'div'> & React.RefAttributes<HTMLDivElement>>;

type PanelOpenChangeMeta = { reason: 'toggle' | 'left' | 'init' | 'responsive' | 'dismiss' };
type PanelControlledProps = { open: boolean | Partial<Record<Breakpoint, boolean>>; onOpenChange?: (open: boolean, meta: PanelOpenChangeMeta) => void; defaultOpen?: never };
type PanelUncontrolledProps = { defaultOpen?: boolean | Partial<Record<Breakpoint, boolean>>; onOpenChange?: (open: boolean, meta: PanelOpenChangeMeta) => void; open?: never };

type PanelSizeControlledProps = { size: number | string; defaultSize?: never };
type PanelSizeUncontrolledProps = { defaultSize?: number | string; size?: never };

type PanelSizeChangeMeta = { reason: 'init' | 'resize' | 'controlled' };
type PanelPublicProps = PaneBaseProps &
  (PanelControlledProps | PanelUncontrolledProps) &
  (PanelSizeControlledProps | PanelSizeUncontrolledProps) & {
    onSizeChange?: (size: number, meta: PanelSizeChangeMeta) => void;
    sizeUpdate?: 'throttle' | 'debounce';
    sizeUpdateMs?: number;
    /** When true, adds margin and triggers the gray backdrop on the Shell. */
    inset?: boolean;
  };
type PanelComponent = React.ForwardRefExoticComponent<PanelPublicProps & React.RefAttributes<HTMLDivElement>> & {
  Handle: HandleComponent;
};

const PANEL_PROP_NAMES = { controlled: 'open', default: 'defaultOpen' };

/**
 * A Panel with a `presentation` of its own uses it. One without follows the
 * Rail rendered before it, which is how 0.7 placed a Panel; the stylesheet
 * reads the Rail's attributes for the first paint and the registry carries
 * the Rail's table for the JS mirror.
 */
const Panel = React.forwardRef<HTMLDivElement, PanelPublicProps>((props, ref) => {
  const {
    className,
    presentation,
    defaultOpen,
    open,
    onOpenChange,
    size,
    defaultSize,
    expandedSize = 288,
    minSize = 100,
    maxSize = 800,
    resizable = false,
    collapsible = true,
    onExpand,
    onCollapse,
    onResize,
    onResizeStart,
    onResizeEnd,
    snapPoints,
    snapTolerance,
    collapseThreshold,
    paneId,
    persistence,
    children,
    style,
    onSizeChange,
    sizeUpdate,
    sizeUpdateMs = 50,
    inset,
    id,
    ...domProps
  } = props;
  const store = useShellStore('Shell.Panel');
  const rail = usePaneEntry(store, 'rail');
  const own = usePresentationTable(presentation, 'fixed');
  const followsRail = presentation === undefined;
  const presentationTable = followsRail ? (rail?.presentationTable ?? FIXED_TABLE) : own.table;
  const presentationAttributes = followsRail ? { 'data-presentation-follows': '' } : own.attributes;

  const pane = usePane({
    name: 'panel',
    label: 'Panel',
    propNames: PANEL_PROP_NAMES,
    id,
    controlled: toPaneValue(open),
    defaultValue: toPaneValue(defaultOpen),
    presentationTable,
    builtIn: detailRest,
    onChange: (value, reason) => onOpenChange?.(value !== 'closed', { reason }),
    onExpand,
    onCollapse,
    size: expandedSize,
  });
  useInsetRegistration('panel', inset);

  React.useEffect(() => {
    if (snapPoints !== undefined || collapseThreshold !== undefined || paneId !== undefined || persistence !== undefined) {
      warnOnce('Shell.Panel: `snapPoints`, `collapseThreshold`, `paneId` and `persistence` are deprecated and are removed in 1.0. Keep the size in your own state with `size`/`onSizeChange`.');
    }
  }, [snapPoints, collapseThreshold, paneId, persistence]);

  const elementRef = React.useRef<HTMLElement | null>(null);
  const composedRef = useComposedRefs(ref, pane.setElement, elementRef);

  const resize = useResizablePane({
    name: 'panel',
    elementId: pane.id,
    elementRef,
    cssVarName: '--panel-size',
    orientation: 'vertical',
    edge: 'end',
    growth: startAnchoredGrowth,
    expandedSize,
    minSize,
    maxSize,
    resizable,
    collapsible,
    size,
    defaultSize,
    onSizeChange,
    sizeUpdate,
    sizeUpdateMs,
    onResize,
    onResizeStart,
    onResizeEnd,
    snapPoints,
    snapTolerance,
    collapseThreshold,
    paneId,
    persistence,
    overlaying: pane.overlaying,
    // Asked when the effect runs: the Rail registers its table after this
    // Panel first renders, so the render's answer can be out of date.
    overlayingNow: () => {
      const table = followsRail ? (store.entries.get('rail')?.presentationTable ?? FIXED_TABLE) : own.table;
      return table[readBreakpoint()] === 'overlay';
    },
    requestCollapse: () => pane.setValue('closed', 'toggle'),
    requestToggle: () => pane.toggle('toggle'),
  });

  const { handles, content } = splitHandles(children, PanelHandle);
  const handle = resizable && pane.shown !== false && !pane.overlaying ? <PaneResizeContext.Provider value={resize}>{handles.length > 0 ? handles : <PaneHandle />}</PaneResizeContext.Provider> : null;

  return (
    <div
      {...withoutRemovedPaneProps(domProps)}
      id={pane.id}
      ref={composedRef}
      className={classNames('rt-ShellPane', 'rt-ShellPanel', className)}
      {...paneAttributes(pane, presentationAttributes)}
      data-inset={inset || undefined}
      tabIndex={pane.overlaying ? -1 : domProps.tabIndex}
      style={
        {
          ...style,
          '--panel-size': `${expandedSize}px`,
          '--panel-expanded-size': `${expandedSize}px`,
        } as CSSPropertiesWithVars
      }
    >
      <div className="rt-ShellPanelContent">{content}</div>
      {handle}
    </div>
  );
}) as PanelComponent;
Panel.displayName = 'Shell.Panel';
Panel.Handle = PanelHandle;

/* ── Content ───────────────────────────────────────────────────────────────── */

interface ShellContentProps extends React.ComponentPropsWithoutRef<'main'> {
  /** When true, adds margin and triggers the gray backdrop on the Shell. */
  inset?: boolean;
}

const Content = React.forwardRef<HTMLElement, ShellContentProps>(({ className, inset, ...props }, ref) => {
  useInsetRegistration('content', inset);
  return <main {...props} ref={ref} className={classNames('rt-ShellContent', className)} data-inset={inset || undefined} />;
});
Content.displayName = 'Shell.Content';

/* ── Trigger ───────────────────────────────────────────────────────────────── */

type TriggerAction = 'toggle' | 'expand' | 'collapse';

interface TriggerProps extends React.ComponentPropsWithoutRef<'button'> {
  target: PaneTarget;
  action?: TriggerAction;
  /**
   * Whether to show a preview of the target pane on hover while it is closed
   * and not an overlay. Defaults to false.
   *
   * @deprecated Removed in 1.0. A preview reachable only by mouse hover has no
   * keyboard or touch equivalent; open the pane instead.
   */
  peekOnHover?: boolean;
}

/**
 * A button that drives a pane by name, through the registry. It sets
 * `aria-controls` and `aria-expanded` (left off while an untouched pane
 * cannot know its state yet), renders `type="button"`, and runs the
 * consumer's `onClick` first: calling `preventDefault()` there cancels it.
 */
const Trigger = React.forwardRef<HTMLButtonElement, TriggerProps>(({ target, action = 'toggle', peekOnHover, onClick, onMouseEnter, onMouseLeave, children, ...props }, ref) => {
  const store = useShellStore('Shell.Trigger');
  React.useEffect(() => {
    if (target === 'left') warnOnce('Shell.Trigger target="left" is deprecated and is removed in 1.0. Use target="rail".');
    if (peekOnHover) warnOnce('Shell.Trigger: `peekOnHover` is deprecated and is removed in 1.0.');
  }, [target, peekOnHover]);
  const name: PaneName = target === 'left' ? 'rail' : target;
  // Subscribes to its own pane only.
  const entry = usePaneEntry(store, name);
  const shown = entry?.value === undefined ? undefined : entry.value !== 'closed';

  const handleClick = (event: React.MouseEvent<HTMLButtonElement>) => {
    onClick?.(event);
    if (event.defaultPrevented) return;
    const current = store.entries.get(name);
    if (!current) return;
    if (store.peek === name) setShellPeek(store, null);
    if (action === 'toggle') current.toggle('toggle');
    else if (action === 'expand') current.setValue('open', 'toggle');
    else current.setValue('closed', 'toggle');
  };

  const handleMouseEnter = (event: React.MouseEvent<HTMLButtonElement>) => {
    onMouseEnter?.(event);
    if (!peekOnHover) return;
    const current = store.entries.get(name);
    if (current && current.value === 'closed' && current.presentation !== 'overlay') setShellPeek(store, name);
  };

  const handleMouseLeave = (event: React.MouseEvent<HTMLButtonElement>) => {
    onMouseLeave?.(event);
    if (peekOnHover && store.peek === name) setShellPeek(store, null);
  };

  return (
    <button
      // A button's default type is `submit`. Stated before the spread, so a consumer's own wins.
      type="button"
      aria-controls={entry?.id}
      aria-expanded={shown}
      {...props}
      ref={ref}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      data-shell-trigger={target}
      data-shell-action={action}
    >
      {children}
    </button>
  );
});
Trigger.displayName = 'Shell.Trigger';

// Exports
export {
  Root,
  Header,
  Left,
  Rail,
  Panel,
  Sidebar,
  Content,
  Inspector,
  Bottom,
  Trigger,
  useShell,
  useSidebarMode,
  useResponsivePresentation,
  type PaneMode,
  type SidebarMode,
  type ResponsivePresentation,
  type PaneTarget,
  type TriggerAction,
};
