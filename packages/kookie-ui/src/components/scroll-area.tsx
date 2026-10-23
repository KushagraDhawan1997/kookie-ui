import * as React from 'react';
import classNames from 'classnames';
import { ScrollArea as ScrollAreaPrimitive } from 'radix-ui';
import { useComposedRefs } from 'radix-ui/internal';

import { scrollAreaPropDefs } from './scroll-area.props.js';
import { useScrollEdges } from '../hooks/use-scroll-edges.js';
import { useThumbSync } from '../hooks/use-thumb-sync.js';
import { extractMarginProps } from '../helpers/extract-margin-props.js';
import { getMarginStyles } from '../helpers/get-margin-styles.js';
import { getSubtree } from '../helpers/get-subtree.js';
import { mergeStyles } from '../helpers/merge-styles.js';

import type { ComponentPropsWithout, RemovedProps } from '../helpers/component-props.js';
import type { MarginProps } from '../props/margin.props.js';
import type { GetPropDefTypes } from '../props/prop-def.js';

type ScrollAreaElement = React.ElementRef<typeof ScrollAreaPrimitive.Viewport>;
type ScrollAreaOwnProps = GetPropDefTypes<typeof scrollAreaPropDefs>;
interface ScrollAreaProps
  extends ComponentPropsWithout<typeof ScrollAreaPrimitive.Root, RemovedProps>,
    ComponentPropsWithout<typeof ScrollAreaPrimitive.Viewport, RemovedProps | 'dir'>,
    MarginProps,
    ScrollAreaOwnProps {}
const ScrollArea = React.forwardRef<ScrollAreaElement, ScrollAreaProps>((props, forwardedRef) => {
  const { rest: marginRest, ...marginProps } = extractMarginProps(props);
  const [marginClassNames, marginCustomProperties] = getMarginStyles(marginProps);

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
  } = marginRest;
  const setEdgesElement = useScrollEdges<HTMLDivElement>(fade);
  const setThumbViewport = useThumbSync<HTMLDivElement>();
  const viewportRef = useComposedRefs(forwardedRef, setEdgesElement, setThumbViewport);

  return (
    <ScrollAreaPrimitive.Root
      type={type}
      scrollHideDelay={scrollHideDelay}
      className={classNames('rt-ScrollAreaRoot', marginClassNames, className)}
      data-fade={fade ? '' : undefined}
      style={mergeStyles(marginCustomProperties, style)}
      asChild={asChild}
    >
      {getSubtree({ asChild, children }, (children) => (
        <>
          <ScrollAreaPrimitive.Viewport
            {...viewportProps}
            ref={viewportRef}
            className="rt-ScrollAreaViewport"
          >
            {children}
          </ScrollAreaPrimitive.Viewport>

          <div className="rt-ScrollAreaViewportFocusRing" />

          {scrollbars !== 'vertical' ? (
            <ScrollAreaPrimitive.Scrollbar
              data-radius={radius}
              orientation="horizontal"
              className="rt-ScrollAreaScrollbar"
            >
              <ScrollAreaPrimitive.Thumb className="rt-ScrollAreaThumb" />
            </ScrollAreaPrimitive.Scrollbar>
          ) : null}

          {scrollbars !== 'horizontal' ? (
            <ScrollAreaPrimitive.Scrollbar
              data-radius={radius}
              orientation="vertical"
              className="rt-ScrollAreaScrollbar"
            >
              <ScrollAreaPrimitive.Thumb className="rt-ScrollAreaThumb" />
            </ScrollAreaPrimitive.Scrollbar>
          ) : null}

          {scrollbars === 'both' ? (
            <ScrollAreaPrimitive.Corner className="rt-ScrollAreaCorner" />
          ) : null}
        </>
      ))}
    </ScrollAreaPrimitive.Root>
  );
});
ScrollArea.displayName = 'ScrollArea';

export { ScrollArea };
export type { ScrollAreaProps };
