/**
 * Shell Component - Layout Engine + Chrome
 *
 * Philosophy:
 * - Shell = layout engine + chrome
 * - Manages layout state: expanded/collapsed, fixed/overlay, sizes
 * - Does not manage content/navigation state
 * - Provides unstyled primitives (slots, triggers)
 * - Enforces composition rules (Rail ↔ Panel dependency, Sidebar exclusivity)
 *
 * Core Slots:
 * - Header: global top bar
 * - Rail: slim nav strip
 * - Panel: sidebar next to rail
 * - Sidebar: alternative to Rail+Panel (exclusive)
 * - Content: main work area
 * - Inspector: right-side panel
 * - Bottom: bottom panel
 *
 * Composition Rules:
 * - Rail + Panel: valid together (Rail collapse → Panel collapse)
 * - Sidebar: cannot coexist with Rail or Panel
 * - Content: always required
 * - Inspector/Bottom: optional, independent
 */
'use client';

import * as React from 'react';
import classNames from 'classnames';
import * as Sheet from './sheet.js';
import { VisuallyHidden } from './visually-hidden.js';
import { useResponsivePresentation, useResponsiveInitialState, resolveResponsiveValue } from './shell.hooks.js';
import { PaneResizeContext } from './_internal/shell-resize.js';
import { PaneHandle, PanelHandle } from './_internal/shell-handles.js';
import { omitPaneProps, extractPaneDomProps, mapResponsiveBooleanToPaneMode } from './_internal/shell-prop-helpers.js';
import { Sidebar } from './_internal/shell-sidebar.js';
import { Bottom } from './_internal/shell-bottom.js';
import { Inspector } from './_internal/shell-inspector.js';
import type { PresentationValue, ResponsivePresentation, PaneMode, SidebarMode, Breakpoint, PaneTarget, Responsive, PaneBaseProps, CSSPropertiesWithVars } from './shell.types.js';
import { usePaneSize, usePaneChangeNotify, usePaneExpandCollapse, useControlledSwitchWarning } from './_internal/shell-pane-hooks.js';
import { useBreakpoint } from '../hooks/use-breakpoint.js';
import {
  ShellProvider,
  useShell,
  LeftModeContext,
  useLeftMode,
  PanelModeContext,
  usePanelMode,
  SidebarModeContext,
  useSidebarMode,
  InspectorModeContext,
  useInspectorMode,
  BottomModeContext,
  useBottomMode,
  PresentationContext,
  usePresentation,
  PeekContext,
  usePeek,
  ActionsContext,
  useShellActions,
  CompositionContext,
  useComposition,
  InsetContext,
  useInset,
  PaneIdContext,
  usePaneIds,
  type InsetPaneId,
  type PaneIdMap,
} from './shell.context.js';

// Shell context is provided via ShellProvider (see shell.context.tsx)

// Pane resize context moved to ./_internal/shell-resize

// Local PaneHandle moved to ./_internal/shell-handles
// Removed local PaneHandle implementation; using internal PaneHandle

// Composed Handle wrappers per pane
// Handles moved to ./_internal/shell-handles

// Hook to resolve responsive presentation
// useResponsivePresentation moved to shell.hooks.ts

// Hook to resolve responsive mode defaults
// Removed: defaultMode responsiveness

// useBreakpoint hook moved to ../hooks/use-breakpoint.ts

// Reducer-based pane state management to simplify cascading rules
type PaneState = {
  leftMode: PaneMode;
  panelMode: PaneMode;
  sidebarMode: SidebarMode;
  inspectorMode: PaneMode;
  bottomMode: PaneMode;
};

type PaneAction =
  | { type: 'SET_LEFT_MODE'; mode: PaneMode }
  | { type: 'SET_PANEL_MODE'; mode: PaneMode }
  | { type: 'SET_SIDEBAR_MODE'; mode: SidebarMode }
  | { type: 'SET_INSPECTOR_MODE'; mode: PaneMode }
  | { type: 'SET_BOTTOM_MODE'; mode: PaneMode }
  | { type: 'TOGGLE_PANE'; target: PaneTarget }
  | { type: 'EXPAND_PANE'; target: PaneTarget }
  | { type: 'COLLAPSE_PANE'; target: PaneTarget };

/** Minimal prop shapes the initial-state scan needs from each slot. */
type PaneOpenProps = { open?: boolean | Partial<Record<Breakpoint, boolean>>; defaultOpen?: boolean | Partial<Record<Breakpoint, boolean>> };
type SidebarInitialProps = { state?: Responsive<SidebarMode>; defaultState?: SidebarMode | Partial<Record<Breakpoint, SidebarMode>> };

const SHELL_SLOT = Symbol.for('rtShellSlot');

type ShellSlotName = 'Shell.Left' | 'Shell.Header' | 'Shell.Rail' | 'Shell.Panel' | 'Shell.Sidebar' | 'Shell.Content' | 'Shell.Inspector' | 'Shell.Bottom';

type SlotTagged = { [SHELL_SLOT]?: ShellSlotName; displayName?: string };

function assignShellSlot<T>(component: T, slot: ShellSlotName): T {
  (component as T & SlotTagged)[SHELL_SLOT] = slot;
  return component;
}

/** Read the slot tag from an element's type. */
function slotOf(el: React.ReactNode): ShellSlotName | undefined {
  if (!React.isValidElement(el)) return undefined;
  const type = el.type as SlotTagged | undefined;
  return type?.[SHELL_SLOT] ?? (type?.displayName as ShellSlotName | undefined);
}

/**
 * Check whether an element is a given Shell slot.
 * The `SHELL_SLOT` tag survives minification; `displayName` is the fallback.
 */
const isShellComponentType = (el: React.ReactNode, comp: SlotTagged): boolean => {
  const slot = slotOf(el);
  if (slot === undefined) return false;
  return slot === (comp[SHELL_SLOT] ?? comp.displayName);
};

/** Read the props of a child element without an `any` cast. */
function slotProps<T extends Record<string, unknown>>(el: React.ReactNode): Partial<T> {
  return React.isValidElement(el) ? ((el.props ?? {}) as Partial<T>) : {};
}

/** Find the first child that fills a slot. */
function findSlot(children: React.ReactNode[], slot: ShellSlotName): React.ReactElement | undefined {
  return children.find((el) => slotOf(el) === slot) as React.ReactElement | undefined;
}

// Tag imported slot components so slot detection survives minification
assignShellSlot(Sidebar, 'Shell.Sidebar');
assignShellSlot(Inspector, 'Shell.Inspector');
assignShellSlot(Bottom, 'Shell.Bottom');

