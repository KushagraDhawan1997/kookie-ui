import { act } from '@testing-library/react';

type Listener = (event: MediaQueryListEvent) => void;

/**
 * A `matchMedia` that answers `(min-width: Npx)` queries against a width the
 * test sets, and tells listeners when a query's answer changes.
 *
 * `useBreakpoint` keeps one set of MediaQueryLists for the module's lifetime,
 * created on first use, so install this before the first render in a file and
 * reset the width between tests rather than reinstalling it.
 */
export function installViewport(initialWidth = 0) {
  let width = initialWidth;
  const lists: Array<{ query: string; min: number; listeners: Set<Listener>; matches: boolean }> = [];

  const minWidthOf = (query: string) => {
    const match = query.match(/min-width:\s*(\d+)px/);
    return match ? Number(match[1]) : Number.POSITIVE_INFINITY;
  };

  const original = window.matchMedia;
  window.matchMedia = (query: string): MediaQueryList => {
    const entry = { query, min: minWidthOf(query), listeners: new Set<Listener>(), matches: width >= minWidthOf(query) };
    lists.push(entry);
    const list = {
      media: query,
      get matches() {
        return width >= entry.min;
      },
      onchange: null,
      addEventListener: (_type: string, listener: Listener) => entry.listeners.add(listener),
      removeEventListener: (_type: string, listener: Listener) => entry.listeners.delete(listener),
      addListener: (listener: Listener) => entry.listeners.add(listener),
      removeListener: (listener: Listener) => entry.listeners.delete(listener),
      dispatchEvent: () => false,
    };
    // A structural stand-in: only the members the Shell reads are implemented.
    return list as unknown as MediaQueryList;
  };

  /** Resizes the window: every query whose answer changes tells its listeners. */
  function setWidth(next: number) {
    act(() => {
      width = next;
      for (const entry of lists) {
        const matches = width >= entry.min;
        if (matches === entry.matches) continue;
        entry.matches = matches;
        for (const listener of entry.listeners) listener({ matches, media: entry.query } as MediaQueryListEvent);
      }
    });
  }

  function restore() {
    window.matchMedia = original;
  }

  return { setWidth, restore };
}
