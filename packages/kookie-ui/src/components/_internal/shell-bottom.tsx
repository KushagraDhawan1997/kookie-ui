import * as React from 'react';
import classNames from 'classnames';
import * as Sheet from '../sheet.js';
import { VisuallyHidden } from '../visually-hidden.js';
import { useBottomMode, usePresentation, usePeek, useShellActions, useInset, usePaneIds } from '../shell.context.js';
import { useResponsivePresentation, useResponsiveInitialState } from '../shell.hooks.js';
import { PaneResizeContext } from './shell-resize.js';
import { BottomHandle, PaneHandle } from './shell-handles.js';
import type { Breakpoint, PaneMode, PaneBaseProps, CSSPropertiesWithVars } from '../shell.types.js';
import { extractPaneDomProps, mapResponsiveBooleanToPaneMode } from './shell-prop-helpers.js';
import { usePaneSize, usePaneChangeNotify, usePaneExpandCollapse, useControlledSwitchWarning } from './shell-pane-hooks.js';

type BottomOpenChangeMeta = { reason: 'init' | 'toggle' | 'responsive' };
type BottomControlledProps = { open: boolean | Partial<Record<Breakpoint, boolean>>; onOpenChange?: (open: boolean, meta: BottomOpenChangeMeta) => void; defaultOpen?: never };
type BottomUncontrolledProps = { defaultOpen?: boolean; onOpenChange?: (open: boolean, meta: BottomOpenChangeMeta) => void; open?: never };
type BottomSizeControlledProps = { size: number | string; defaultSize?: never };
type BottomSizeUncontrolledProps = { defaultSize?: number | string; size?: never };
type BottomSizeChangeMeta = { reason: 'init' | 'resize' | 'controlled' };
type BottomPublicProps = PaneBaseProps &
  (BottomControlledProps | BottomUncontrolledProps) &
  (BottomSizeControlledProps | BottomSizeUncontrolledProps) & {
    onSizeChange?: (size: number, meta: BottomSizeChangeMeta) => void;
    sizeUpdate?: 'throttle' | 'debounce';
    sizeUpdateMs?: number;
    /** When true, adds margin and triggers gray backdrop on Shell. */
    inset?: boolean;
  };

type BottomComponent = React.ForwardRefExoticComponent<BottomPublicProps & React.RefAttributes<HTMLDivElement>> & { Handle: typeof BottomHandle };

const BOTTOM_DOM_PROP_KEYS = [
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
] as const satisfies readonly (keyof BottomPublicProps)[];

