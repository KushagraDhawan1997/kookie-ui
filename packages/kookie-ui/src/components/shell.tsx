/**
 * Shell: the app frame.
 *
 * Since 0.8.0 the Shell is built on kookie-ui-v2's model, behind v1's API:
 *
 * - The Root is a CSS grid and renders its children as given, in JSX order.
 *   Each pane claims its own grid area, so the Root never scans or reorders
 *   children, any child renders, and a pane mounted after the Root works.
 * - State lives on each pane: `auto` (untouched), `open` or `closed`. An
 *   untouched pane follows the window, resolved by the
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
import { Slot } from 'radix-ui';
import { useComposedRefs } from 'radix-ui/internal';
import { PaneResizeContext } from './_internal/shell-resize.js';
import { PaneHandle, PanelHandle } from './_internal/shell-handles.js';
import { Sidebar } from './_internal/shell-sidebar.js';
import type { SidebarPublicProps } from './_internal/shell-sidebar.js';
import { Bottom } from './_internal/shell-bottom.js';
import type { BottomPublicProps } from './_internal/shell-bottom.js';
import { Inspector } from './_internal/shell-inspector.js';
import type { InspectorPublicProps } from './_internal/shell-inspector.js';
import { usePane, paneAttributes, usePresentationTable } from './_internal/shell-pane.js';
import { splitHandles, useInitialPaneSize, useResizablePane } from './_internal/shell-resizable.js';
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
import { useThemeSize } from '../hooks/theme-size.js';
import { PaneChromeScope, PaneFooter, PaneHeader, Scroll, ShellContentContext, ShellSizeContext } from './_internal/pane-chrome.js';
import type { PaneSize, PaneHeaderProps, PaneFooterProps, ScrollProps } from './_internal/pane-chrome.js';
import { PaneBandSizeContext } from './_internal/pane-band-context.js';
import type { Breakpoint, CSSPropertiesWithVars, PaneBaseProps, PaneMode, PaneName, PaneTarget, ResponsivePresentation, SidebarMode } from './shell.types.js';

/* ── Root ──────────────────────────────────────────────────────────────────── */

export interface ShellRootProps extends React.ComponentPropsWithoutRef<'div'> {
  children: React.ReactNode;
  height?: 'full' | 'auto' | string | number;
  /** The index the panes' chrome takes: `Shell.PaneHeader`, `Shell.Scroll`, `Shell.PaneFooter` and the Sidebar rows in them. Defaults to the nearest Theme's size (3 when the Theme is 4), else `2`. */
  size?: PaneSize;
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
  if (pageLockHolders > 0) doc.setAttribute('data-kui-shell-lock', '');
  else doc.removeAttribute('data-kui-shell-lock');
}

/** Marks a child the Root made inert, so closing removes only what the Root added. */
const INERT_MARK = 'data-kui-shell-inert';

/** How many frames a focus rescue watches after an overlay opens or closes. */
const RESCUE_FRAMES = 30;

/** Focus that is nowhere useful: the document, or nothing at all. */
function isNowhere(doc: Document, el: Element | EventTarget | null): boolean {
  return el === null || el === doc || el === doc.body || el === doc.documentElement;
}

/** A Trigger that drives the pane with this id and can take focus, optionally only inside `within`. */
function triggerFor(doc: Document, id: string, within?: HTMLElement[]): HTMLElement | null {
  for (const el of doc.querySelectorAll<HTMLElement>('[data-shell-trigger][aria-controls]')) {
    if (el.getAttribute('aria-controls') !== id || el.closest('[inert]')) continue;
    if (within && !within.some((pane) => pane.contains(el))) continue;
    return el;
  }
  return null;
}

type LivePane = { name: PaneName; id: string; el: HTMLElement };

/** Shell.Root's own range; a Theme size above it maps to 3. */
const shellSizePropDef = { values: ['1', '2', '3'] as const };

