/**
 * Every page that has a Markdown twin, in reading order. Ported from Kookie UI v2's
 * `app/(docs)/markdown.ts` `PAGES`.
 *
 * Data only, no file reads, so the toolbar (client), the proxy and the twin's route can all
 * import it. The order is the sidebar's, so it is also the previous/next walk.
 */
import { docsNavigation } from '../navigation-config';

export type DocPage = { path: string; title: string };

type NavItem = { href: string; title: string; items?: NavItem[] };

const flatten = (items: NavItem[]): NavItem[] => items.flatMap((item) => [item, ...flatten(item.items ?? [])]);

export const DOC_PAGES: DocPage[] = docsNavigation.groups
  .flatMap((group) => flatten(group.items))
  .map((item) => ({ path: item.href, title: item.title }));

export const DOC_PATHS: ReadonlySet<string> = new Set(DOC_PAGES.map((page) => page.path));

/** A page's twin. One expression, so the toolbar, the proxy and the route cannot spell it differently. */
export const twinOf = (pagePath: string) => `${pagePath}.md`;

/** Where the twin's handler lives. `<path>.md` and a negotiated request are both rewritten here. */
export const markdownRoute = (pagePath: string) => `/md${pagePath}`;
