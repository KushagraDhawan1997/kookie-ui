import * as React from 'react';
import classNames from 'classnames';
import * as Sheet from '../sheet.js';
import { VisuallyHidden } from '../visually-hidden.js';
import { useInspectorMode, usePresentation, usePeek, useShellActions, useInset, usePaneIds } from '../shell.context.js';
import { useResponsivePresentation, useResponsiveInitialState } from '../shell.hooks.js';
import { PaneResizeContext } from './shell-resize.js';
import { InspectorHandle, PaneHandle } from './shell-handles.js';
import type { Breakpoint, PaneMode, PaneBaseProps, CSSPropertiesWithVars } from '../shell.types.js';
import { extractPaneDomProps, mapResponsiveBooleanToPaneMode } from './shell-prop-helpers.js';
import { usePaneSize, usePaneChangeNotify, usePaneExpandCollapse, useControlledSwitchWarning } from './shell-pane-hooks.js';

type InspectorOpenChangeMeta = { reason: 'init' | 'toggle' | 'responsive' };
type InspectorControlledProps = { open: boolean | Partial<Record<Breakpoint, boolean>>; onOpenChange?: (open: boolean, meta: InspectorOpenChangeMeta) => void; defaultOpen?: never };
type InspectorUncontrolledProps = { defaultOpen?: boolean | Partial<Record<Breakpoint, boolean>>; onOpenChange?: (open: boolean, meta: InspectorOpenChangeMeta) => void; open?: never };
type InspectorSizeChangeMeta = { reason: 'init' | 'resize' | 'controlled' };
type InspectorSizeControlledProps = { size: number | string; defaultSize?: never };
type InspectorSizeUncontrolledProps = { defaultSize?: number | string; size?: never };
type InspectorPublicProps = PaneBaseProps &
  (InspectorControlledProps | InspectorUncontrolledProps) &
  (InspectorSizeControlledProps | InspectorSizeUncontrolledProps) & {
    onSizeChange?: (size: number, meta: InspectorSizeChangeMeta) => void;
    sizeUpdate?: 'throttle' | 'debounce';
    sizeUpdateMs?: number;
    /** When true, adds margin and triggers gray backdrop on Shell. */
    inset?: boolean;
  };

type InspectorComponent = React.ForwardRefExoticComponent<InspectorPublicProps & React.RefAttributes<HTMLDivElement>> & { Handle: typeof InspectorHandle };

const INSPECTOR_DOM_PROP_KEYS = [
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
  'inset',
] as const satisfies readonly (keyof InspectorPublicProps)[];

