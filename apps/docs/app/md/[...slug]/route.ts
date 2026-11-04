import { markdownFor } from '@/lib/markdown';
import { DOC_PAGES } from '@/lib/pages';

/**
 * The Markdown twin's route. Ported from Kookie UI v2's `app/md/[...slug]/route.ts`.
 *
 * `/docs/button.md` and a request for `/docs/button` that asks for `text/markdown` both reach
 * here through `proxy.ts`. A file extension is not something a route segment can express, so the
 * URL a reader sees carries `.md` and the handler underneath is an ordinary catch-all.
 */
export const dynamic = 'force-static';

export function generateStaticParams() {
  return DOC_PAGES.map((page) => ({ slug: page.path.replace(/^\//, '').split('/') }));
}

export async function GET(_request: Request, { params }: { params: Promise<{ slug: string[] }> }): Promise<Response> {
  const { slug } = await params;
  const body = markdownFor(slug.join('/'));
  // A 404 rather than the HTML: a client that asked for Markdown cannot read a page of markup.
  if (!body) return new Response('Not found\n', { status: 404 });
  return new Response(body, {
    headers: {
      'content-type': 'text/markdown; charset=utf-8',
      'cache-control': 'public, max-age=0, must-revalidate',
    },
  });
}
