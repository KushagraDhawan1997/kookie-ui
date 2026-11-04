'use client';

import * as React from 'react';
import classNames from 'classnames';

import { setPageCollapsed, useClaimPage, usePageScope } from './_internal/page-scope.js';
import { usePageScrollMedia } from './_internal/shell-page-scroll.js';
import { Heading } from './heading.js';
import { Text } from './text.js';

interface PageProps extends Omit<React.ComponentPropsWithoutRef<'div'>, 'color' | 'title'> {
  /**
   * The title of the page. It shows large at the top. When it scrolls away, it also shows in
   * the `Toolbar.Title` of the pane's band. It is a string, because it shows in two places.
   */
  title: string;
  /** A sentence under the title that describes the page. Optional. */
  description?: React.ReactNode;
  /** A logo or mark above the title, such as an app's logo on its home page. Most pages don't need it. */
  mark?: React.ReactNode;
}

/**
 * Page, from v2 (2026-11-03): the screen you navigated to, and its title.
 *
 * A page is not a band. The pinned row with the way back and the tools is the pane's
 * (`Shell.PaneHeader`): it stays while you move from page to page. The large title that arrives
 * and leaves with the content is the page's, and it is this.
 *
 * It owns three things: the air above its title (a floating band's reach is already cleared by
 * `Shell.Scroll`), the title and its description at the page's type steps, and the collapse:
 * when the title passes behind the band, every `Toolbar.Title` with no words of its own in this
 * pane shows the page's title.
 *
 * It takes no width (the frame around it states one), no level (a page is the document's one
 * `h1`), no size (an app has one page step) and no actions (they go in the toolbar).
 */
const Page = React.forwardRef<HTMLDivElement, PageProps>(({ title, description, mark, className, children, ...props }, forwardedRef) => {
  const store = usePageScope();
  const marker = React.useRef<HTMLDivElement>(null);
  useClaimPage(store, title);

  // Re-read when a touch window crosses the phone boundary: the scroller changes from the
  // content's viewport to the page, and an observer built for one never fires for the other.
  const pageScrolls = usePageScrollMedia();
  React.useEffect(() => {
    const el = marker.current;
    if (!el || !store) return;
    // The scroller is the viewport around this, if it scrolls; on a phone window Shell the
    // document scrolls and the viewport is `overflow: visible`, so the root is the document.
    const viewport = el.closest<HTMLElement>('.kui-ScrollAreaViewport');
    const scrolls = viewport !== null && !/^(visible|clip)$/.test(getComputedStyle(viewport).overflowY);
    const observer = new IntersectionObserver(
      (entries) => {
        const entry = entries[entries.length - 1];
        if (!entry) return;
        // Gone off the top, not merely gone: a marker below the fold is also out of view.
        const top = entry.rootBounds?.top;
        setPageCollapsed(store, !entry.isIntersecting && (top === undefined || entry.boundingClientRect.top <= top));
      },
      { root: scrolls ? viewport : null, threshold: 0 },
    );
    observer.observe(el);
    return () => {
      observer.disconnect();
      // A page that unmounts takes its collapse with it, or the next page's band opens collapsed.
      setPageCollapsed(store, false);
    };
  }, [store, pageScrolls]);

  return (
    <div {...props} ref={forwardedRef} className={classNames('kui-Page', className)}>
      <div className="kui-PageHeader">
        {mark === undefined || mark === null ? null : <div className="kui-PageMark">{mark}</div>}
        <Heading as="h1" size="9" weight="medium">
          {title}
        </Heading>
        {description === undefined || description === null ? null : (
          <Text as="p" size="4">
            {description}
          </Text>
        )}
        {/* Out of flow, so it displaces nothing and a page with no band behaves the same. */}
        <div ref={marker} className="kui-PageMarker" aria-hidden="true" />
      </div>
      {children}
    </div>
  );
});
Page.displayName = 'Page';

export { Page };
export type { PageProps };
