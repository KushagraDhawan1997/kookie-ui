'use client';

import * as React from 'react';

/**
 * When a window Shell lets the page scroll: a narrow window (below the `sm` breakpoint) under a
 * coarse pointer. The stylesheet decides it (shell.css, the page-scroll block), so first paint is
 * right with no script. This is the script's copy, for the few things only script can do when the
 * answer changes: carry the reading position between the two scrollers, and take the content's
 * unused viewport out of the tab order. A test holds it equal to the stylesheet's.
 */
export const PAGE_SCROLL_QUERY = '(max-width: 767.98px) and (pointer: coarse)';

let list: MediaQueryList | undefined;
const media = () => (list ??= window.matchMedia(PAGE_SCROLL_QUERY));

function listen(m: MediaQueryList, handler: () => void): () => void {
  // Safari below 14 has only the deprecated listener API.
  if (typeof m.addEventListener === 'function') {
    m.addEventListener('change', handler);
    return () => m.removeEventListener('change', handler);
  }
  m.addListener?.(handler);
  return () => m.removeListener?.(handler);
}

function subscribe(onChange: () => void): () => void {
  return listen(media(), onChange);
}

/** True where a window Shell lets the page scroll. False on the server and through hydration. */
export function usePageScrollMedia(): boolean {
  return React.useSyncExternalStore(
    subscribe,
    () => media().matches,
    () => false,
  );
}

/** Whether the page scrolls right now. */
export function pageScrollMatches(): boolean {
  return media().matches;
}

/** Subscribes to the answer changing, outside React. */
export function onPageScrollMediaChange(onChange: (matches: boolean) => void): () => void {
  const m = media();
  return listen(m, () => onChange(m.matches));
}
