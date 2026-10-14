'use client';

import * as React from 'react';
import classNames from 'classnames';
import { useComposedRefs } from 'radix-ui/internal';
import { PaneResizeContext } from './shell-resize.js';
import { InspectorHandle, PaneHandle } from './shell-handles.js';
import { usePane, paneAttributes, usePresentationTable } from './shell-pane.js';
import { splitHandles, useResizablePane, type SizeChangeMeta } from './shell-resizable.js';
import { useInsetRegistration, warnOnce } from './shell-store.js';
import { detailRest, endAnchoredGrowth, toPaneValue, withoutRemovedPaneProps } from './shell-rest.js';
import { readBreakpoint } from '../../hooks/use-breakpoint.js';
import type { Breakpoint, CSSPropertiesWithVars, PaneBaseProps } from '../shell.types.js';

type InspectorOpenChangeMeta = { reason: 'init' | 'toggle' | 'responsive' | 'dismiss' };
type InspectorControlledProps = { open: boolean | Partial<Record<Breakpoint, boolean>>; onOpenChange?: (open: boolean, meta: InspectorOpenChangeMeta) => void; defaultOpen?: never };
type InspectorUncontrolledProps = { defaultOpen?: boolean | Partial<Record<Breakpoint, boolean>>; onOpenChange?: (open: boolean, meta: InspectorOpenChangeMeta) => void; open?: never };
type InspectorSizeControlledProps = { size: number | string; defaultSize?: never };
type InspectorSizeUncontrolledProps = { defaultSize?: number | string; size?: never };
type InspectorPublicProps = PaneBaseProps &
  (InspectorControlledProps | InspectorUncontrolledProps) &
  (InspectorSizeControlledProps | InspectorSizeUncontrolledProps) & {
    onSizeChange?: (size: number, meta: SizeChangeMeta) => void;
    sizeUpdate?: 'throttle' | 'debounce';
    sizeUpdateMs?: number;
    /** When true, adds margin and triggers the gray backdrop on the Shell. */
    inset?: boolean;
  };

type InspectorComponent = React.ForwardRefExoticComponent<InspectorPublicProps & React.RefAttributes<HTMLDivElement>> & { Handle: typeof InspectorHandle };

const INSPECTOR_PROP_NAMES = { controlled: 'open', default: 'defaultOpen' };

/** Since 0.8.0 the Inspector is in the frame from 768px up, the boundary kookie-ui-v2 uses everywhere. It was 1280px. */
const INSPECTOR_DEFAULT_PRESENTATION = { initial: 'overlay', sm: 'fixed' } as const;

export const Inspector = React.forwardRef<HTMLDivElement, InspectorPublicProps>((props, ref) => {
  const {
    className,
    presentation = INSPECTOR_DEFAULT_PRESENTATION,
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
    id,
    ...domProps
  } = props;

  const { table, attributes } = usePresentationTable(presentation, 'fixed');
  const pane = usePane({
    name: 'inspector',
    label: 'Inspector',
    propNames: INSPECTOR_PROP_NAMES,
    id,
    controlled: toPaneValue(open),
    defaultValue: toPaneValue(defaultOpen),
    presentationTable: table,
    builtIn: detailRest,
    onChange: (value, reason) => onOpenChange?.(value !== 'closed', { reason }),
    onExpand,
    onCollapse,
    size: expandedSize,
  });
  useInsetRegistration('inspector', inset);

  React.useEffect(() => {
    if (snapPoints !== undefined || collapseThreshold !== undefined || paneId !== undefined || persistence !== undefined) {
      warnOnce('Shell.Inspector: `snapPoints`, `collapseThreshold`, `paneId` and `persistence` are deprecated and are removed in 1.0. Keep the size in your own state with `size`/`onSizeChange`.');
    }
  }, [snapPoints, collapseThreshold, paneId, persistence]);

  const elementRef = React.useRef<HTMLElement | null>(null);
  const composedRef = useComposedRefs(ref, pane.setElement, elementRef);

  const resize = useResizablePane({
    name: 'inspector',
    elementId: pane.id,
    elementRef,
    cssVarName: '--inspector-size',
    orientation: 'vertical',
    edge: 'start',
    growth: endAnchoredGrowth,
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
    overlayingNow: () => table[readBreakpoint()] === 'overlay',
    requestCollapse: () => pane.setValue('closed', 'toggle'),
    requestToggle: () => pane.toggle('toggle'),
  });

  const { handles, content } = splitHandles(children, InspectorHandle);
  const handle = resizable && pane.shown !== false && !pane.overlaying ? <PaneResizeContext.Provider value={resize}>{handles.length > 0 ? handles : <PaneHandle />}</PaneResizeContext.Provider> : null;

  return (
    <div
      {...withoutRemovedPaneProps(domProps)}
      id={pane.id}
      ref={composedRef}
      className={classNames('rt-ShellPane', 'rt-ShellInspector', className)}
      {...paneAttributes(pane, attributes)}
      data-inset={inset || undefined}
      tabIndex={pane.overlaying ? -1 : domProps.tabIndex}
      style={
        {
          ...style,
          '--inspector-size': `${expandedSize}px`,
          '--inspector-min-size': `${minSize}px`,
          '--inspector-max-size': `${maxSize}px`,
        } as CSSPropertiesWithVars
      }
    >
      <div className="rt-ShellInspectorContent">{content}</div>
      {handle}
    </div>
  );
}) as InspectorComponent;

Inspector.displayName = 'Shell.Inspector';
Inspector.Handle = InspectorHandle;