const Root = React.forwardRef<HTMLDivElement, ShellRootProps>(({ className, children, height = 'full', size: sizeProp, style, onKeyDown, onFocus, ...props }, ref) => {
  // No size of its own: the nearest Theme's, mapped into 1-3.
  const size = useThemeSize(sizeProp, shellSizePropDef);
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

  const livePanes = React.useCallback(
    (): LivePane[] => [...store.entries.values()].filter((entry) => entry.overlayLive && entry.el).map((entry) => ({ name: entry.name, id: entry.id, el: entry.el as HTMLElement })),
    [store],
  );
  const liveCount = [...store.entries.values()].filter((entry) => entry.overlayLive && entry.el).length;

  // A Shell given a height of its own sits inside a page, and its overlays
  // cover only its box: it holds no page lock. `full` is the page, and
  // `auto` grows with its content, so its overlays are placed on the window.
  const contained = height !== 'full' && height !== 'auto';

  /*
   * Containment is the Root's, not the pane's. Only the Root can see every live
   * overlay and every child at once. A per-pane effect, given two overlays,
   * inerts the other live overlay and restores values the other effect wrote,
   * which can leave the whole frame inert for good.
   *
   * Exempt are the scrim and each root child that CONTAINS a live overlay, so
   * a pane wrapped in a plain element is not inerted with its wrapper. A child
   * the Root inerts is marked, and closing clears only marked children, so
   * `inert` the app sets on a child is the app's before, during and after.
   */
  const contain = React.useCallback(() => {
    const rootEl = rootRef.current;
    if (!rootEl) return;
    const liveEls = livePanes().map((pane) => pane.el);
    for (const child of rootEl.children) {
      if (!(child instanceof HTMLElement) || child.classList.contains('kui-ShellScrim')) continue;
      const holdsLive = liveEls.some((el) => child === el || child.contains(el));
      if (liveEls.length === 0 || holdsLive) {
        if (child.hasAttribute(INERT_MARK)) {
          child.removeAttribute(INERT_MARK);
          child.inert = false;
        }
      } else if (!child.inert) {
        child.setAttribute(INERT_MARK, '');
        child.inert = true;
      }
    }
  }, [livePanes]);

  const returnFocusTo = React.useRef<HTMLElement | null>(null);
  const lastLive = React.useRef<LivePane[]>([]);
  const lastFocusInRoot = React.useRef<HTMLElement | null>(null);
  const holdsLock = React.useRef(false);

  /*
   * Focus can be taken away after the commit that moved it: a menu that
   * opened or closed a pane restores focus to its own trigger when it
   * finishes closing, which may be inert or hidden by then. For a few frames
   * after an overlay opens or closes, focus that ends up nowhere useful is
   * put back where it belongs.
   */
  const rescueFrame = React.useRef(0);
  const cancelRescue = React.useCallback(() => {
    if (rescueFrame.current) cancelAnimationFrame(rescueFrame.current);
    rescueFrame.current = 0;
  }, []);
  const rescueFocus = React.useCallback(
    (target: HTMLElement, lost: (active: Element | null) => boolean) => {
      cancelRescue();
      let frames = 0;
      const tick = () => {
        rescueFrame.current = 0;
        if (!target.isConnected) return;
        if (lost(target.ownerDocument.activeElement)) {
          target.focus({ preventScroll: true });
          return;
        }
        frames += 1;
        if (frames < RESCUE_FRAMES) rescueFrame.current = requestAnimationFrame(tick);
      };
      rescueFrame.current = requestAnimationFrame(tick);
    },
    [cancelRescue],
  );

  React.useEffect(
    () => () => {
      cancelRescue();
      if (holdsLock.current) {
        holdsLock.current = false;
        updatePageLock(-1);
      }
    },
    [cancelRescue],
  );

  // No dependency array, on purpose: a pane opening or closing is a render
  // of this component, and so is a child appearing through the Root.
  React.useEffect(() => {
    const rootEl = rootRef.current;
    if (!rootEl) return;
    const doc = rootEl.ownerDocument;
    const live = livePanes();
    const liveEls = live.map((pane) => pane.el);

    const wantsLock = !contained && live.length > 0;
    if (wantsLock !== holdsLock.current) {
      holdsLock.current = wantsLock;
      updatePageLock(wantsLock ? 1 : -1);
    }

    const previous = lastLive.current;
    lastLive.current = live;
    // A pane that left the live set because it closed, as opposed to one
    // that is still open but stopped being an overlay at a breakpoint.
    const closed = previous.filter((pane) => {
      if (liveEls.includes(pane.el)) return false;
      const entry = store.entries.get(pane.name);
      return !pane.el.isConnected || !entry || entry.el !== pane.el || entry.value === 'closed';
    });
    const inClosed = (active: Element | null) => active !== null && closed.some((pane) => pane.el.contains(active));

    // The return target is taken on the opening edge, before inerting: inerting
    // the subtree that holds the trigger blurs it. Focus already inside the
    // overlay (a pane that became one at a breakpoint) is no place to return
    // to, and an opener in a portal (a menu item) goes away with its menu, so
    // the last place focus held inside the frame stands in for it.
    if (previous.length === 0 && live.length > 0) {
      const active = doc.activeElement;
      let target = active instanceof HTMLElement && !isNowhere(doc, active) && !liveEls.some((el) => el.contains(active)) ? active : null;
      if (target && !rootEl.contains(target)) {
        const inRoot = lastFocusInRoot.current;
        if (inRoot && inRoot.isConnected && !liveEls.some((el) => el.contains(inRoot))) target = inRoot;
      }
      returnFocusTo.current = target;
    }

    contain();

    if (live.length === 0) {
      const before = returnFocusTo.current;
      returnFocusTo.current = null;
      // Every overlay that left only stopped being one: focus stays where it is.
      if (closed.length === 0) return;
      const usable = (el: HTMLElement | null) => el !== null && el.isConnected && !el.closest('[inert]') && !inClosed(el);
      let target = usable(before) ? before : null;
      for (const pane of closed) target ??= triggerFor(doc, pane.id);
      if (!target) return;
      const lost = (active: Element | null) => isNowhere(doc, active) || inClosed(active);
      if (lost(doc.activeElement)) target.focus({ preventScroll: true });
      else rescueFocus(target, lost);
      return;
    }

    // Some overlays closed while others stay: focus left in a closed one goes
    // to the Trigger that opened it, if a live pane holds it, or to the pane
    // on top.
    if (closed.length > 0) {
      const active = doc.activeElement;
      if (isNowhere(doc, active) || inClosed(active)) {
        let target: HTMLElement | null = null;
        for (const pane of closed) target ??= triggerFor(doc, pane.id, liveEls);
        (target ?? liveEls[liveEls.length - 1]).focus({ preventScroll: true });
      }
    }

    // Focus moves in on the opening edge and nowhere else, and only when it
    // is not already somewhere the user put it inside the live set.
    const opened = liveEls.filter((el) => !previous.some((pane) => pane.el === el));
    const active = doc.activeElement;
    if (opened.length > 0 && !liveEls.some((el) => el.contains(active))) {
      opened[0].focus({ preventScroll: true });
      rescueFocus(opened[0], (now) => isNowhere(doc, now) || (now instanceof Element && now.closest('[inert]') !== null));
    }
  });

  // A child that appears through its own state while an overlay is live does
  // not render the Root, so the Root watches its children while one is.
  React.useEffect(() => {
    const rootEl = rootRef.current;
    if (!rootEl || liveCount === 0 || typeof MutationObserver === 'undefined') return;
    const observer = new MutationObserver(contain);
    observer.observe(rootEl, { childList: true, subtree: true, attributes: true, attributeFilter: ['inert'] });
    return () => observer.disconnect();
  }, [liveCount, contain]);

  /*
   * Escape closes the overlays. It is handled as a React event on the Root, so
   * a component inside a pane that answers Escape in its own onKeyDown runs
   * first, and its preventDefault() or stopPropagation() keeps the pane open.
   * When the Root closes something it stops the event there, so a React
   * Escape handler above the Shell does not act on it too. A layer that
   * listens on the document in the capture phase (Radix dialogs, menus and
   * popovers) answers first and calls preventDefault() when it closes, so an
   * enclosing Kookie Dialog closes before a Shell inside it is asked.
   */
  const handleKeyDown = (event: React.KeyboardEvent<HTMLDivElement>) => {
    onKeyDown?.(event);
    if (event.key !== 'Escape' || event.defaultPrevented || liveCount === 0) return;
    closeOverlays();
    event.stopPropagation();
  };

  // With focus on the document itself (a pane closed under it, or a menu that
  // closed and took focus with it), the Root never sees the key. While an
  // overlay is live the document answers that one case.
  React.useEffect(() => {
    const rootEl = rootRef.current;
    if (!rootEl || liveCount === 0) return;
    const doc = rootEl.ownerDocument;
    const onDocumentKeyDown = (event: KeyboardEvent) => {
      if (event.key !== 'Escape' || event.defaultPrevented || !isNowhere(doc, event.target)) return;
      closeOverlays();
    };
    doc.addEventListener('keydown', onDocumentKeyDown);
    return () => doc.removeEventListener('keydown', onDocumentKeyDown);
  }, [liveCount, closeOverlays]);

  const handleFocus = (event: React.FocusEvent<HTMLDivElement>) => {
    onFocus?.(event);
    if (event.target instanceof HTMLElement && rootRef.current?.contains(event.target)) lastFocusInRoot.current = event.target;
  };

  // A floating Panel sits beside the Rail when the Rail is showing, and
  // beside its card when the Rail is inset.
  const rail = store.entries.get('rail');
  const railShown = rail !== undefined && rail.value !== undefined && rail.value !== 'closed';
  const railOffset = railShown ? (insetPanes.has('rail') ? `calc(${rail.size}px + 2 * var(--shell-inset-gap))` : `${rail.size}px`) : undefined;

  // `full` writes no inline height: the stylesheet states it as 100vh with a
  // 100dvh override where supported, and an inline value would beat both.
  const heightStyle: React.CSSProperties = height === 'full' ? {} : height === 'auto' ? { height: 'auto' } : typeof height === 'number' ? { height: `${height}px` } : { height };

  return (
    <ShellStoreContext.Provider value={store}>
      <ShellSizeContext.Provider value={size}>
      <ShellContentContext.Provider value={false}>
      <ShellInsetContext.Provider value={insetContext}>
      {/* A Shell inside a portalled surface's Theme starts with no band, like any other. */}
      <PaneBandSizeContext.Provider value={undefined}>
        {/* The Root is not a widget: it hears Escape bubbling up from the panes,
            after their own handlers, to close the overlays. */}
        {/* eslint-disable-next-line jsx-a11y/no-static-element-interactions */}
        <div
          {...props}
          ref={composedRef}
          className={classNames('kui-ShellRoot', className)}
          data-height={height === 'auto' ? 'auto' : undefined}
          data-has-inset={insetPanes.size > 0 || undefined}
          data-overlay-live={liveCount > 0 || undefined}
          onKeyDown={handleKeyDown}
          onFocus={handleFocus}
          style={{ ...heightStyle, ...(railOffset ? ({ '--shell-rail-offset': railOffset } as CSSPropertiesWithVars) : {}), ...style }}
        >
          {children}
          {/* Root-owned and always mounted. The stylesheet shows it while an
              overlay is live; containment takes the rest of the frame out of
              the accessibility tree, so the scrim itself is hidden from it. */}
          <div className="kui-ShellScrim" aria-hidden onClick={closeOverlays} />
        </div>
      </PaneBandSizeContext.Provider>
      </ShellInsetContext.Provider>
      </ShellContentContext.Provider>
      </ShellSizeContext.Provider>
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
    className={classNames('kui-ShellHeader', className)}
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
      role={domProps.role ?? 'navigation'}
      id={pane.id}
      ref={composedRef}
      className={classNames('kui-ShellPane', 'kui-ShellRail', className)}
      {...paneAttributes(pane, attributes)}
      data-inset={inset || undefined}
      tabIndex={pane.overlaying ? -1 : domProps.tabIndex}
      style={{ ...style, '--rail-size': `${expandedSize}px` } as CSSPropertiesWithVars}
    >
      <RailContent>{children}</RailContent>
    </div>
  );
});
Rail.displayName = 'Shell.Rail';

