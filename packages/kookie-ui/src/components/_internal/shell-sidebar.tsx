import * as React from 'react';
import classNames from 'classnames';
import * as Sheet from '../sheet.js';
import { VisuallyHidden } from '../visually-hidden.js';
import { useSidebarMode, usePresentation, usePeek, useShellActions, useComposition, useInset, usePaneIds } from '../shell.context.js';
import { useResponsivePresentation, useResponsiveInitialState } from '../shell.hooks.js';
import { PaneResizeContext } from './shell-resize.js';
import { extractPaneDomProps } from './shell-prop-helpers.js';
import { SidebarHandle, PaneHandle } from './shell-handles.js';
import type { Breakpoint, PaneMode, SidebarMode, Responsive, PaneBaseProps, CSSPropertiesWithVars } from '../shell.types.js';
import { usePaneSize, usePaneChangeNotify, usePaneExpandCollapse, useControlledSwitchWarning } from './shell-pane-hooks.js';

type SidebarPaneProps = PaneBaseProps & {
  mode?: PaneMode;
  defaultMode?: never;
  onModeChange?: (mode: PaneMode | SidebarMode) => void;
};

type SidebarStateChangeMeta = { reason: 'init' | 'toggle' | 'responsive' };
type SidebarControlledProps = { state: Responsive<SidebarMode>; onStateChange?: (state: SidebarMode, meta: SidebarStateChangeMeta) => void; defaultState?: never };
type SidebarUncontrolledProps = { defaultState?: SidebarMode | Partial<Record<Breakpoint, SidebarMode>>; onStateChange?: (state: SidebarMode, meta: SidebarStateChangeMeta) => void; state?: never };
type SidebarPublicProps = Omit<SidebarPaneProps, 'mode' | 'defaultMode' | 'onModeChange'> & {
  // removed legacy mode props
  thinSize?: number;
  toggleModes?: 'both' | 'single';
  // size API (width when expanded)
  size?: number | string;
  defaultSize?: number | string;
  onSizeChange?: (size: number, meta: { reason: 'init' | 'resize' | 'controlled' }) => void;
  sizeUpdate?: 'throttle' | 'debounce';
  sizeUpdateMs?: number;
  /** When true, adds margin and triggers gray backdrop on Shell. */
  inset?: boolean;
} & (SidebarControlledProps | SidebarUncontrolledProps);

type SidebarComponent = React.ForwardRefExoticComponent<SidebarPublicProps & React.RefAttributes<HTMLDivElement>> & { Handle: typeof SidebarHandle };

const SIDEBAR_DOM_PROP_KEYS = [
  'className',
  'children',
  'state',
  'defaultState',
  'onStateChange',
  'thinSize',
  'toggleModes',
  'size',
  'defaultSize',
  'onSizeChange',
  'sizeUpdate',
  'sizeUpdateMs',
  'style',
  'inset',
] as const satisfies readonly (keyof SidebarPublicProps)[];

const isSidebarOpen = (mode: SidebarMode) => mode !== 'collapsed';

