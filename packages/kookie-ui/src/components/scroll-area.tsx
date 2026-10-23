import * as React from 'react';
import classNames from 'classnames';
import { ScrollArea as ScrollAreaPrimitive } from 'radix-ui';
import { useComposedRefs } from 'radix-ui/internal';

import { scrollAreaPropDefs } from './scroll-area.props.js';
import { useScrollEdges } from '../hooks/use-scroll-edges.js';
import { useThumbSync } from '../hooks/use-thumb-sync.js';
import { getSubtree } from '../helpers/get-subtree.js';

import type { ComponentPropsWithout, RemovedProps } from '../helpers/component-props.js';
import type { GetPropDefTypes } from '../props/prop-def.js';

type ScrollAreaElement = React.ElementRef<typeof ScrollAreaPrimitive.Viewport>;
type ScrollAreaOwnProps = GetPropDefTypes<typeof scrollAreaPropDefs>;
interface ScrollAreaProps
  extends ComponentPropsWithout<typeof ScrollAreaPrimitive.Root, RemovedProps>,
    ComponentPropsWithout<typeof ScrollAreaPrimitive.Viewport, RemovedProps | 'dir'>,
    ScrollAreaOwnProps {}
const ScrollArea = React.forwardRef<ScrollAreaElement, ScrollAreaProps>((props, forwardedRef) => {
  const {
    asChild,
    children,
    className,
    style,
    type,
    scrollHideDelay = type !== 'scroll' ? 0 : undefined,
    dir,
    radius = scrollAreaPropDefs.radius.default,
    scrollbars = scrollAreaPropDefs.scrollbars.default,
    fade = scrollAreaPropDefs.fade.default,
    ...viewportProps
  } = props;
  const setEdgesElement = useScrollEdges<HTMLDivElement>(fade);
  const setThumbViewport = useThumbSync<HTMLDivElement>();
  const viewportRef = useComposedRefs(forwardedRef, setEdgesElement, setThumbViewport);

  return (
    <ScrollAreaPrimitive.Root
      type={type}
      scrollHideDelay={scrollHideDelay}
      className={classNames('kui-ScrollAreaRoot', className)}
      data-fade={fade ? '' : undefined}
      style={style}
      asChild={asChild}
    >
      {getSubtree({ asChild, children }, (children) => (
        <>
          <ScrollAreaPrimitive.Viewport
            {...viewportProps}
            ref={viewportRef}
            className="kui-ScrollAreaViewport"
          >
            {children}
          </ScrollAreaPrimitive.Viewport>

          <div className="kui-ScrollAreaViewportFocusRing" />

          {scrollbars !== 'vertical' ? (
            <ScrollAreaPrimitive.Scrollbar
              data-radius={radius}
              orientation="horizontal"
              className="kui-ScrollAreaScrollbar"
            >
              <ScrollAreaPrimitive.Thumb className="kui-ScrollAreaThumb" />
            </ScrollAreaPrimitive.Scrollbar>
          ) : null}

          {scrollbars !== 'horizontal' ? (
            <ScrollAreaPrimitive.Scrollbar
              data-radius={radius}
              orientation="vertical"
              className="kui-ScrollAreaScrollbar"
            >
              <ScrollAreaPrimitive.Thumb className="kui-ScrollAreaThumb" />
            </ScrollAreaPrimitive.Scrollbar>
          ) : null}

          {scrollbars === 'both' ? (
            <ScrollAreaPrimitive.Corner className="kui-ScrollAreaCorner" />
          ) : null}
        </>
      ))}
    </ScrollAreaPrimitive.Root>
  );
});
ScrollArea.displayName = 'ScrollArea';

export { ScrollArea };
export type { ScrollAreaProps };
