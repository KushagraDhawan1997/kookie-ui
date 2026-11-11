'use client';

import * as React from 'react';
import classNames from 'classnames';
import { useComposedRefs } from 'radix-ui/internal';
import { PaneResizeContext } from './shell-resize.js';
import { BottomHandle, PaneHandle } from './shell-handles.js';
import { usePane, paneAttributes, usePresentationTable } from './shell-pane.js';
import { splitHandles, useInitialPaneSize, useResizablePane, type SizeChangeMeta } from './shell-resizable.js';
import { useFrameRegistration } from './shell-store.js';
import { bottomAnchoredGrowth, detailRest, toPaneValue } from './shell-rest.js';
import { PageScope } from './page-scope.js';
import { readBreakpoint } from '../../hooks/use-breakpoint.js';
import type { Breakpoint, CSSPropertiesWithVars, PaneBaseProps, PaneOpenChangeReason } from '../shell.types.js';

type BottomOpenChangeMeta = { reason: PaneOpenChangeReason };
type BottomControlledProps = { open: boolean; onOpenChange?: (open: boolean, meta: BottomOpenChangeMeta) => void; defaultOpen?: never };
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
    /**
     * Sets whether this pane joins the app frame. The default is `true`: the pane sits against its
     * neighbours with one hairline between them. Set `flush={false}` to pull it off the frame as a
     * card. It then floats over the content if the content is flush, and otherwise sits on the
     * Shell's background beside a card content.
     */
    flush?: boolean;
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
    onResize,
    onResizeStart,
    onResizeEnd,
    children,
    style,
    size,
    defaultSize,
    onSizeChange,
    sizeUpdate,
    sizeUpdateMs = 50,
    flush = true,
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
    size: expandedSize,
  });
  useFrameRegistration('bottom', flush);


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
    overlaying: pane.overlaying,
    overlayingNow: () => table[readBreakpoint()] === 'overlay',
    requestToggle: () => pane.toggle('toggle'),
  });

  // The starting size is in the server HTML, so the pane does not jump on hydration.
  const initialSize = useInitialPaneSize(size, defaultSize, minSize, maxSize);
  const { handles, content } = splitHandles(children, BottomHandle);
  const handle = resizable && pane.shown !== false && !pane.overlaying ? <PaneResizeContext.Provider value={resize}>{handles.length > 0 ? handles : <PaneHandle />}</PaneResizeContext.Provider> : null;

  return (
    <div
      {...domProps}
      id={pane.id}
      ref={composedRef}
      className={classNames('kui-ShellPane', 'kui-ShellBottom', className)}
      {...paneAttributes(pane, attributes)}
      data-flush={flush || undefined}
      tabIndex={pane.overlaying ? -1 : domProps.tabIndex}
      style={
        {
          ...style,
          '--bottom-expanded-size': `${expandedSize}px`,
          ...(initialSize ? { '--bottom-size': initialSize } : {}),
          '--bottom-min-size': `${minSize}px`,
          '--bottom-max-size': `${maxSize}px`,
        } as CSSPropertiesWithVars
      }
    >
      <div className="kui-ShellBottomContent">
        <PageScope>{content}</PageScope>
      </div>
      {handle}
    </div>
  );
}) as BottomComponent;

Bottom.displayName = 'Shell.Bottom';
Bottom.Handle = BottomHandle;

export type { BottomPublicProps };