export const Bottom = React.forwardRef<HTMLDivElement, BottomPublicProps>((initialProps, ref) => {
  const {
    className,
    presentation = 'fixed',
    defaultOpen,
    open,
    onOpenChange,
    expandedSize = 200,
    minSize = 100,
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
    size,
    defaultSize,
    onSizeChange,
    sizeUpdate,
    sizeUpdateMs = 50,
    inset,
  } = initialProps;
  const bottomDomProps = extractPaneDomProps(initialProps, BOTTOM_DOM_PROP_KEYS);
  const { bottomMode, setBottomMode } = useBottomMode();
  const { currentBreakpointReady } = usePresentation();
  const { peekTarget } = usePeek();
  const { togglePane } = useShellActions();
  const { registerInset, unregisterInset } = useInset();
  const { registerPaneId } = usePaneIds();

  const generatedId = React.useId();
  const elementId = initialProps.id ?? generatedId;
  React.useEffect(() => {
    registerPaneId('bottom', elementId);
    return () => registerPaneId('bottom', undefined);
  }, [registerPaneId, elementId]);

  // Register/unregister inset
  React.useLayoutEffect(() => {
    if (inset) {
      registerInset('bottom');
      return () => unregisterInset('bottom');
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
  const handleChildren = childArray.filter((el: React.ReactElement) => React.isValidElement(el) && el.type === BottomHandle);
  const contentChildren = childArray.filter((el: React.ReactElement) => !(React.isValidElement(el) && el.type === BottomHandle));

  const isControlled = typeof open !== 'undefined';

  // Stable ref for onOpenChange to avoid effect dep churn
  const onOpenChangeRef = React.useRef(onOpenChange);
  React.useLayoutEffect(() => {
    onOpenChangeRef.current = onOpenChange;
  });

  const normalizedControlledOpen = React.useMemo(() => mapResponsiveBooleanToPaneMode(open), [open]);
  const normalizedDefaultOpen = React.useMemo(() => mapResponsiveBooleanToPaneMode(defaultOpen), [defaultOpen]);
  const openIsResponsive = typeof open === 'object' && open !== null;
  const { resolvedControlled: resolvedBottomControlled } = useResponsiveInitialState<PaneMode>({
    controlledValue: normalizedControlledOpen,
    defaultValue: normalizedDefaultOpen,
    currentValue: bottomMode,
    setValue: setBottomMode,
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
      console.error('Shell.Bottom: Do not pass both `open` and `defaultOpen`. Choose one.');
    }
    if (typeof size !== 'undefined' && typeof defaultSize !== 'undefined') {
      console.error('Shell.Bottom: Do not pass both `size` and `defaultSize`. Choose one.');
    }
  }
  useControlledSwitchWarning('Shell.Bottom', 'open', isControlled);

  usePaneChangeNotify<PaneMode>({
    value: bottomMode,
    resolvedControlled: resolvedBottomControlled,
    isControlled,
    notify: (mode) => onOpenChangeRef.current?.(mode === 'expanded', { reason: 'toggle' }),
  });

  usePaneExpandCollapse<PaneMode>({
    mode: bottomMode,
    isOpen: isPaneOpen,
    breakpointReady: currentBreakpointReady,
    onExpand,
    onCollapse,
  });

  const isExpanded = bottomMode === 'expanded';

  const { currentSize, commitSize, persistenceAdapter } = usePaneSize({
    containerRef: localRef,
    cssVar: '--bottom-size',
    storageNamespace: 'bottom',
    orientation: 'vertical',
    componentName: 'Shell.Bottom',
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
          cssVarName: '--bottom-size',
          minSize,
          maxSize,
          defaultSize: expandedSize,
          currentSize,
          orientation: 'horizontal',
          edge: 'start',
          computeNext: (client, startClient, startSize) => {
            const delta = client - startClient;
            return startSize - delta;
          },
          onResize,
          onResizeStart,
          onResizeEnd: (nextSize) => {
            onResizeEnd?.(nextSize);
            commitSize(nextSize, 'resize');
            persistenceAdapter?.save?.(nextSize);
          },
          target: 'bottom',
          collapsible,
          snapPoints,
          snapTolerance: snapTolerance ?? 8,
          collapseThreshold,
          requestCollapse: () => setBottomMode('collapsed'),
          requestToggle: () => togglePane('bottom'),
        }}
      >
        {handleChildren.length > 0 ? handleChildren.map((el, i) => React.cloneElement(el, { key: el.key ?? i })) : <PaneHandle />}
      </PaneResizeContext.Provider>
    ) : null;

  if (isOverlay) {
    const overlayOpen = bottomMode === 'expanded';
    return (
      <Sheet.Root open={overlayOpen} onOpenChange={(o) => setBottomMode(o ? 'expanded' : 'collapsed')}>
        <Sheet.Content side="bottom" style={{ padding: 0 }} aria-label="Bottom panel" aria-describedby={undefined} height={{ initial: `${expandedSize}px` }}>
          <VisuallyHidden>
            <Sheet.Title>Bottom panel</Sheet.Title>
          </VisuallyHidden>
          {contentChildren}
        </Sheet.Content>
      </Sheet.Root>
    );
  }

  return (
    <div
      role="complementary"
      aria-label="Bottom panel"
      {...bottomDomProps}
      id={elementId}
      ref={setRef}
      className={classNames('rt-ShellBottom', className)}
      data-mode={bottomMode}
      data-peek={peekTarget === 'bottom' || undefined}
      data-presentation={currentBreakpointReady ? resolvedPresentation : undefined}
      data-open={(currentBreakpointReady && isStacked && isExpanded) || undefined}
      data-inset={inset || undefined}
      style={
        {
          ...style,
          '--bottom-size': `${currentSize}px`,
          '--bottom-min-size': `${minSize}px`,
          '--bottom-max-size': `${maxSize}px`,
        } as CSSPropertiesWithVars
      }
    >
      <div className="rt-ShellBottomContent" data-visible={isExpanded || undefined}>
        {contentChildren}
      </div>
      {handleEl}
    </div>
  );
}) as BottomComponent;

function isPaneOpen(mode: PaneMode) {
  return mode === 'expanded';
}

Bottom.displayName = 'Shell.Bottom';
Bottom.Handle = BottomHandle;