function paneReducer(state: PaneState, action: PaneAction): PaneState {
  switch (action.type) {
    case 'SET_LEFT_MODE': {
      if (action.mode === 'collapsed') {
        if (state.leftMode === 'collapsed' && state.panelMode === 'collapsed') return state;
        return { ...state, leftMode: 'collapsed', panelMode: 'collapsed' };
      }
      if (state.leftMode === action.mode) return state;
      return { ...state, leftMode: action.mode };
    }
    case 'SET_PANEL_MODE': {
      if (action.mode === 'expanded' && state.leftMode !== 'expanded') {
        return { ...state, leftMode: 'expanded', panelMode: 'expanded' };
      }
      if (state.panelMode === action.mode) return state;
      return { ...state, panelMode: action.mode };
    }
    case 'SET_SIDEBAR_MODE':
      if (state.sidebarMode === action.mode) return state;
      return { ...state, sidebarMode: action.mode };
    case 'SET_INSPECTOR_MODE':
      if (state.inspectorMode === action.mode) return state;
      return { ...state, inspectorMode: action.mode };
    case 'SET_BOTTOM_MODE':
      if (state.bottomMode === action.mode) return state;
      return { ...state, bottomMode: action.mode };
    case 'TOGGLE_PANE': {
      switch (action.target) {
        case 'left':
        case 'rail':
          return { ...state, leftMode: state.leftMode === 'expanded' ? 'collapsed' : 'expanded', panelMode: state.leftMode === 'expanded' ? 'collapsed' : state.panelMode };
        case 'panel': {
          if (state.leftMode === 'collapsed') {
            return { ...state, leftMode: 'expanded', panelMode: 'expanded' };
          }
          return { ...state, panelMode: state.panelMode === 'expanded' ? 'collapsed' : 'expanded' };
        }
        case 'sidebar': {
          const next: SidebarMode = state.sidebarMode === 'collapsed' ? 'expanded' : state.sidebarMode === 'expanded' ? 'collapsed' : 'expanded';
          return { ...state, sidebarMode: next };
        }
        case 'inspector':
          return { ...state, inspectorMode: state.inspectorMode === 'expanded' ? 'collapsed' : 'expanded' };
        case 'bottom':
          return { ...state, bottomMode: state.bottomMode === 'expanded' ? 'collapsed' : 'expanded' };
        default:
          return state;
      }
    }
    case 'EXPAND_PANE': {
      switch (action.target) {
        case 'left':
        case 'rail':
          if (state.leftMode === 'expanded') return state;
          return { ...state, leftMode: 'expanded' };
        case 'panel':
          if (state.leftMode === 'expanded' && state.panelMode === 'expanded') return state;
          return { ...state, leftMode: 'expanded', panelMode: 'expanded' };
        case 'sidebar':
          if (state.sidebarMode === 'expanded') return state;
          return { ...state, sidebarMode: 'expanded' };
        case 'inspector':
          if (state.inspectorMode === 'expanded') return state;
          return { ...state, inspectorMode: 'expanded' };
        case 'bottom':
          if (state.bottomMode === 'expanded') return state;
          return { ...state, bottomMode: 'expanded' };
        default:
          return state;
      }
    }
    case 'COLLAPSE_PANE': {
      switch (action.target) {
        case 'left':
        case 'rail':
          if (state.leftMode === 'collapsed' && state.panelMode === 'collapsed') return state;
          return { ...state, leftMode: 'collapsed', panelMode: 'collapsed' };
        case 'panel':
          if (state.panelMode === 'collapsed') return state;
          return { ...state, panelMode: 'collapsed' };
        case 'sidebar':
          if (state.sidebarMode === 'collapsed') return state;
          return { ...state, sidebarMode: 'collapsed' };
        case 'inspector':
          if (state.inspectorMode === 'collapsed') return state;
          return { ...state, inspectorMode: 'collapsed' };
        case 'bottom':
          if (state.bottomMode === 'collapsed') return state;
          return { ...state, bottomMode: 'collapsed' };
        default:
          return state;
      }
    }
  }
  return state;
}

/**
 * Derive the reducer's initial state from the immediate children.
 *
 * Responsive props resolve at the `initial` breakpoint — that is what the server renders and what
 * the client's first pass sees. `useResponsiveInitialState` re-resolves once the real breakpoint
 * is known.
 */
function computeInitialPaneState(children: React.ReactNode): PaneState {
  const childArray = React.Children.toArray(children);

  const railEl = findSlot(childArray, 'Shell.Rail');
  const railProps = slotProps<RailProps>(railEl);
  const panelProps = slotProps<PanelPublicProps>(findSlot(childArray, 'Shell.Panel'));
  const sidebarProps = slotProps<SidebarInitialProps>(findSlot(childArray, 'Shell.Sidebar'));
  const inspectorProps = slotProps<PaneOpenProps>(findSlot(childArray, 'Shell.Inspector'));
  const bottomProps = slotProps<PaneOpenProps>(findSlot(childArray, 'Shell.Bottom'));

  // A Rail with no explicit preference starts open.
  const railOpen = railEl ? (resolveResponsiveValue<boolean>(railProps.open ?? railProps.defaultOpen, 'initial') ?? true) : false;
  const panelOpen = resolveResponsiveValue<boolean>(panelProps.open ?? panelProps.defaultOpen, 'initial') ?? false;
  const inspectorOpen = resolveResponsiveValue<boolean>(inspectorProps.open ?? inspectorProps.defaultOpen, 'initial') ?? false;
  const bottomOpen = resolveResponsiveValue<boolean>(bottomProps.open ?? bottomProps.defaultOpen, 'initial') ?? false;
  const sidebarState = resolveResponsiveValue<SidebarMode>(sidebarProps.state ?? sidebarProps.defaultState, 'initial') ?? 'expanded';

  return {
    leftMode: panelOpen || railOpen ? 'expanded' : 'collapsed',
    panelMode: panelOpen ? 'expanded' : 'collapsed',
    sidebarMode: sidebarState,
    inspectorMode: inspectorOpen ? 'expanded' : 'collapsed',
    bottomMode: bottomOpen ? 'expanded' : 'collapsed',
  };
}

// Root Component
interface ShellRootProps extends React.ComponentPropsWithoutRef<'div'> {
  children: React.ReactNode;
  height?: 'full' | 'auto' | string | number;
}

