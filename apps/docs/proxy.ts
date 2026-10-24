import { NextResponse, type NextRequest } from 'next/server';
import { alternateLink, prefersMarkdown } from './lib/negotiate';
import { DOC_PATHS, markdownRoute } from './lib/pages';

/**
 * The Markdown twin's URLs. Ported from Kookie UI v2's `middleware.ts` (Next 16 renames it
 * `proxy`) plus the `.md` rewrite v2 keeps in `next.config.ts`; it lives here so the running dev
 * server picks it up without a config restart.
 *
 * - `<page>.md` is rewritten onto the twin's route.
 * - `<page>` answers in Markdown when `Accept` ranks `text/markdown` above `text/html`.
 * - Every page names its twin in a `Link` header.
 *
 * The matcher is a constant (Next analyses it at build time); the page list decides the rest.
 */
export const config = {
  matcher: ['/((?:start|foundations|patterns|docs)/[^.]+)', '/((?:start|foundations|patterns|docs)/.+\\.md)'],
};

export function proxy(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl;

  if (pathname.endsWith('.md')) {
    const page = pathname.slice(0, -'.md'.length);
    if (!DOC_PATHS.has(page)) return NextResponse.next();
    return NextResponse.rewrite(new URL(markdownRoute(page), request.url));
  }

  if (!DOC_PATHS.has(pathname)) return NextResponse.next();

  const response = prefersMarkdown(request.headers.get('accept'))
    ? NextResponse.rewrite(new URL(markdownRoute(pathname), request.url))
    : NextResponse.next();
  response.headers.set('Vary', 'Accept');
  response.headers.set('Link', alternateLink(pathname));
  return response;
}
