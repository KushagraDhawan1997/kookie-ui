import * as React from 'react';

/**
 * Keeps a Radix ScrollArea's thumbs on the scroll position on every scroll.
 *
 * Radix moves a thumb from a requestAnimationFrame loop it starts on the first scroll event of a
 * burst. Next's production minifier compiles that self-calling loop away, so in a production
 * build the thumb moves once, sits while the content scrolls, and jumps when the next burst
 * starts. This writes the transform Radix would, at most once per frame. Nothing re-renders.
 *
 * Pass the hook's setter as a ref on `ScrollArea.Viewport`; the scrollbars are its siblings.
 */
export function useThumbSync<T extends HTMLElement>() {
  const [viewport, setViewport] = React.useState<T | null>(null);

  React.useEffect(() => {
    const root = viewport?.parentElement;
    if (!viewport || !root) return;
    let frame = 0;
    const write = () => {
      frame = 0;
      for (const thumb of root.querySelectorAll<HTMLElement>(':scope > .kui-ScrollAreaScrollbar > .kui-ScrollAreaThumb')) {
        const scrollbar = thumb.parentElement as HTMLElement;
        const style = getComputedStyle(scrollbar);
        if (scrollbar.dataset.orientation === 'horizontal') {
          const track = scrollbar.clientWidth - parseFloat(style.paddingLeft) - parseFloat(style.paddingRight);
          const offset = thumbOffset(viewport.scrollLeft, viewport.scrollWidth - viewport.offsetWidth, track - thumb.offsetWidth);
          thumb.style.transform = `translate3d(${offset}px, 0, 0)`;
        } else {
          const track = scrollbar.clientHeight - parseFloat(style.paddingTop) - parseFloat(style.paddingBottom);
          const offset = thumbOffset(viewport.scrollTop, viewport.scrollHeight - viewport.offsetHeight, track - thumb.offsetHeight);
          thumb.style.transform = `translate3d(0, ${offset}px, 0)`;
        }
      }
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(write);
    };
    viewport.addEventListener('scroll', schedule, { passive: true });
    return () => {
      if (frame) cancelAnimationFrame(frame);
      viewport.removeEventListener('scroll', schedule);
    };
  }, [viewport]);

  return setViewport;
}

/** Radix's mapping: scroll position over its range, onto the room the thumb has to travel. */
function thumbOffset(position: number, range: number, travel: number) {
  if (range <= 0 || travel <= 0) return 0;
  // Right-to-left scrolls run from -range to 0; the thumb then travels from -travel to 0.
  const clamped = Math.min(Math.max(position, -range), range);
  return (clamped / range) * travel;
}