const Root = React.forwardRef<HTMLDivElement, ShellRootProps>(({ className, children, height = 'full', ...props }, ref) => {
  const { breakpoint: currentBreakpoint, ready: currentBreakpointReady } = useBreakpoint();

  // Panel's uncontrolled default drives the Left passthrough when no Rail is present.
  const hasPanelDefaultOpen = React.useMemo(() => {
    const panelEl = findSlot(React.Children.toArray(children), 'Shell.Panel');
    return typeof slotProps<PanelPublicProps>(panelEl).defaultOpen !== 'undefined';
  }, [children]);

  // Pane state management via reducer with lazy initialization.
  // This computation only runs once on mount, not on every render.
  const [paneState, dispatchPane] = React.useReducer(paneReducer, children, computeInitialPaneState);
  const setLeftMode = React.useCallback((mode: PaneMode) => dispatchPane({ type: 'SET_LEFT_MODE', mode }), []);
  const setPanelMode = React.useCallback((mode: PaneMode) => dispatchPane({ type: 'SET_PANEL_MODE', mode }), []);
  const setSidebarMode = React.useCallback((mode: SidebarMode) => dispatchPane({ type: 'SET_SIDEBAR_MODE', mode }), []);
  const setInspectorMode = React.useCallback((mode: PaneMode) => dispatchPane({ type: 'SET_INSPECTOR_MODE', mode }), []);
  const setBottomMode = React.useCallback((mode: PaneMode) => dispatchPane({ type: 'SET_BOTTOM_MODE', mode }), []);

  // Removed: defaultMode responsiveness and manual change tracking

  // Composition detection
  const [hasLeft, setHasLeft] = React.useState(false);
  const [hasSidebar, setHasSidebar] = React.useState(false);

  // Customizable sidebar toggle sequencing
  const sidebarToggleComputerRef = React.useRef<(current: SidebarMode) => SidebarMode>((current) => (current === 'collapsed' ? 'thin' : current === 'thin' ? 'expanded' : 'collapsed'));
  const setSidebarToggleComputer = React.useCallback((fn: (current: SidebarMode) => SidebarMode) => {
    sidebarToggleComputerRef.current = fn;
  }, []);

  // Reducer handles left→panel cascade; no effect needed

  // Composition validation
  React.useLayoutEffect(() => {
    if (process.env.NODE_ENV === 'production') return;
    if (hasSidebar && hasLeft) {
      console.warn('Shell: Sidebar cannot coexist with Rail or Panel. Use either Rail+Panel OR Sidebar.');
    }
  }, [hasSidebar, hasLeft]);

  // Left presentation + defaults from children
  const [devLeftPres, setDevLeftPres] = React.useState<PresentationValue | undefined>(undefined);
  const onLeftPres = React.useCallback((p: PresentationValue) => setDevLeftPres(p), []);
  const railDefaultSizeRef = React.useRef<number>(64);
  const panelDefaultSizeRef = React.useRef<number>(288);
  const onRailDefaults = React.useCallback((size: number) => {
    railDefaultSizeRef.current = size;
  }, []);
  const onPanelDefaults = React.useCallback((size: number) => {
    panelDefaultSizeRef.current = size;
  }, []);

  // Determine children presence for left composition
  const hasLeftChildren = React.useMemo(() => {
    const childArray = React.Children.toArray(children) as React.ReactElement[];
    return childArray.some((el) => isShellComponentType(el, Rail) || isShellComponentType(el, Panel));
  }, [children]);

  const hasSidebarChildren = React.useMemo(() => {
    const childArray = React.Children.toArray(children) as React.ReactElement[];
    return childArray.some((el) => isShellComponentType(el, Sidebar));
  }, [children]);

  // Keep a ref to sidebar mode so togglePane doesn't depend on it,
  // preventing ActionsContext churn on every sidebar mode change
  const sidebarModeRef = React.useRef(paneState.sidebarMode);
  sidebarModeRef.current = paneState.sidebarMode;

  const togglePane = React.useCallback(
    (target: PaneTarget) => {
      if (target === 'sidebar') {
        const next = sidebarToggleComputerRef.current(sidebarModeRef.current as SidebarMode);
        setSidebarMode(next);
        return;
      }
      dispatchPane({ type: 'TOGGLE_PANE', target });
    },
    [setSidebarMode],
  );

  const expandPane = React.useCallback(
    (target: PaneTarget) => {
      if (target === 'sidebar') return setSidebarMode('expanded');
      dispatchPane({ type: 'EXPAND_PANE', target });
    },
    [setSidebarMode],
  );

  const collapsePane = React.useCallback(
    (target: PaneTarget) => {
      if (target === 'sidebar') return setSidebarMode('collapsed');
      dispatchPane({ type: 'COLLAPSE_PANE', target });
    },
    [setSidebarMode],
  );

  const baseContextValue = React.useMemo(
    () => ({
      leftMode: paneState.leftMode,
      setLeftMode,
      panelMode: paneState.panelMode,
      setPanelMode,
      sidebarMode: paneState.sidebarMode,
      setSidebarMode,
      inspectorMode: paneState.inspectorMode,
      setInspectorMode,
      bottomMode: paneState.bottomMode,
      setBottomMode,
      hasLeft,
      setHasLeft,
      hasSidebar,
      setHasSidebar,
      currentBreakpoint,
      currentBreakpointReady,
      leftResolvedPresentation: devLeftPres,
      togglePane,
      expandPane,
      collapsePane,
      setSidebarToggleComputer,
      onLeftPres,
      onRailDefaults,
      onPanelDefaults,
    }),
    [
      paneState.leftMode,
      setLeftMode,
      paneState.panelMode,
      setPanelMode,
      paneState.sidebarMode,
      setSidebarMode,
      paneState.inspectorMode,
      setInspectorMode,
      paneState.bottomMode,
      setBottomMode,
      hasLeft,
      hasSidebar,
      currentBreakpoint,
      currentBreakpointReady,
      devLeftPres,
      togglePane,
      expandPane,
      collapsePane,
      setSidebarToggleComputer,
      onLeftPres,
      onRailDefaults,
      onPanelDefaults,
    ],
  );

  // Organize children by type — single pass instead of 7 filter calls
  const { headerEls, railEls, panelEls, sidebarEls, contentEls, inspectorEls, bottomEls } = React.useMemo(() => {
    const result = {
      headerEls: [] as React.ReactElement[],
      railEls: [] as React.ReactElement[],
      panelEls: [] as React.ReactElement[],
      sidebarEls: [] as React.ReactElement[],
      contentEls: [] as React.ReactElement[],
      inspectorEls: [] as React.ReactElement[],
      bottomEls: [] as React.ReactElement[],
    };
    for (const el of React.Children.toArray(children) as React.ReactElement[]) {
      if (isShellComponentType(el, Header)) result.headerEls.push(el);
      else if (isShellComponentType(el, Rail)) result.railEls.push(el);
      else if (isShellComponentType(el, Panel)) result.panelEls.push(el);
      else if (isShellComponentType(el, Sidebar)) result.sidebarEls.push(el);
      else if (isShellComponentType(el, Content)) result.contentEls.push(el);
      else if (isShellComponentType(el, Inspector)) result.inspectorEls.push(el);
      else if (isShellComponentType(el, Bottom)) result.bottomEls.push(el);
    }
    return result;
  }, [children]);

  // The Left container owns the Rail/Panel controlled `open` props: it resolves them, syncs the
  // mode and emits the callbacks. Root only derives the value other panes need to read.
  const railControlledOpen = slotProps<RailProps>(railEls[0]).open;
  const leftControlledOpen = React.useMemo(() => resolveResponsiveValue<boolean>(railControlledOpen, currentBreakpoint), [railControlledOpen, currentBreakpoint]);

  // `full` is left to CSS so the `@supports (height: 100dvh)` rule can apply — an inline 100vh
  // would always win and leave mobile browsers with the URL-bar-inflated viewport height.
  const heightStyle = React.useMemo((): React.CSSProperties | undefined => {
    if (height === 'full') return undefined;
    if (height === 'auto') return { height: 'auto' };
    if (typeof height === 'string') return { height };
    if (typeof height === 'number') return { height: `${height}px` };
    return undefined;
  }, [height]);

  // Peek state (layout-only overlay without mode changes)
  const [peekTarget, setPeekTarget] = React.useState<PaneTarget | null>(null);
  const peekPane = React.useCallback((target: PaneTarget) => setPeekTarget(target), []);
  const clearPeek = React.useCallback(() => setPeekTarget(null), []);

  // Memoized slice context values to avoid notifying unrelated consumers
  const presentationCtxValue = React.useMemo(() => ({ currentBreakpoint, currentBreakpointReady, leftResolvedPresentation: devLeftPres }), [currentBreakpoint, currentBreakpointReady, devLeftPres]);
  const leftModeCtxValue = React.useMemo(() => ({ leftMode: paneState.leftMode, setLeftMode, leftControlledOpen }), [paneState.leftMode, setLeftMode, leftControlledOpen]);
  const panelModeCtxValue = React.useMemo(() => ({ panelMode: paneState.panelMode, setPanelMode }), [paneState.panelMode, setPanelMode]);
  const sidebarModeCtxValue = React.useMemo(() => ({ sidebarMode: paneState.sidebarMode, setSidebarMode }), [paneState.sidebarMode, setSidebarMode]);
  const inspectorModeCtxValue = React.useMemo(() => ({ inspectorMode: paneState.inspectorMode, setInspectorMode }), [paneState.inspectorMode, setInspectorMode]);
  const bottomModeCtxValue = React.useMemo(() => ({ bottomMode: paneState.bottomMode, setBottomMode }), [paneState.bottomMode, setBottomMode]);
  const compositionCtxValue = React.useMemo(() => ({ hasLeft, setHasLeft, hasSidebar, setHasSidebar }), [hasLeft, setHasLeft, hasSidebar, setHasSidebar]);

  // Inset state management
  const [insetPanes, setInsetPanes] = React.useState<Set<InsetPaneId>>(new Set());
  const registerInset = React.useCallback((id: InsetPaneId) => {
    setInsetPanes((prev) => {
      if (prev.has(id)) return prev;
      const next = new Set(prev);
      next.add(id);
      return next;
    });
  }, []);
  const unregisterInset = React.useCallback((id: InsetPaneId) => {
    setInsetPanes((prev) => {
      if (!prev.has(id)) return prev;
      const next = new Set(prev);
      next.delete(id);
      return next;
    });
  }, []);
  const hasAnyInset = insetPanes.size > 0;
  const insetCtxValue = React.useMemo(() => ({ insetPanes, registerInset, unregisterInset, hasAnyInset }), [insetPanes, registerInset, unregisterInset, hasAnyInset]);
  // Pane element ids, so Trigger can point `aria-controls` at the pane it operates.
  const [paneIds, setPaneIds] = React.useState<PaneIdMap>({});
  const registerPaneId = React.useCallback((target: PaneTarget, id: string | undefined) => {
    setPaneIds((prev) => {
      if (prev[target] === id) return prev;
      const next = { ...prev };
      if (id === undefined) delete next[target];
      else next[target] = id;
      return next;
    });
  }, []);
  const paneIdCtxValue = React.useMemo(() => ({ paneIds, registerPaneId }), [paneIds, registerPaneId]);

  const peekCtxValue = React.useMemo(() => ({ peekTarget, setPeekTarget, peekPane, clearPeek }), [peekTarget, setPeekTarget, peekPane, clearPeek]);
  const actionsCtxValue = React.useMemo(
    () => ({ togglePane, expandPane, collapsePane, setSidebarToggleComputer, onLeftPres, onRailDefaults, onPanelDefaults }),
    [togglePane, expandPane, collapsePane, setSidebarToggleComputer, onLeftPres, onRailDefaults, onPanelDefaults],
  );

  // Memoized full context value for ShellProvider to prevent unnecessary effect re-runs
  const shellContextValue = React.useMemo(
    () => ({
      ...baseContextValue,
      leftControlledOpen,
      peekTarget,
      setPeekTarget,
      peekPane,
      clearPeek,
    }),
    [baseContextValue, leftControlledOpen, peekTarget, setPeekTarget, peekPane, clearPeek],
  );

  // Memoize the Left content to avoid recreating the IIFE on every render
  const leftContent = React.useMemo(() => {
    if (!hasLeftChildren || hasSidebarChildren) return null;
    const railProps = slotProps<RailProps>(railEls[0]);
    const panelProps = slotProps<PanelPublicProps>(panelEls[0]);
    const leftInset = Boolean(railProps.inset) || Boolean(panelProps.inset);
    const passthroughProps: LeftProps = {
      // Control passthrough consumed by Left; never spread to the DOM.
      inset: leftInset,
      panelOpen: panelProps.open,
      panelOnOpenChange: panelProps.onOpenChange,
      ...(railEls.length > 0
        ? {
            onOpenChange: railProps.onOpenChange,
            open: railProps.open,
            defaultOpen: railProps.defaultOpen,
            presentation: railProps.presentation,
            collapsible: railProps.collapsible,
            onExpand: railProps.onExpand,
            onCollapse: railProps.onCollapse,
          }
        : { defaultOpen: hasPanelDefaultOpen ? true : undefined }),
    };
    return (
      <Left {...passthroughProps}>
        {railEls}
        {panelEls}
      </Left>
    );
  }, [hasLeftChildren, hasSidebarChildren, railEls, panelEls, hasPanelDefaultOpen]);

  return (
    <div {...props} ref={ref} className={classNames('rt-ShellRoot', className)} data-height={height === 'full' ? 'full' : undefined} style={{ ...heightStyle, ...props.style }}>
      <ShellProvider value={shellContextValue}>
        <PresentationContext.Provider value={presentationCtxValue}>
          <LeftModeContext.Provider value={leftModeCtxValue}>
            <PanelModeContext.Provider value={panelModeCtxValue}>
              <SidebarModeContext.Provider value={sidebarModeCtxValue}>
                <InspectorModeContext.Provider value={inspectorModeCtxValue}>
                  <BottomModeContext.Provider value={bottomModeCtxValue}>
                    <CompositionContext.Provider value={compositionCtxValue}>
                      <PeekContext.Provider value={peekCtxValue}>
                        <ActionsContext.Provider value={actionsCtxValue}>
                          <InsetContext.Provider value={insetCtxValue}>
                            <PaneIdContext.Provider value={paneIdCtxValue}>
                              {headerEls}
                              <div
                                className="rt-ShellBody"
                                data-peek-target={peekTarget ?? undefined}
                                data-has-inset={hasAnyInset || undefined}
                                style={
                                  peekTarget === 'rail' || peekTarget === 'panel'
                                    ? ({
                                        '--peek-rail-width': `${railDefaultSizeRef.current}px`,
                                      } as CSSPropertiesWithVars)
                                    : undefined
                                }
                              >
                                {leftContent ?? sidebarEls}
                                {contentEls}
                                {inspectorEls}
                              </div>
                              {bottomEls}
                            </PaneIdContext.Provider>
                          </InsetContext.Provider>
                        </ActionsContext.Provider>
                      </PeekContext.Provider>
                    </CompositionContext.Provider>
                  </BottomModeContext.Provider>
                </InspectorModeContext.Provider>
              </SidebarModeContext.Provider>
            </PanelModeContext.Provider>
          </LeftModeContext.Provider>
        </PresentationContext.Provider>
      </ShellProvider>
    </div>
  );
});
Root.displayName = 'Shell.Root';