/** The Rail's content carries the index, so the thin row styles can size themselves by it. */
function RailContent({ children }: { children: React.ReactNode }) {
  const size = React.useContext(ShellSizeContext);
  return (
    <div className={classNames('kui-ShellRailContent', `kui-r-size-${size}`)}>
      <PaneChromeScope presentation="thin">{children}</PaneChromeScope>
    </div>
  );
}

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

  // The starting size is in the server HTML, so the pane does not jump on hydration.
  const initialSize = useInitialPaneSize(size, defaultSize, minSize, maxSize);
  const { handles, content } = splitHandles(children, PanelHandle);
  const handle = resizable && pane.shown !== false && !pane.overlaying ? <PaneResizeContext.Provider value={resize}>{handles.length > 0 ? handles : <PaneHandle />}</PaneResizeContext.Provider> : null;

  return (
    <div
      {...withoutRemovedPaneProps(domProps)}
      role={domProps.role ?? 'navigation'}
      id={pane.id}
      ref={composedRef}
      className={classNames('kui-ShellPane', 'kui-ShellPanel', className)}
      {...paneAttributes(pane, presentationAttributes)}
      data-inset={inset || undefined}
      tabIndex={pane.overlaying ? -1 : domProps.tabIndex}
      style={
        {
          ...style,
          '--panel-expanded-size': `${expandedSize}px`,
          ...(initialSize ? { '--panel-size': initialSize } : {}),
        } as CSSPropertiesWithVars
      }
    >
      <div className="kui-ShellPanelContent">
        <PaneChromeScope>{content}</PaneChromeScope>
      </div>
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

/**
 * The work area. It scrolls as it is; with a `Shell.Scroll` child it becomes a column and the
 * Scroll scrolls instead, so a `Shell.PaneHeader float` beside it stays pinned over the page.
 */
const Content = React.forwardRef<HTMLElement, ShellContentProps>(({ className, inset, children, ...props }, ref) => {
  useInsetRegistration('content', inset);
  return (
    <main {...props} ref={ref} className={classNames('kui-ShellContent', className)} data-inset={inset || undefined}>
      <ShellContentContext.Provider value={true}>{children}</ShellContentContext.Provider>
    </main>
  );
});
Content.displayName = 'Shell.Content';

/* ── Trigger ───────────────────────────────────────────────────────────────── */

type TriggerAction = 'toggle' | 'expand' | 'collapse';

interface TriggerProps extends React.ComponentPropsWithoutRef<'button'> {
  target: PaneTarget;
  action?: TriggerAction;
  /**
   * Renders the single child in place of the trigger's own button, with the trigger's click,
   * `aria-controls`, `aria-expanded` and data attributes merged onto it. Use it to make a
   * `Button` the trigger: `<Shell.Trigger asChild><Button iconOnly aria-label="Toggle sidebar">…</Button></Shell.Trigger>`.
   */
  asChild?: boolean;
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
 * consumer's `onClick` first: calling `preventDefault()` there cancels it. With `asChild` the
 * child is the button, and its own `type` stands.
 */
const Trigger = React.forwardRef<HTMLButtonElement, TriggerProps>(({ target, action = 'toggle', peekOnHover, asChild = false, onClick, onMouseEnter, onMouseLeave, children, ...props }, ref) => {
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

  const Comp = asChild ? Slot.Root : 'button';
  return (
    <Comp
      // A button's default type is `submit`. Stated before the spread, so a consumer's own wins.
      // An asChild child states its own (Button already says `button`; a link has none), so the
      // key is left off rather than passed as undefined.
      {...(!asChild && { type: 'button' as const })}
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
    </Comp>
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
  PaneHeader,
  PaneFooter,
  Scroll,
  useShell,
  useSidebarMode,
  useResponsivePresentation,
  type PaneMode,
  type SidebarMode,
  type ResponsivePresentation,
  type PaneTarget,
  type TriggerAction,
  type ShellRootProps as RootProps,
  type ShellHeaderProps as HeaderProps,
  type RailProps,
  type PanelPublicProps as PanelProps,
  type SidebarPublicProps as SidebarProps,
  type ShellContentProps as ContentProps,
  type InspectorPublicProps as InspectorProps,
  type BottomPublicProps as BottomProps,
  type TriggerProps,
  type PaneHeaderProps,
  type PaneFooterProps,
  type ScrollProps,
};
