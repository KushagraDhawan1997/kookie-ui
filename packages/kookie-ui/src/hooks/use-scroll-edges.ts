import * as React from 'react';

/**
 * Publishes how much content is hidden past each block edge of a scroller, as
 * `--scroll-overflow-start` and `--scroll-overflow-end` (px) on the element.
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
      const start = Math.max(0, element.scrollTop);
      const end = Math.max(0, element.scrollHeight - element.clientHeight - element.scrollTop);
      element.style.setProperty('--scroll-overflow-start', `${start}px`);
      element.style.setProperty('--scroll-overflow-end', `${end}px`);
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
    };
  }, [enabled, element]);

  return setElement;
}