// Header
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

// Pane Props Interface (shared by Panel, Sidebar, Inspector, Bottom)
type PaneProps = PaneBaseProps;

// Left container (auto-created for Rail+Panel)
interface LeftProps extends React.ComponentPropsWithoutRef<'div'> {
  presentation?: ResponsivePresentation;
  // Passthrough from Rail
  open?: boolean | Partial<Record<Breakpoint, boolean>>;
  defaultOpen?: boolean | Partial<Record<Breakpoint, boolean>>;
  onOpenChange?: (open: boolean, meta: { reason: 'init' | 'toggle' | 'panel' | 'responsive' }) => void;
  collapsible?: boolean;
  onExpand?: () => void;
  onCollapse?: () => void;
  /** The first Panel's controlled `open`, forwarded by Root so Left can resolve Rail/Panel conflicts. */
  panelOpen?: boolean | Partial<Record<Breakpoint, boolean>>;
  /** The first Panel's `onOpenChange`, used when a conflict closes the Panel. */
  panelOnOpenChange?: (open: boolean, meta: { reason: 'toggle' | 'left' | 'init' | 'responsive' }) => void;
  mode?: never;
  defaultMode?: never;
  onModeChange?: never;
  /** When true, adds margin and triggers gray backdrop on Shell. */
  inset?: boolean;
}

