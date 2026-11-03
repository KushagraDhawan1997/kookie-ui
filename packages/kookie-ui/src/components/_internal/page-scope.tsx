'use client';

import * as React from 'react';

/**
 * What page is in a pane, and whether its title has scrolled away (from v2, 2026-11-03).
 *
 * A page's large title lives inside the scroller and the band that shows it again lives beside
 * it, so context, which only flows down, cannot carry it from one to the other. The store sits
 * at their common ancestor, the pane. Each pane provides its own, so two panes can each hold a
 * titled page; `Shell.Header` provides none, so a `Toolbar.Title` there always speaks for itself.
 * Outside a Shell there is no scope: a `Page` still draws its heading and a `Toolbar.Title` still
 * shows its own words.
 */
type PageStore = {
  /** The words of the page in this pane, or null while nothing has claimed it. */
  title: string | null;
  /** Every `Toolbar.Title` mirroring this pane's page, as elements: the collapse is written onto them. */
  mirrors: Set<HTMLElement>;
  /** Whether the page's own title has scrolled up behind the band. */
  collapsed: boolean;
  listeners: Set<() => void>;
  /** What a subscriber reads: a stable value between notifications. */
  version: number;
};

const PageScopeContext = React.createContext<PageStore | null>(null);

function notify(store: PageStore) {
  store.version += 1;
  for (const listener of store.listeners) listener();
}

/**
 * The collapse is an attribute write, not a render: only CSS reads it, and an observer sends it
 * twice per visit to a page.
 */
function setPageCollapsed(store: PageStore, collapsed: boolean): void {
  if (store.collapsed === collapsed) return;
  store.collapsed = collapsed;
  for (const el of store.mirrors) {
    if (collapsed) el.setAttribute('data-collapsed', '');
    else el.removeAttribute('data-collapsed');
  }
}

/** Every pane renders one. It draws nothing. */
function PageScope({ children }: { children: React.ReactNode }) {
  const store = React.useMemo<PageStore>(() => ({ title: null, mirrors: new Set(), collapsed: false, listeners: new Set(), version: 0 }), []);
  return <PageScopeContext.Provider value={store}>{children}</PageScopeContext.Provider>;
}

/** Cuts the scope off below a portal: a panel over a pane is not in it, so its title must not take the pane's band. */
function NoPageScope({ children }: { children: React.ReactNode }) {
  return <PageScopeContext.Provider value={null}>{children}</PageScopeContext.Provider>;
}

function usePageScope(): PageStore | null {
  return React.useContext(PageScopeContext);
}

/** A `Page` claims the pane it is in, in an effect, so no subscriber's snapshot changes mid-render. */
function useClaimPage(store: PageStore | null, title: string): void {
  React.useEffect(() => {
    if (!store) return;
    store.title = title;
    notify(store);
    return () => {
      if (store.title === title) {
        store.title = null;
        notify(store);
      }
    };
  }, [store, title]);
}

/** What a `Toolbar.Title` shows when it is given no words of its own. */
function usePageTitle(store: PageStore | null): string | null {
  const subscribe = React.useCallback(
    (cb: () => void) => {
      if (!store) return () => {};
      store.listeners.add(cb);
      return () => {
        store.listeners.delete(cb);
      };
    },
    [store],
  );
  // The version is read so the subscription re-renders this consumer; the title itself is the value.
  React.useSyncExternalStore(
    subscribe,
    () => store?.version ?? 0,
    () => 0,
  );
  return store?.title ?? null;
}

/**
 * Registers a mirroring title's element, stamped with what the page is doing now: a title that
 * mounts after its page has scrolled arrives collapsed.
 */
function usePageMirror(store: PageStore | null): React.RefCallback<HTMLElement> {
  const current = React.useRef<HTMLElement | null>(null);
  return React.useCallback(
    (el: HTMLElement | null) => {
      if (!store) return;
      if (current.current) store.mirrors.delete(current.current);
      current.current = el;
      if (!el) return;
      store.mirrors.add(el);
      if (store.collapsed) el.setAttribute('data-collapsed', '');
      else el.removeAttribute('data-collapsed');
    },
    [store],
  );
}

export { PageScope, NoPageScope, usePageScope, useClaimPage, usePageTitle, usePageMirror, setPageCollapsed };
export type { PageStore };
