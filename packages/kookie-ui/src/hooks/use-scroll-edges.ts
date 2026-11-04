import * as React from 'react';

/**
 * How far content runs past the element on each axis, in px. An axis whose overflow is hidden
 * cannot be scrolled (a ScrollArea with `scrollbars="vertical"` hides the inline axis), so it
 * counts as 0, however wide the content.
 */
export function scrollableOverflow(element: HTMLElement) {
  const style = getComputedStyle(element);
  return {
    x: style.overflowX === 'hidden' ? 0 : Math.max(0, element.scrollWidth - element.clientWidth),
    y: style.overflowY === 'hidden' ? 0 : Math.max(0, element.scrollHeight - element.clientHeight),
  };
}

/**
 * Publishes how much content is hidden past each edge of a scroller, as
 * `--scroll-overflow-start` and `--scroll-overflow-end` (block axis) and
 * `--scroll-overflow-x-start` and `--scroll-overflow-x-end` (inline axis, from
 * the inline start, so right-to-left reads the same) in px on the element.
 * The scroll fade reads them, so an edge fades only while content is hidden
 * there, and the fade ramps in over the first pixels of scrolling.
 *
 * Writes happen at most once per frame, on scroll and when the element or its
 * content resizes. Nothing re-renders.
 */
export function useScrollEdges<T extends HTMLElement>(enabled: boolean) {
  const [element, setElement] = React.useState<T | null>(null);

  React.useEffect(() => {
    if (!enabled || !element) return;
    let frame = 0;
    const write = () => {
      frame = 0;
      const overflow = scrollableOverflow(element);
      const start = Math.max(0, element.scrollTop);
      const end = Math.max(0, overflow.y - element.scrollTop);
      element.style.setProperty('--scroll-overflow-start', `${start}px`);
      element.style.setProperty('--scroll-overflow-end', `${end}px`);
      // scrollLeft runs negative in right-to-left, so its size is the distance from the inline start.
      const xStart = Math.abs(element.scrollLeft);
      const xEnd = Math.max(0, overflow.x - xStart);
      element.style.setProperty('--scroll-overflow-x-start', `${xStart}px`);
      element.style.setProperty('--scroll-overflow-x-end', `${xEnd}px`);
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(write);
    };
    write();
    element.addEventListener('scroll', schedule, { passive: true });
    const observer = typeof ResizeObserver === 'undefined' ? null : new ResizeObserver(schedule);
    observer?.observe(element);
    for (const child of Array.from(element.children)) observer?.observe(child);
    const mutations = typeof MutationObserver === 'undefined' ? null : new MutationObserver(schedule);
    mutations?.observe(element, { childList: true });
    return () => {
      if (frame) cancelAnimationFrame(frame);
      element.removeEventListener('scroll', schedule);
      observer?.disconnect();
      mutations?.disconnect();
      element.style.removeProperty('--scroll-overflow-start');
      element.style.removeProperty('--scroll-overflow-end');
      element.style.removeProperty('--scroll-overflow-x-start');
      element.style.removeProperty('--scroll-overflow-x-end');
    };
  }, [enabled, element]);

  return setElement;
}