// Rail (special case)
type LeftOpenChangeMeta = { reason: 'init' | 'toggle' | 'responsive' | 'panel' };

type RailControlledProps = { open: boolean | Partial<Record<Breakpoint, boolean>>; onOpenChange?: (open: boolean, meta: LeftOpenChangeMeta) => void; defaultOpen?: never };
type RailUncontrolledProps = { defaultOpen?: boolean | Partial<Record<Breakpoint, boolean>>; onOpenChange?: (open: boolean, meta: LeftOpenChangeMeta) => void; open?: never };

type RailProps = React.ComponentPropsWithoutRef<'div'> & {
  presentation?: ResponsivePresentation;
  expandedSize?: number;
  collapsible?: boolean;
  onExpand?: () => void;
  onCollapse?: () => void;
  /** When true, adds margin to Rail+Panel and triggers gray backdrop on Shell. */
  inset?: boolean;
} & (RailControlledProps | RailUncontrolledProps);

// Left container - behaves like Inspector but contains Rail+Panel
const LEFT_DOM_OMIT_PROPS = ['open', 'defaultOpen', 'onOpenChange', 'mode', 'defaultMode', 'onModeChange'] as const;

const Left = React.forwardRef<HTMLDivElement, LeftProps>((initialProps, ref) => {
  const {
    className,
    presentation = { initial: 'fixed', sm: 'fixed' },
    collapsible: _collapsible = true,
    onExpand,
    onCollapse,
    children,
    style,
    inset,
    panelOpen,
    panelOnOpenChange,
    ...restProps
  } = initialProps;
  const { registerInset, unregisterInset } = useInset();
  const { leftMode, setLeftMode } = useLeftMode();
  const { panelMode } = usePanelMode();
  const { currentBreakpoint, currentBreakpointReady } = usePresentation();
  const { peekTarget } = usePeek();
  const { setHasLeft } = useComposition();
  const { onLeftPres } = useShellActions();
  const { registerPaneId } = usePaneIds();

  const propsOpen = restProps.open;
  const propsDefaultOpen = restProps.defaultOpen;
  const propsOnOpenChange = restProps.onOpenChange;
  const domProps = omitPaneProps(restProps, LEFT_DOM_OMIT_PROPS);
  const isControlled = typeof propsOpen !== 'undefined';

  const generatedId = React.useId();
  const elementId = domProps.id ?? generatedId;
  React.useEffect(() => {
    registerPaneId('left', elementId);
    registerPaneId('rail', elementId);
    return () => {
      registerPaneId('left', undefined);
      registerPaneId('rail', undefined);
    };
  }, [registerPaneId, elementId]);

  // Register/unregister inset
  React.useEffect(() => {
    if (inset) {
      registerInset('left');
      return () => unregisterInset('left');
    }
  }, [inset, registerInset, unregisterInset]);

  const resolvedPresentation = useResponsivePresentation(presentation);
  const isOverlay = resolvedPresentation === 'overlay';
  const isStacked = resolvedPresentation === 'stacked';
  const localRef = React.useRef<HTMLDivElement | null>(null);

  // Publish resolved presentation so Rail/Panel can gate peeking in overlay
  React.useEffect(() => {
    onLeftPres?.(resolvedPresentation);
  }, [onLeftPres, resolvedPresentation]);

  const setRef = React.useCallback(
    (node: HTMLDivElement | null) => {
      localRef.current = node;
      if (typeof ref === 'function') ref(node);
      else if (ref) (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
    },
    [ref],
  );

  // Register with shell
  React.useEffect(() => {
    setHasLeft(true);
    return () => setHasLeft(false);
  }, [setHasLeft]);

  const normalizedLeftControlled = React.useMemo(() => mapResponsiveBooleanToPaneMode(propsOpen), [propsOpen]);
  const normalizedLeftDefault = React.useMemo(() => mapResponsiveBooleanToPaneMode(propsDefaultOpen), [propsDefaultOpen]);
  const openIsResponsive = typeof propsOpen === 'object' && propsOpen !== null;

  // Stable refs for notification callbacks to avoid effect dep churn
  const propsOnOpenChangeRef = React.useRef(propsOnOpenChange);
  const panelOnOpenChangeRef = React.useRef(panelOnOpenChange);
  React.useLayoutEffect(() => {
    propsOnOpenChangeRef.current = propsOnOpenChange;
    panelOnOpenChangeRef.current = panelOnOpenChange;
  });

  const { resolvedControlled: resolvedLeftControlled } = useResponsiveInitialState<PaneMode>({
    controlledValue: normalizedLeftControlled,
    defaultValue: normalizedLeftDefault,
    currentValue: leftMode,
    setValue: setLeftMode,
    breakpointReady: currentBreakpointReady,
    controlledIsResponsive: openIsResponsive,
    onResponsiveChange: (next) => propsOnOpenChangeRef.current?.(next === 'expanded', { reason: 'responsive' }),
    onInit: (initial) => propsOnOpenChangeRef.current?.(initial === 'expanded', { reason: 'init' }),
  });

  // Emit open changes for user/internal transitions. A cascade from Panel is reported as such.
  const previousPanelModeRef = React.useRef<PaneMode>(panelMode);
  React.useLayoutEffect(() => {
    previousPanelModeRef.current = panelMode;
  });
  usePaneChangeNotify<PaneMode>({
    value: leftMode,
    resolvedControlled: resolvedLeftControlled,
    isControlled,
    notify: (mode, previousMode) => {
      const panelDrivenOpen = previousPanelModeRef.current !== panelMode && previousMode === 'collapsed' && mode === 'expanded' && panelMode === 'expanded';
      propsOnOpenChangeRef.current?.(mode === 'expanded', { reason: panelDrivenOpen ? 'panel' : 'toggle' });
    },
  });

  usePaneExpandCollapse<PaneMode>({
    mode: leftMode,
    isOpen: (mode) => mode === 'expanded',
    breakpointReady: currentBreakpointReady,
    onExpand,
    onCollapse,
  });

  // Rail closed + Panel open is contradictory. Whichever prop changed last wins, and the consumer
  // is told which one gave way. Left owns this because it sees both controlled props.
  const resolvedPanelControlled = React.useMemo(() => resolveResponsiveValue<boolean>(panelOpen, currentBreakpoint), [panelOpen, currentBreakpoint]);
  const resolvedRailControlled = React.useMemo(() => resolveResponsiveValue<boolean>(propsOpen, currentBreakpoint), [propsOpen, currentBreakpoint]);
  const controlSeqRef = React.useRef(0);
  const lastRailChangeRef = React.useRef(0);
  const lastPanelChangeRef = React.useRef(0);
  const lastRailOpenRef = React.useRef<boolean | undefined>(resolvedRailControlled);
  const lastPanelOpenRef = React.useRef<boolean | undefined>(resolvedPanelControlled);
  const lastConflictRef = React.useRef<{ railSeq: number; panelSeq: number; action: 'open-rail' | 'close-panel' } | null>(null);

  React.useLayoutEffect(() => {
    if (resolvedRailControlled === undefined) {
      lastRailOpenRef.current = undefined;
      return;
    }
    if (lastRailOpenRef.current === resolvedRailControlled) return;
    lastRailOpenRef.current = resolvedRailControlled;
    lastRailChangeRef.current = ++controlSeqRef.current;
  }, [resolvedRailControlled]);

  React.useLayoutEffect(() => {
    if (resolvedPanelControlled === undefined) {
      lastPanelOpenRef.current = undefined;
      return;
    }
    if (lastPanelOpenRef.current === resolvedPanelControlled) return;
    lastPanelOpenRef.current = resolvedPanelControlled;
    lastPanelChangeRef.current = ++controlSeqRef.current;
  }, [resolvedPanelControlled]);

  React.useLayoutEffect(() => {
    if (resolvedRailControlled !== false || resolvedPanelControlled !== true) {
      lastConflictRef.current = null;
      return;
    }

    const panelWins = lastPanelChangeRef.current > lastRailChangeRef.current;
    const action: 'open-rail' | 'close-panel' = panelWins ? 'open-rail' : 'close-panel';
    const lastConflict = lastConflictRef.current;
    if (lastConflict && lastConflict.railSeq === lastRailChangeRef.current && lastConflict.panelSeq === lastPanelChangeRef.current && lastConflict.action === action) {
      return;
    }
    lastConflictRef.current = { railSeq: lastRailChangeRef.current, panelSeq: lastPanelChangeRef.current, action };

    if (panelWins) {
      propsOnOpenChangeRef.current?.(true, { reason: 'panel' });
    } else {
      panelOnOpenChangeRef.current?.(false, { reason: 'left' });
    }
  }, [resolvedRailControlled, resolvedPanelControlled]);

  // Left is not resizable; width derives from Rail/Panel.

  if (isOverlay) {
    const open = leftMode === 'expanded';
    // Compute overlay width from child Rail/Panel expanded sizes
    const childArray = React.Children.toArray(children);
    const railEl = findSlot(childArray, 'Shell.Rail');
    const panelEl = findSlot(childArray, 'Shell.Panel');
    const railSize = slotProps<RailProps>(railEl).expandedSize ?? 64;
    const panelSize = slotProps<PanelPublicProps>(panelEl).expandedSize ?? 288;
    const overlayPx = (railEl ? railSize : 0) + (panelMode === 'expanded' && panelEl ? panelSize : 0);
    return (
      <Sheet.Root open={open} onOpenChange={(o) => setLeftMode(o ? 'expanded' : 'collapsed')}>
        <Sheet.Content
          side="start"
          style={{ padding: 0 }}
          aria-label="Navigation"
          aria-describedby={undefined}
          width={{
            initial: `${overlayPx}px`,
          }}
        >
          <VisuallyHidden>
            <Sheet.Title>Navigation</Sheet.Title>
          </VisuallyHidden>
          <div className="rt-ShellLeft">{children}</div>
        </Sheet.Content>
      </Sheet.Root>
    );
  }

  const isPeeking = peekTarget === 'left' || peekTarget === 'rail' || peekTarget === 'panel';

  return (
    <div
      {...domProps}
      id={elementId}
      ref={setRef}
      className={classNames('rt-ShellLeft', className)}
      data-mode={leftMode}
      data-peek={isPeeking || undefined}
      data-presentation={resolvedPresentation}
      data-inset={inset || undefined}
      data-open={(isStacked && leftMode === 'expanded') || undefined}
      style={style}
    >
      {children}
    </div>
  );
});
Left.displayName = 'Shell.Left';
assignShellSlot(Left as any, 'Shell.Left');

const Rail = React.forwardRef<HTMLDivElement, RailProps>((initialProps, ref) => {
  const {
    className,
    presentation: _presentation,
    expandedSize = 64,
    collapsible: _collapsible,
    onExpand: _onExpand,
    onCollapse: _onCollapse,
    children,
    style,
    open,
    defaultOpen,
    onOpenChange: _onOpenChange,
    inset: _inset,
    ...domProps
  } = initialProps;
  const { leftMode } = useLeftMode();
  const { currentBreakpointReady, leftResolvedPresentation } = usePresentation();
  const { peekTarget } = usePeek();
  const { onRailDefaults } = useShellActions();

  // Dev guards
  if (process.env.NODE_ENV !== 'production') {
    if (typeof open !== 'undefined' && typeof defaultOpen !== 'undefined') {
      console.error('Shell.Rail: Do not pass both `open` and `defaultOpen`. Choose one.');
    }
  }
  useControlledSwitchWarning('Shell.Rail', 'open', typeof open !== 'undefined');

  // Register expanded size with Left container
  React.useEffect(() => {
    onRailDefaults?.(expandedSize);
  }, [onRailDefaults, expandedSize]);

  const isExpanded = leftMode === 'expanded';
  const isPeeking = currentBreakpointReady && leftResolvedPresentation !== 'overlay' && peekTarget === 'rail';

  // Strip unknown open/defaultOpen props from DOM by not spreading them
  return (
    <div
      role="navigation"
      aria-label="Main"
      {...domProps}
      ref={ref}
      className={classNames('rt-ShellRail', className)}
      data-mode={leftMode}
      data-peek={isPeeking || undefined}
      style={
        {
          ...style,
          '--rail-size': `${expandedSize}px`,
        } as CSSPropertiesWithVars
      }
    >
      <div className="rt-ShellRailContent" data-visible={(currentBreakpointReady && (isExpanded || isPeeking)) || undefined}>
        {children}
      </div>
    </div>
  );
});
Rail.displayName = 'Shell.Rail';
assignShellSlot(Rail as any, 'Shell.Rail');

// Panel
type HandleComponent = React.ForwardRefExoticComponent<React.ComponentPropsWithoutRef<'div'> & React.RefAttributes<HTMLDivElement>>;

type PanelOpenChangeMeta = { reason: 'toggle' | 'left' | 'init' | 'responsive' };
type PanelControlledProps = { open: boolean | Partial<Record<Breakpoint, boolean>>; onOpenChange?: (open: boolean, meta: PanelOpenChangeMeta) => void; defaultOpen?: never };
type PanelUncontrolledProps = { defaultOpen?: boolean | Partial<Record<Breakpoint, boolean>>; onOpenChange?: (open: boolean, meta: PanelOpenChangeMeta) => void; open?: never };

type PanelSizeControlledProps = { size: number | string; defaultSize?: never };
type PanelSizeUncontrolledProps = { defaultSize?: number | string; size?: never };

type PanelSizeChangeMeta = { reason: 'init' | 'resize' | 'controlled' };
type PanelPublicProps = Omit<PaneProps, 'presentation' | 'defaultMode'> &
  (PanelControlledProps | PanelUncontrolledProps) &
  (PanelSizeControlledProps | PanelSizeUncontrolledProps) & {
    onSizeChange?: (size: number, meta: PanelSizeChangeMeta) => void;
    sizeUpdate?: 'throttle' | 'debounce';
    sizeUpdateMs?: number;
    /** When true, adds margin to Rail+Panel and triggers gray backdrop on Shell. */
    inset?: boolean;
  };
type PanelComponent = React.ForwardRefExoticComponent<PanelPublicProps & React.RefAttributes<HTMLDivElement>> & {
  Handle: HandleComponent;
};

type _SidebarComponent = React.ForwardRefExoticComponent<
  (Omit<PaneProps, 'mode' | 'defaultMode' | 'onModeChange'> & {
    state?: Responsive<SidebarMode>;
    defaultState?: SidebarMode;
    onStateChange?: (mode: SidebarMode) => void;
    thinSize?: number;
    toggleModes?: 'both' | 'single';
  }) &
    React.RefAttributes<HTMLDivElement>
> & { Handle: HandleComponent };

type _InspectorComponent = React.ForwardRefExoticComponent<PaneProps & React.RefAttributes<HTMLDivElement>> & { Handle: HandleComponent };

type _BottomComponent = React.ForwardRefExoticComponent<PaneProps & React.RefAttributes<HTMLDivElement>> & { Handle: HandleComponent };

const PANEL_DOM_PROP_KEYS = [
  'className',
  'children',
  'defaultOpen',
  'open',
  'onOpenChange',
  'size',
  'defaultSize',
  'onSizeChange',
  'sizeUpdate',
  'sizeUpdateMs',
  'style',
] as const satisfies readonly (keyof PanelPublicProps)[];

const Panel = assignShellSlot(
  React.forwardRef<HTMLDivElement, PanelPublicProps>((initialProps, ref) => {
    const {
      className,
      defaultOpen,
      open,
      onOpenChange,
      size,
      defaultSize,
      expandedSize = 288,
      minSize,
      maxSize,
      resizable,
      collapsible = true,
      onExpand: _onExpand,
      onCollapse: _onCollapse,
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
    } = initialProps;
    const panelDomProps = extractPaneDomProps(initialProps, PANEL_DOM_PROP_KEYS);
    const { panelMode, setPanelMode } = usePanelMode();
    const { leftMode, setLeftMode, leftControlledOpen } = useLeftMode();
    const { currentBreakpointReady, leftResolvedPresentation } = usePresentation();
    const { peekTarget } = usePeek();
    const { togglePane, onPanelDefaults } = useShellActions();
    const { registerPaneId } = usePaneIds();

    const generatedId = React.useId();
    const elementId = initialProps.id ?? generatedId;
    React.useEffect(() => {
      registerPaneId('panel', elementId);
      return () => registerPaneId('panel', undefined);
    }, [registerPaneId, elementId]);

    const isControlled = typeof open !== 'undefined';

    // Dev-only runtime guard
    if (process.env.NODE_ENV !== 'production') {
      if (typeof open !== 'undefined' && typeof defaultOpen !== 'undefined') {
        console.error('Shell.Panel: Do not pass both `open` and `defaultOpen`. Choose one.');
      }
      if (typeof size !== 'undefined' && typeof defaultSize !== 'undefined') {
        console.error('Shell.Panel: Do not pass both `size` and `defaultSize`. Choose one.');
      }
    }
    useControlledSwitchWarning('Shell.Panel', 'open', isControlled);

    // Normalize responsive open/defaultOpen to PaneMode
    const normalizedControlledOpen = React.useMemo(() => mapResponsiveBooleanToPaneMode(open), [open]);
    const normalizedDefaultOpen = React.useMemo(() => mapResponsiveBooleanToPaneMode(defaultOpen), [defaultOpen]);
    const openIsResponsive = typeof open === 'object' && open !== null;

    // Stable ref for onOpenChange to avoid effect dep churn
    const onOpenChangeRef = React.useRef(onOpenChange);
    React.useLayoutEffect(() => {
      onOpenChangeRef.current = onOpenChange;
    });

    // Use responsive initial state hook for proper breakpoint handling
    const { resolvedControlled: resolvedPanelControlled } = useResponsiveInitialState<PaneMode>({
      controlledValue: normalizedControlledOpen,
      defaultValue: normalizedDefaultOpen,
      currentValue: panelMode,
      setValue: (mode) => {
        // Ensure Left is expanded when Panel is expanded unless Rail is controlled closed
        if (mode === 'expanded' && leftMode !== 'expanded' && leftControlledOpen !== false) {
          setLeftMode('expanded');
        }
        setPanelMode(mode);
      },
      breakpointReady: currentBreakpointReady,
      controlledIsResponsive: openIsResponsive,
      onResponsiveChange: (next) => onOpenChangeRef.current?.(next === 'expanded', { reason: 'responsive' }),
      onInit: (initial) => {
        if (!isControlled) {
          onOpenChangeRef.current?.(initial === 'expanded', { reason: 'init' });
        }
      },
    });

    React.useEffect(() => {
      onPanelDefaults?.(expandedSize);
    }, [onPanelDefaults, expandedSize]);

    const localRef = React.useRef<HTMLDivElement | null>(null);
    const setRef = React.useCallback(
      (node: HTMLDivElement | null) => {
        localRef.current = node;
        if (typeof ref === 'function') ref(node);
        else if (ref) (ref as React.MutableRefObject<HTMLDivElement | null>).current = node;
      },
      [ref],
    );
    const childArray = React.Children.toArray(children) as React.ReactElement[];
    const handleChildren = childArray.filter((el: React.ReactElement) => React.isValidElement(el) && el.type === PanelHandle);
    const contentChildren = childArray.filter((el: React.ReactElement) => !(React.isValidElement(el) && el.type === PanelHandle));

    const isOverlay = leftResolvedPresentation === 'overlay';
    const isExpanded = leftMode === 'expanded' && panelMode === 'expanded';

    const { currentSize, commitSize, persistenceAdapter } = usePaneSize({
      containerRef: localRef,
      cssVar: '--panel-size',
      storageNamespace: 'panel',
      orientation: 'horizontal',
      componentName: 'Shell.Panel',
      expandedSize,
      minSize,
      maxSize,
      size,
      defaultSize,
      onSizeChange,
      sizeUpdate,
      sizeUpdateMs,
      onResize,
      paneId,
      persistence,
      persistenceEnabled: Boolean(resizable) && !isOverlay,
    });

    // In overlay the Panel always uses its fixed expandedSize, ignoring any persisted size.
    const paneSize = isOverlay ? expandedSize : currentSize;

    // Notify on internal toggles and left cascade.
    const previousLeftModeRef = React.useRef<PaneMode>(leftMode);
    React.useLayoutEffect(() => {
      previousLeftModeRef.current = leftMode;
    });
    usePaneChangeNotify<PaneMode>({
      value: panelMode,
      resolvedControlled: resolvedPanelControlled,
      isControlled,
      notify: (mode) => {
        const nextOpen = mode === 'expanded';
        const leftDrivenClose = previousLeftModeRef.current !== leftMode && leftMode === 'collapsed' && !nextOpen;
        onOpenChangeRef.current?.(nextOpen, { reason: leftDrivenClose ? 'left' : 'toggle' });
      },
    });

    // Provide resizer handle when fixed (not overlay)
    const handleEl =
      resizable && !isOverlay && isExpanded ? (
        <PaneResizeContext.Provider
          value={{
            containerRef: localRef,
            cssVarName: '--panel-size',
            minSize: typeof minSize === 'number' ? minSize : 100,
            maxSize: typeof maxSize === 'number' ? maxSize : 800,
            defaultSize: expandedSize,
            currentSize,
            orientation: 'vertical',
            edge: 'end',
            computeNext: (client, startClient, startSize) => {
              const container = localRef.current;
              const isRtl = container ? getComputedStyle(container).direction === 'rtl' : false;
              const delta = client - startClient;
              return startSize + (isRtl ? -delta : delta);
            },
            onResize,
            onResizeStart,
            onResizeEnd: (nextSize) => {
              onResizeEnd?.(nextSize);
              commitSize(nextSize, 'resize');
              persistenceAdapter?.save?.(nextSize);
            },
            target: 'panel',
            collapsible: Boolean(collapsible),
            snapPoints,
            snapTolerance: snapTolerance ?? 8,
            collapseThreshold,
            requestCollapse: () => setPanelMode('collapsed'),
            requestToggle: () => togglePane('panel'),
          }}
        >
          {handleChildren.length > 0 ? handleChildren.map((el, i) => React.cloneElement(el, { key: el.key ?? i })) : <PaneHandle />}
        </PaneResizeContext.Provider>
      ) : null;

    const isPeeking = currentBreakpointReady && !isOverlay && peekTarget === 'panel';

    return (
      <div
        {...panelDomProps}
        id={elementId}
        ref={setRef}
        className={classNames('rt-ShellPanel', className)}
        data-mode={panelMode}
        data-visible={(currentBreakpointReady && (isExpanded || isPeeking)) || undefined}
        data-peek={isPeeking || undefined}
        style={
          {
            ...style,
            '--panel-size': `${paneSize}px`,
          } as CSSPropertiesWithVars
        }
      >
        <div className="rt-ShellPanelContent" data-visible={isExpanded || undefined}>
          {contentChildren}
        </div>
        {handleEl}
      </div>
    );
  }),
  'Shell.Panel',
) as PanelComponent;
Panel.displayName = 'Shell.Panel';
Panel.Handle = PanelHandle;

// Sidebar moved to ./_internal/shell-sidebar

// Content (always required)
interface ShellContentProps extends React.ComponentPropsWithoutRef<'main'> {
  /** When true, adds margin and triggers gray backdrop on Shell. */
  inset?: boolean;
}

const Content = React.forwardRef<HTMLElement, ShellContentProps>(({ className, inset, ...props }, ref) => {
  const { registerInset, unregisterInset } = useInset();

  // Register/unregister inset
  React.useEffect(() => {
    if (inset) {
      registerInset('content');
      return () => unregisterInset('content');
    }
  }, [inset, registerInset, unregisterInset]);

  return <main {...props} ref={ref} className={classNames('rt-ShellContent', className)} data-inset={inset || undefined} />;
});
Content.displayName = 'Shell.Content';
assignShellSlot(Content as any, 'Shell.Content');

// Inspector moved to ./_internal/shell-inspector

// Bottom
// Bottom moved to ./_internal/shell-bottom
// (Bottom implementation extracted)

// Trigger
// PaneTarget type moved to shell.types.ts
type TriggerAction = 'toggle' | 'expand' | 'collapse';

interface TriggerProps extends React.ComponentPropsWithoutRef<'button'> {
  target: PaneTarget;
  action?: TriggerAction;
  /**
   * Whether to show peek preview on hover when the target pane is collapsed.
   * Defaults to false.
   */
  peekOnHover?: boolean;
}

const Trigger = React.forwardRef<HTMLButtonElement, TriggerProps>(({ target, action = 'toggle', peekOnHover, onClick, onMouseEnter, onMouseLeave, children, ...props }, ref) => {
  // Slice hooks — Trigger only re-renders when its target pane's slice changes,
  // not on every unrelated shell state update (peek, composition, presentation, etc.)
  const { leftMode } = useLeftMode();
  const { panelMode } = usePanelMode();
  const { sidebarMode } = useSidebarMode();
  const { inspectorMode } = useInspectorMode();
  const { bottomMode } = useBottomMode();
  const { peekTarget, clearPeek, peekPane } = usePeek();
  const { togglePane, expandPane, collapsePane } = useShellActions();
  const { paneIds } = usePaneIds();

  const handleClick = React.useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      onClick?.(event);

      // Clear any active peek on this target before toggling to avoid sticky peek state
      if (peekTarget === target) {
        clearPeek();
      }

      switch (action) {
        case 'toggle':
          togglePane(target);
          break;
        case 'expand':
          expandPane(target);
          break;
        case 'collapse':
          collapsePane(target);
          break;
      }
    },
    [peekTarget, clearPeek, togglePane, expandPane, collapsePane, target, action, onClick],
  );

  const isCollapsed = (() => {
    switch (target) {
      case 'left':
      case 'rail':
        return leftMode === 'collapsed';
      case 'panel':
        return leftMode === 'collapsed' || panelMode === 'collapsed';
      case 'sidebar':
        return sidebarMode === 'collapsed';
      case 'inspector':
        return inspectorMode === 'collapsed';
      case 'bottom':
        return bottomMode === 'collapsed';
    }
  })();

  const handleMouseEnter = React.useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      onMouseEnter?.(event);
      if (!peekOnHover || !isCollapsed) return;
      peekPane(target);
    },
    [onMouseEnter, peekOnHover, isCollapsed, peekPane, target],
  );

  const handleMouseLeave = React.useCallback(
    (event: React.MouseEvent<HTMLButtonElement>) => {
      onMouseLeave?.(event);
      if (!peekOnHover) return;
      if (peekTarget === target) {
        clearPeek();
      }
    },
    [onMouseLeave, peekOnHover, peekTarget, clearPeek, target],
  );

  // A peek belongs to the trigger that opened it. If the trigger goes away mid-hover — a route
  // change, a conditional render — nothing else would clear it.
  const ownsPeek = peekTarget === target;
  const ownsPeekRef = React.useRef(ownsPeek);
  React.useLayoutEffect(() => {
    ownsPeekRef.current = ownsPeek;
  });
  React.useEffect(
    () => () => {
      if (ownsPeekRef.current) clearPeek();
    },
    [clearPeek],
  );

  const controlledPaneId = paneIds[target === 'rail' ? 'left' : target] ?? paneIds[target];

  return (
    <button
      {...props}
      ref={ref}
      onClick={handleClick}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      data-shell-trigger={target}
      data-shell-action={action}
      aria-expanded={!isCollapsed}
      aria-controls={controlledPaneId}
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