export const Sidebar = React.forwardRef<HTMLDivElement, SidebarPublicProps>((initialProps, ref) => {
  const {
    className,
    presentation = { initial: 'overlay', md: 'fixed' },
    expandedSize = 288,
    minSize = 200,
    maxSize = 400,
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
    thinSize = 64,
    toggleModes,
    state,
    defaultState,
    onStateChange,
    size,
    defaultSize,
    onSizeChange,
    sizeUpdate,
    sizeUpdateMs = 50,
    inset,
  } = initialProps;
  const sidebarDomProps = extractPaneDomProps(initialProps, SIDEBAR_DOM_PROP_KEYS);
  const { sidebarMode, setSidebarMode } = useSidebarMode();
  const { currentBreakpointReady } = usePresentation();
  const { peekTarget } = usePeek();
  const { togglePane, setSidebarToggleComputer } = useShellActions();
  const { setHasSidebar } = useComposition();
  const { registerInset, unregisterInset } = useInset();
  const { registerPaneId } = usePaneIds();

  const generatedId = React.useId();
  const elementId = initialProps.id ?? generatedId;
  React.useEffect(() => {
    registerPaneId('sidebar', elementId);
    return () => registerPaneId('sidebar', undefined);
  }, [registerPaneId, elementId]);

  // Register/unregister inset
  React.useLayoutEffect(() => {
    if (inset) {
      registerInset('sidebar');
      return () => unregisterInset('sidebar');
    }
  }, [inset, registerInset, unregisterInset]);
  const resolvedPresentation = useResponsivePresentation(presentation);
  const isOverlay = resolvedPresentation === 'overlay';
  const isStacked = resolvedPresentation === 'stacked';
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
  const handleChildren = childArray.filter((el: React.ReactElement) => React.isValidElement(el) && el.type === SidebarHandle);
  const contentChildren = childArray.filter((el: React.ReactElement) => !(React.isValidElement(el) && el.type === SidebarHandle));

  // Register with shell
  React.useEffect(() => {
    setHasSidebar(true);
    return () => {
      setHasSidebar(false);
    };
  }, [setHasSidebar]);

  const isControlled = typeof state !== 'undefined';

  // Dev guards
  if (process.env.NODE_ENV !== 'production') {
    if (typeof state !== 'undefined' && typeof defaultState !== 'undefined') {
      console.error('Shell.Sidebar: Do not pass both `state` and `defaultState`. Choose one.');
    }
    if (typeof size !== 'undefined' && typeof defaultSize !== 'undefined') {
      console.error('Shell.Sidebar: Do not pass both `size` and `defaultSize`. Choose one.');
    }
  }
  useControlledSwitchWarning('Shell.Sidebar', 'state', isControlled);

  // Stable ref for onStateChange to avoid effect dep churn
  const onStateChangeRef = React.useRef(onStateChange);
  React.useLayoutEffect(() => {
    onStateChangeRef.current = onStateChange;
  });

  // Resolve responsive controlled state at top level
  const stateIsResponsive = typeof state === 'object' && state !== null;
  const { resolvedControlled: resolvedSidebarControlled, resolvedDefault: resolvedSidebarDefault } = useResponsiveInitialState<SidebarMode>({
    controlledValue: state,
    defaultValue: defaultState,
    currentValue: sidebarMode as SidebarMode,
    setValue: setSidebarMode,
    breakpointReady: currentBreakpointReady,
    controlledIsResponsive: stateIsResponsive,
    onResponsiveChange: (next) => onStateChangeRef.current?.(next, { reason: 'responsive' }),
    onInit: (initial) => onStateChangeRef.current?.(initial, { reason: 'init' }),
  });

  usePaneChangeNotify<SidebarMode>({
    value: sidebarMode as SidebarMode,
    resolvedControlled: resolvedSidebarControlled,
    isControlled,
    notify: (mode) => onStateChangeRef.current?.(mode, { reason: 'toggle' }),
  });

  usePaneExpandCollapse<SidebarMode>({
    mode: sidebarMode as SidebarMode,
    isOpen: isSidebarOpen,
    breakpointReady: currentBreakpointReady,
    onExpand,
    onCollapse,
  });

  // Option A: thin is width-only; content remains visible whenever not collapsed
  const isContentVisible = sidebarMode !== 'collapsed';

  const { currentSize, commitSize, persistenceAdapter } = usePaneSize({
    containerRef: localRef,
    cssVar: '--sidebar-size',
    storageNamespace: 'sidebar',
    orientation: 'horizontal',
    componentName: 'Shell.Sidebar',
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

  // Register custom toggle behavior based on toggleModes (both|single)
  const resolveDefaultSidebarMode = React.useCallback((): SidebarMode => {
    const resolved = resolvedSidebarDefault ?? (typeof defaultState === 'string' ? defaultState : undefined) ?? 'expanded';
    return resolved === 'thin' || resolved === 'expanded' ? resolved : 'expanded';
  }, [resolvedSidebarDefault, defaultState]);

  React.useEffect(() => {
    if (!setSidebarToggleComputer) return;
    const strategy: 'both' | 'single' = toggleModes ?? 'both';
    const compute = (current: SidebarMode): SidebarMode => {
      if (strategy === 'both') {
        if (current === 'collapsed') return 'thin';
        if (current === 'thin') return 'expanded';
        return 'collapsed';
      }
      const target = resolveDefaultSidebarMode();
      if (current === 'collapsed') return target;
      if (current === target) return 'collapsed';
      return target;
    };
    setSidebarToggleComputer(compute);
    return () => {
      setSidebarToggleComputer?.((cur) => (cur === 'collapsed' ? 'thin' : cur === 'thin' ? 'expanded' : 'collapsed'));
    };
  }, [setSidebarToggleComputer, toggleModes, resolveDefaultSidebarMode]);

  const lastOverlayWidthRef = React.useRef<number>(expandedSize);
  React.useEffect(() => {
    if (sidebarMode !== 'collapsed') {
      lastOverlayWidthRef.current = sidebarMode === 'thin' ? thinSize : expandedSize;
    }
  }, [sidebarMode, thinSize, expandedSize]);

  const handleEl =
    resizable && !isOverlay && sidebarMode === 'expanded' ? (
      <PaneResizeContext.Provider
        value={{
          containerRef: localRef,
          cssVarName: '--sidebar-size',
          minSize,
          maxSize,
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
          target: 'sidebar',
          collapsible,
          snapPoints,
          snapTolerance: snapTolerance ?? 8,
          collapseThreshold,
          requestCollapse: () => setSidebarMode('collapsed'),
          requestToggle: () => togglePane('sidebar'),
        }}
      >
        {handleChildren.length > 0 ? handleChildren.map((el, i) => React.cloneElement(el, { key: el.key ?? i })) : <PaneHandle />}
      </PaneResizeContext.Provider>
    ) : null;

  // Peek shows the width the next toggle would produce.
  const peekStyles = React.useMemo((): CSSPropertiesWithVars | undefined => {
    if (!(peekTarget === 'sidebar' && sidebarMode === 'collapsed' && !isOverlay)) {
      return undefined;
    }
    const strategy: 'both' | 'single' = toggleModes ?? 'both';
    const next: SidebarMode = strategy === 'both' ? 'thin' : resolveDefaultSidebarMode();
    if (next === 'thin') {
      return { '--peek-sidebar-width': `${thinSize}px` } as CSSPropertiesWithVars;
    }
    return { '--peek-sidebar-width': `var(--sidebar-size, ${expandedSize}px)` } as CSSPropertiesWithVars;
  }, [peekTarget, sidebarMode, isOverlay, toggleModes, resolveDefaultSidebarMode, thinSize, expandedSize]);

  if (isOverlay) {
    const overlayOpen = sidebarMode !== 'collapsed';
    return (
      <Sheet.Root open={overlayOpen} onOpenChange={(o) => setSidebarMode(o ? 'expanded' : 'collapsed')}>
        <Sheet.Content
          side="start"
          style={{ padding: 0 }}
          aria-label="Navigation"
          aria-describedby={undefined}
          width={{
            initial: `${overlayOpen ? (sidebarMode === 'thin' ? thinSize : expandedSize) : lastOverlayWidthRef.current}px`,
          }}
        >
          <VisuallyHidden>
            <Sheet.Title>Navigation</Sheet.Title>
          </VisuallyHidden>
          {contentChildren}
        </Sheet.Content>
      </Sheet.Root>
    );
  }
  return (
    <div
      role="navigation"
      aria-label="Navigation"
      {...sidebarDomProps}
      id={elementId}
      ref={setRef}
      className={classNames('rt-ShellSidebar', className)}
      data-mode={sidebarMode}
      data-peek={peekTarget === 'sidebar' || undefined}
      data-presentation={currentBreakpointReady ? resolvedPresentation : undefined}
      data-open={(currentBreakpointReady && isStacked && isContentVisible) || undefined}
      data-inset={inset || undefined}
      style={
        {
          ...style,
          '--sidebar-size': `${currentSize}px`,
          '--sidebar-thin-size': `${thinSize}px`,
          '--sidebar-min-size': `${minSize}px`,
          '--sidebar-max-size': `${maxSize}px`,
          ...peekStyles,
        } as CSSPropertiesWithVars
      }
    >
      <div className="rt-ShellSidebarContent" data-visible={isContentVisible || undefined}>
        {contentChildren}
      </div>
      {handleEl}
    </div>
  );
}) as SidebarComponent;

Sidebar.displayName = 'Shell.Sidebar';
Sidebar.Handle = SidebarHandle;
