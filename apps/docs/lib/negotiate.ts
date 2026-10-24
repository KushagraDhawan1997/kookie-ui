/**
 * Content negotiation for the Markdown twin. Ported from Kookie UI v2's `app/(docs)/negotiate.ts`.
 *
 * A client that ranks `text/markdown` above `text/html` in `Accept` gets the twin from the page's
 * own URL. Ranked by q, then by how specifically each type is named, then by position; a tie goes
 * to HTML, so a browser's navigation header (html first, markdown only through a wildcard) and a
 * bare `fetch()` both get the page.
 */

const HTML = 'text/html';
const MARKDOWN = 'text/markdown';

/** The `Link` header naming the twin. Relative, which RFC 8288 allows: the site states no origin. */
export const alternateLink = (pathname: string): string => `<${pathname}.md>; rel="alternate"; type="text/markdown"`;

// Exact match beats `text/*` beats `*/*` (RFC 9110). A range that does not match scores nothing.
function specificity(range: string, type: string): number {
  const [wantType = '', wantSub = ''] = type.split('/');
  const [rangeType = '', rangeSub = ''] = range.split('/');
  if (rangeType === wantType && rangeSub === wantSub) return 3;
  if (rangeType === wantType && rangeSub === '*') return 2;
  if (rangeType === '*' && rangeSub === '*') return 1;
  return 0;
}

type Preference = { q: number; specificity: number; position: number };

function preferenceFor(accept: string, type: string): Preference | null {
  let best: Preference | null = null;
  const ranges = accept.split(',');
  for (let position = 0; position < ranges.length; position++) {
    const parts = ranges[position].trim().split(';');
    const range = (parts.shift() ?? '').trim().toLowerCase();
    const found = specificity(range, type);
    if (!found) continue;
    const quality = parts.map((part) => /^\s*q\s*=\s*([0-9.]+)\s*$/i.exec(part)).find((match) => match !== null);
    const q = quality ? Number(quality[1]) : 1;
    if (Number.isNaN(q)) continue;
    if (!best || found > best.specificity) best = { q, position, specificity: found };
  }
  return best;
}

/** Does this request want the twin rather than the page? Only when markdown outranks html. */
export function prefersMarkdown(accept: string | null | undefined): boolean {
  if (!accept) return false;
  const markdown = preferenceFor(accept, MARKDOWN);
  if (!markdown || markdown.q <= 0) return false;
  const html = preferenceFor(accept, HTML);
  if (!html || html.q <= 0) return true;
  if (markdown.q !== html.q) return markdown.q > html.q;
  if (markdown.specificity !== html.specificity) return markdown.specificity > html.specificity;
  return markdown.position < html.position;
}