export const Inspector = React.forwardRef<HTMLDivElement, InspectorPublicProps>((initialProps, ref) => {
  const {
    className,
    presentation = { initial: 'overlay', lg: 'fixed' },
    defaultOpen,
    open,
    onOpenChange,
    expandedSize = 320,
    minSize = 200,
    maxSize = 500,
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
    size,
    defaultSize,
    inset,
  } = initialProps;
  const inspectorDomProps = extractPaneDomProps(initialProps, INSPECTOR_DOM_PROP_KEYS);
  const { inspectorMode, setInspectorMode } = useInspectorMode();
  const { currentBreakpointReady } = usePresentation();
  const { peekTarget } = usePeek();
  const { togglePane } = useShellActions();
  const { registerInset, unregisterInset } = useInset();
  const { registerPaneId } = usePaneIds();

  const generatedId = React.useId();
  const elementId = initialProps.id ?? generatedId;
  React.useEffect(() => {
    registerPaneId('inspector', elementId);
    return () => registerPaneId('inspector', undefined);
  }, [registerPaneId, elementId]);

  // Register/unregister inset
  React.useLayoutEffect(() => {
    if (inset) {
      registerInset('inspector');
      return () => unregisterInset('inspector');
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
  const handleChildren = childArray.filter((el: React.ReactElement) => React.isValidElement(el) && el.type === InspectorHandle);
  const contentChildren = childArray.filter((el: React.ReactElement) => !(React.isValidElement(el) && el.type === InspectorHandle));

  const isControlled = typeof open !== 'undefined';

  // Stable ref for onOpenChange to avoid effect dep churn
  const onOpenChangeRef = React.useRef(onOpenChange);
  React.useLayoutEffect(() => {
    onOpenChangeRef.current = onOpenChange;
  });

  const normalizedControlledOpen = React.useMemo(() => mapResponsiveBooleanToPaneMode(open), [open]);
  const normalizedDefaultOpen = React.useMemo(() => mapResponsiveBooleanToPaneMode(defaultOpen), [defaultOpen]);
  const openIsResponsive = typeof open === 'object' && open !== null;
  const { resolvedControlled: resolvedInspectorControlled } = useResponsiveInitialState<PaneMode>({
    controlledValue: normalizedControlledOpen,
    defaultValue: normalizedDefaultOpen,
    currentValue: inspectorMode,
    setValue: setInspectorMode,
    breakpointReady: currentBreakpointReady,
    controlledIsResponsive: openIsResponsive,
    onResponsiveChange: (next) => onOpenChangeRef.current?.(next === 'expanded', { reason: 'responsive' }),
    onInit: (initial) => {
      if (!isControlled) {
        onOpenChangeRef.current?.(initial === 'expanded', { reason: 'init' });
      }
    },
  });

  // Dev guards
  if (process.env.NODE_ENV !== 'production') {
    if (typeof open !== 'undefined' && typeof defaultOpen !== 'undefined') {
      console.error('Shell.Inspector: Do not pass both `open` and `defaultOpen`. Choose one.');
    }
    if (typeof size !== 'undefined' && typeof defaultSize !== 'undefined') {
      console.error('Shell.Inspector: Do not pass both `size` and `defaultSize`. Choose one.');
    }
  }
  useControlledSwitchWarning('Shell.Inspector', 'open', isControlled);

  usePaneChangeNotify<PaneMode>({
    value: inspectorMode,
    resolvedControlled: resolvedInspectorControlled,
    isControlled,
    notify: (mode) => onOpenChangeRef.current?.(mode === 'expanded', { reason: 'toggle' }),
  });

  usePaneExpandCollapse<PaneMode>({
    mode: inspectorMode,
    isOpen: isPaneOpen,
    breakpointReady: currentBreakpointReady,
    onExpand,
    onCollapse,
  });

  const isExpanded = inspectorMode === 'expanded';

  const { currentSize, commitSize, persistenceAdapter } = usePaneSize({
    containerRef: localRef,
    cssVar: '--inspector-size',
    storageNamespace: 'inspector',
    orientation: 'horizontal',
    componentName: 'Shell.Inspector',
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

  const handleEl =
    resizable && !isOverlay && isExpanded ? (
      <PaneResizeContext.Provider
        value={{
          containerRef: localRef,
          cssVarName: '--inspector-size',
          minSize,
          maxSize,
          defaultSize: expandedSize,
          currentSize,
          orientation: 'vertical',
          edge: 'start',
          computeNext: (client, startClient, startSize) => {
            const container = localRef.current;
            const isRtl = container ? getComputedStyle(container).direction === 'rtl' : false;
            const delta = client - startClient;
            return startSize + (isRtl ? delta : -delta);
          },
          onResize,
          onResizeStart,
          onResizeEnd: (nextSize) => {
            onResizeEnd?.(nextSize);
            commitSize(nextSize, 'resize');
            persistenceAdapter?.save?.(nextSize);
          },
          target: 'inspector',
          collapsible,
          snapPoints,
          snapTolerance: snapTolerance ?? 8,
          collapseThreshold,
          requestCollapse: () => setInspectorMode('collapsed'),
          requestToggle: () => togglePane('inspector'),
        }}
      >
        {handleChildren.length > 0 ? handleChildren.map((el, i) => React.cloneElement(el, { key: el.key ?? i })) : <PaneHandle />}
      </PaneResizeContext.Provider>
    ) : null;

  if (isOverlay) {
    const overlayOpen = inspectorMode === 'expanded';
    return (
      <Sheet.Root open={overlayOpen} onOpenChange={(o) => setInspectorMode(o ? 'expanded' : 'collapsed')}>
        <Sheet.Content side="end" style={{ padding: 0 }} aria-label="Inspector" aria-describedby={undefined} width={{ initial: `${expandedSize}px` }}>
          <VisuallyHidden>
            <Sheet.Title>Inspector</Sheet.Title>
          </VisuallyHidden>
          {contentChildren}
        </Sheet.Content>
      </Sheet.Root>
    );
  }

  // Strip control/size props from DOM spread
  return (
    <div
      role="complementary"
      aria-label="Inspector"
      {...inspectorDomProps}
      id={elementId}
      ref={setRef}
      className={classNames('rt-ShellInspector', className)}
      data-mode={inspectorMode}
      data-peek={peekTarget === 'inspector' || undefined}
      data-presentation={currentBreakpointReady ? resolvedPresentation : undefined}
      data-open={(currentBreakpointReady && isStacked && isExpanded) || undefined}
      data-inset={inset || undefined}
      style={
        {
          ...style,
          '--inspector-size': `${currentSize}px`,
          '--inspector-min-size': `${minSize}px`,
          '--inspector-max-size': `${maxSize}px`,
        } as CSSPropertiesWithVars
      }
    >
      <div className="rt-ShellInspectorContent" data-visible={isExpanded || undefined}>
        {contentChildren}
      </div>
      {handleEl}
    </div>
  );
}) as InspectorComponent;

function isPaneOpen(mode: PaneMode) {
  return mode === 'expanded';
}

Inspector.displayName = 'Shell.Inspector';
Inspector.Handle = InspectorHandle;
