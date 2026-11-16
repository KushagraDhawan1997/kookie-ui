import * as React from 'react';
import classNames from 'classnames';
import { ScrollArea as ScrollAreaPrimitive } from 'radix-ui';
import { useComposedRefs, useLayoutEffect } from 'radix-ui/internal';

import { scrollAreaPropDefs } from './scroll-area.props.js';
import { PanelBodyContext } from './_internal/panel-body-context.js';
import { scrollableOverflow, useScrollEdges } from '../hooks/use-scroll-edges.js';
import { useThumbSync } from '../hooks/use-thumb-sync.js';
import { getSubtree } from '../helpers/get-subtree.js';
import { extractProps } from '../helpers/extract-props.js';
import { widthPropDefs } from '../props/width.props.js';
import { heightPropDefs } from '../props/height.props.js';

import type { ComponentPropsWithout, RemovedProps } from '../helpers/component-props.js';
import type { GetPropDefTypes } from '../props/prop-def.js';
import type { WidthProps } from '../props/width.props.js';
import type { HeightProps } from '../props/height.props.js';

type ScrollAreaElement = React.ElementRef<typeof ScrollAreaPrimitive.Viewport>;
type ScrollAreaOwnProps = GetPropDefTypes<typeof scrollAreaPropDefs>;
interface ScrollAreaProps
  extends
    ComponentPropsWithout<typeof ScrollAreaPrimitive.Root, RemovedProps>,
    ComponentPropsWithout<typeof ScrollAreaPrimitive.Viewport, RemovedProps | 'dir'>,
    ScrollAreaOwnProps,
    WidthProps,
    HeightProps {}

/** Menus and listboxes move focus between their items, so a scroller inside one stays out of the tab order. */
const OWNS_FOCUS = '[role="menu"], [role="listbox"]';

/**
 * Puts the viewport in the tab order while it has something to scroll, so a keyboard can reach it
 * and scroll it with the arrow keys. A `tabIndex` the caller set wins.
 */
function useFocusableWhileScrollable(element: HTMLDivElement | null, enabled: boolean) {
  React.useEffect(() => {
    if (!enabled || !element || element.closest(OWNS_FOCUS)) return;
    let frame = 0;
    const update = () => {
      frame = 0;
      const overflow = scrollableOverflow(element);
      const scrollable = overflow.x > 0 || overflow.y > 0;
      if (scrollable) element.setAttribute('tabindex', '0');
      else element.removeAttribute('tabindex');
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(update);
    };
    update();
    const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(schedule);
    observer?.observe(element);
    for (const child of Array.from(element.children)) observer?.observe(child);
    return () => {
      if (frame) cancelAnimationFrame(frame);
      // The attribute stays: a caller who now sets `tabIndex` has already written it.
      observer?.disconnect();
    };
  }, [element, enabled]);
}

/**
 * A panel's top row floats over its ScrollArea body, so the body needs the row's height: its
 * content starts under the row and fades out beneath it. The row is a Toolbar right before the
 * ScrollArea, first in the panel. Its height is written on the ScrollArea's root as
 * `--panel-top-row-height` when it changes, without a re-render.
 */
function usePanelTopRow(viewport: HTMLElement | null, enabled: boolean) {
  // Before paint, so the body's content never shows under the row for a frame.
  useLayoutEffect(() => {
    const root = viewport?.parentElement;
    const row = root?.previousElementSibling;
    if (!enabled || !root || !(row instanceof HTMLElement) || !row.matches('.kui-Toolbar:first-child')) return;
    const write = () => root.style.setProperty('--panel-top-row-height', `${row.offsetHeight}px`);
    write();
    const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(write);
    observer?.observe(row);
    return () => {
      observer?.disconnect();
      root.style.removeProperty('--panel-top-row-height');
    };
  }, [viewport, enabled]);
}

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
    fade: fadeProp,
    ...viewportProps
  } = extractProps(props, widthPropDefs, heightPropDefs);
  // A panel's body fades by default; a `fade` prop always wins.
  const inPanel = React.useContext(PanelBodyContext);
  const fade = fadeProp ?? (inPanel || scrollAreaPropDefs.fade.default);
  const [viewport, setViewport] = React.useState<HTMLDivElement | null>(null);
  const setEdgesElement = useScrollEdges<HTMLDivElement>(fade);
  const setThumbViewport = useThumbSync<HTMLDivElement>();
  const viewportRef = useComposedRefs(forwardedRef, setEdgesElement, setThumbViewport, setViewport);
  useFocusableWhileScrollable(viewport, viewportProps.tabIndex === undefined);
  usePanelTopRow(viewport, inPanel);
  // A named scroller is a region, so a screen reader can find it and say what it holds.
  const named = viewportProps['aria-label'] !== undefined || viewportProps['aria-labelledby'] !== undefined;

  return (
    <ScrollAreaPrimitive.Root
      type={type}
      scrollHideDelay={scrollHideDelay}
      dir={dir}
      className={classNames('kui-ScrollAreaRoot', className)}
      data-fade={fade ? '' : undefined}
      style={style}
      asChild={asChild}
    >
      {getSubtree({ asChild, children }, (children) => (
        <>
          <ScrollAreaPrimitive.Viewport role={named ? 'region' : undefined} {...viewportProps} ref={viewportRef} className="kui-ScrollAreaViewport">
            {inPanel ? <PanelBodyContext.Provider value={false}>{children}</PanelBodyContext.Provider> : children}
          </ScrollAreaPrimitive.Viewport>

          <div className="kui-ScrollAreaViewportFocusRing" />

          {scrollbars !== 'vertical' ? (
            <ScrollAreaPrimitive.Scrollbar data-radius={radius} orientation="horizontal" className="kui-ScrollAreaScrollbar">
              <ScrollAreaPrimitive.Thumb className="kui-ScrollAreaThumb" />
            </ScrollAreaPrimitive.Scrollbar>
          ) : null}

          {scrollbars !== 'horizontal' ? (
            <ScrollAreaPrimitive.Scrollbar data-radius={radius} orientation="vertical" className="kui-ScrollAreaScrollbar">
              <ScrollAreaPrimitive.Thumb className="kui-ScrollAreaThumb" />
            </ScrollAreaPrimitive.Scrollbar>
          ) : null}

          {scrollbars === 'both' ? <ScrollAreaPrimitive.Corner className="kui-ScrollAreaCorner" /> : null}
        </>
      ))}
    </ScrollAreaPrimitive.Root>
  );
});
ScrollArea.displayName = 'ScrollArea';

export { ScrollArea };
export type { ScrollAreaProps };
