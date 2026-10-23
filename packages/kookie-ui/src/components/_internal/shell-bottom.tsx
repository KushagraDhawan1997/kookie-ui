'use client';

import * as React from 'react';
import classNames from 'classnames';
import { useComposedRefs } from 'radix-ui/internal';
import { PaneResizeContext } from './shell-resize.js';
import { BottomHandle, PaneHandle } from './shell-handles.js';
import { usePane, paneAttributes, usePresentationTable } from './shell-pane.js';
import { splitHandles, useResizablePane, type SizeChangeMeta } from './shell-resizable.js';
import { useInsetRegistration, warnOnce } from './shell-store.js';
import { bottomAnchoredGrowth, detailRest, toPaneValue, withoutRemovedPaneProps } from './shell-rest.js';
import { readBreakpoint } from '../../hooks/use-breakpoint.js';
import type { Breakpoint, CSSPropertiesWithVars, PaneBaseProps } from '../shell.types.js';

type BottomOpenChangeMeta = { reason: 'init' | 'toggle' | 'responsive' | 'dismiss' };
type BottomControlledProps = { open: boolean | Partial<Record<Breakpoint, boolean>>; onOpenChange?: (open: boolean, meta: BottomOpenChangeMeta) => void; defaultOpen?: never };
/** Since 0.8.0 `defaultOpen` takes a responsive object here too, as the docs already said it did. */
type BottomUncontrolledProps = { defaultOpen?: boolean | Partial<Record<Breakpoint, boolean>>; onOpenChange?: (open: boolean, meta: BottomOpenChangeMeta) => void; open?: never };
type BottomSizeControlledProps = { size: number | string; defaultSize?: never };
type BottomSizeUncontrolledProps = { defaultSize?: number | string; size?: never };
type BottomPublicProps = PaneBaseProps &
  (BottomControlledProps | BottomUncontrolledProps) &
  (BottomSizeControlledProps | BottomSizeUncontrolledProps) & {
    onSizeChange?: (size: number, meta: SizeChangeMeta) => void;
    sizeUpdate?: 'throttle' | 'debounce';
    sizeUpdateMs?: number;
    /** When true, adds margin and triggers the gray backdrop on the Shell. */
    inset?: boolean;
  };

type BottomComponent = React.ForwardRefExoticComponent<BottomPublicProps & React.RefAttributes<HTMLDivElement>> & { Handle: typeof BottomHandle };

const BOTTOM_PROP_NAMES = { controlled: 'open', default: 'defaultOpen' };

export const Bottom = React.forwardRef<HTMLDivElement, BottomPublicProps>((props, ref) => {
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
    id,
    ...domProps
  } = props;

  const { table, attributes } = usePresentationTable(presentation, 'fixed');
  const pane = usePane({
    name: 'bottom',
    label: 'Bottom',
    propNames: BOTTOM_PROP_NAMES,
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
  useInsetRegistration('bottom', inset);

  React.useEffect(() => {
    if (snapPoints !== undefined || collapseThreshold !== undefined || paneId !== undefined || persistence !== undefined) {
      warnOnce('Shell.Bottom: `snapPoints`, `collapseThreshold`, `paneId` and `persistence` are deprecated and are removed in 1.0. Keep the size in your own state with `size`/`onSizeChange`.');
    }
  }, [snapPoints, collapseThreshold, paneId, persistence]);

  const elementRef = React.useRef<HTMLElement | null>(null);
  const composedRef = useComposedRefs(ref, pane.setElement, elementRef);

  const resize = useResizablePane({
    name: 'bottom',
    elementId: pane.id,
    elementRef,
    cssVarName: '--bottom-size',
    orientation: 'horizontal',
    edge: 'start',
    growth: bottomAnchoredGrowth,
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

  const { handles, content } = splitHandles(children, BottomHandle);
  const handle = resizable && pane.shown !== false && !pane.overlaying ? <PaneResizeContext.Provider value={resize}>{handles.length > 0 ? handles : <PaneHandle />}</PaneResizeContext.Provider> : null;

  return (
    <div
      {...withoutRemovedPaneProps(domProps)}
      id={pane.id}
      ref={composedRef}
      className={classNames('kui-ShellPane', 'kui-ShellBottom', className)}
      {...paneAttributes(pane, attributes)}
      data-inset={inset || undefined}
      tabIndex={pane.overlaying ? -1 : domProps.tabIndex}
      style={
        {
          ...style,
          '--bottom-expanded-size': `${expandedSize}px`,
          '--bottom-min-size': `${minSize}px`,
          '--bottom-max-size': `${maxSize}px`,
        } as CSSPropertiesWithVars
      }
    >
      <div className="kui-ShellBottomContent">{content}</div>
      {handle}
    </div>
  );
}) as BottomComponent;

Bottom.displayName = 'Shell.Bottom';
Bottom.Handle = BottomHandle;
