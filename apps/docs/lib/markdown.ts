/**
 * The Markdown twin: every docs page served a second time as plain Markdown at its own path with
 * `.md` on the end. Ported from Kookie UI v2's `app/(docs)/markdown.ts`.
 *
 * Derived, never authored: a twin is the page's own `.mdx` file with its title and description
 * on top. No attribution line and no preamble: only the page's own words reach the reader's model.
 *
 * Server only (reads files).
 */
import fs from 'fs';
import path from 'path';
import matter from 'gray-matter';
import { BY_SLUG } from './chapters';
import { getAllDependencies, getRequiredBlocks } from './blocks-registry';
import { getBlockFiles } from './block-source';
import { DOC_PATHS } from './pages';

/** A page path to its Markdown, or `null` where the site serves no twin. */
export function markdownFor(pagePath: string): string | null {
  const clean = `/${pagePath.replace(/^\/+|\/+$/g, '')}`;
  if (!DOC_PATHS.has(clean)) return null;

  const chapter = BY_SLUG.get(clean.slice(1));
  if (chapter) {
    const source = read(path.join(process.cwd(), 'content', `${chapter.slug}.mdx`));
    return source === null ? null : document(chapter.title, chapter.blurb, matter(source).content, null, path.join(process.cwd(), 'content'));
  }

  const dir = path.join(process.cwd(), 'app', ...clean.split('/').filter(Boolean));
  const source = read(path.join(dir, 'content.mdx'));
  if (source === null) return null;
  const { data, content } = matter(source);
  const block = /^\/docs\/blocks\/([^/]+)$/.exec(clean)?.[1] ?? null;
  return document(String(data.title ?? ''), data.description ? String(data.description) : undefined, content, block, dir);
}

function read(file: string): string | null {
  try {
    return fs.readFileSync(file, 'utf8');
  } catch {
    return null;
  }
}

function document(title: string, description: string | undefined, body: string, block: string | null, dir: string): string {
  const parts = [`# ${title}`];
  if (description) parts.push(description);
  parts.push(toMarkdown(body, block, dir));
  return `${dropEmptySections(parts.join('\n\n').replace(/\n{3,}/g, '\n\n')).trim()}\n`;
}

/** A heading whose whole section was a playground says nothing in text, so it goes too. */
function dropEmptySections(markdown: string): string {
  const lines = markdown.split('\n');
  // A heading's level, or 0 for anything else. Lines inside a fence are never headings.
  let inFence = false;
  const levels = lines.map((line) => {
    if (FENCE.test(line)) {
      inFence = !inFence;
      return 0;
    }
    return inFence ? 0 : (/^(#{1,6})\s/.exec(line)?.[1].length ?? 0);
  });
  return lines
    .filter((line, i) => {
      const own = levels[i];
      if (!own) return true;
      const j = lines.findIndex((other, k) => k > i && other.trim() !== '');
      return j !== -1 && (levels[j] === 0 || levels[j] > own);
    })
    .join('\n');
}

const fence = (code: string, lang = 'tsx') => `\`\`\`${lang}\n${code.trim()}\n\`\`\``;

const FENCE = /^(\s*)(`{3,}|~{3,})\s*([\w-]*)/;
const JSX_START = /^\s*<([A-Z][\w.]*)/;
// One JSX tag, with attribute values in braces up to two levels deep.
const TAG = /<(\/)?([A-Za-z][\w.]*)((?:[^>{}]|\{(?:[^{}]|\{[^{}]*\})*\})*?)(\/)?>/g;

/**
 * MDX to Markdown, line by line. Fences pass through (their meta string is dropped, the language
 * kept). Outside fences, `import`/`export` lines go, and a live component is replaced by what a
 * reader with no pixels can use: a playground goes, a preview becomes its source, and the block
 * installation steps are written out. An `Example` becomes its file's source.
 */
function toMarkdown(mdx: string, block: string | null, dir: string): string {
  const lines = mdx.split('\n');
  const out: string[] = [];
  let open: string | null = null;

  for (let i = 0; i < lines.length; i++) {
    const line = lines[i];
    const fenceMatch = FENCE.exec(line);

    if (open) {
      out.push(line);
      if (fenceMatch && fenceMatch[2].startsWith(open[0]) && fenceMatch[2].length >= open.length && !fenceMatch[3]) open = null;
      continue;
    }

    if (fenceMatch) {
      open = fenceMatch[2];
      out.push(`${fenceMatch[1]}${fenceMatch[2]}${fenceMatch[3]}`);
      continue;
    }

    if (/^(import|export)\s/.test(line)) {
      // A multi-line import runs to its `from` line.
      while (!/\bfrom\s+['"]|^export\s.*[;}]\s*$|^import\s+['"]/.test(lines[i]) && i < lines.length - 1) i++;
      continue;
    }

    const jsx = JSX_START.exec(line);
    if (jsx) {
      const end = jsxEnd(lines, i);
      const blockLines = lines.slice(i, end + 1);
      i = end;
      out.push(expand(jsx[1], blockLines, block, dir));
      continue;
    }

    out.push(line);
  }

  return out.join('\n');
}

/** The index of the line where the JSX element starting at `start` closes. */
function jsxEnd(lines: string[], start: number): number {
  let text = '';
  for (let i = start; i < lines.length; i++) {
    text += `${lines[i]}\n`;
    let depth = 0;
    let seen = false;
    for (const match of text.matchAll(TAG)) {
      const [, closing, , , selfClosing] = match;
      seen = true;
      if (selfClosing) continue;
      depth += closing ? -1 : 1;
    }
    if (seen && depth <= 0) return i;
  }
  return lines.length - 1;
}

function dedent(lines: string[]): string {
  const indent = Math.min(...lines.filter((l) => l.trim()).map((l) => /^\s*/.exec(l)?.[0].length ?? 0));
  return lines.map((l) => l.slice(Number.isFinite(indent) ? indent : 0)).join('\n');
}

function expand(name: string, lines: string[], block: string | null, dir: string): string {
  if (name.endsWith('Playground')) return '';
  if (name === 'Example') return example(lines.join('\n'), dir);
  if (name === 'BlockInstallation') return block ? installation(block) : '';
  if (name === 'PreviewBlock') return lines.length > 2 ? fence(dedent(lines.slice(1, -1))) : '';
  return fence(dedent(lines));
}

/** `<Example src="./examples/name" />` is the file it renders, as a fence. */
function example(tag: string, dir: string): string {
  const src = /\bsrc=["']([^"']+)["']/.exec(tag)?.[1];
  const code = src ? read(path.join(dir, src.endsWith('.tsx') ? src : `${src}.tsx`)) : null;
  return code === null ? '' : fence(code);
}

/** The words and files `BlockInstallation` renders on the page, as Markdown. */
function installation(slug: string): string {
  const dependencies = ['@kushagradhawan/kookie-ui', ...getAllDependencies(slug)];
  const required = getRequiredBlocks(slug);
  const files = getBlockFiles(slug);
  const parts = ['Install the dependencies.', fence(`npm install ${dependencies.join(' ')}`, 'bash')];
  if (required.length > 0) {
    const names = required.map((entry) => `[${entry.title}](/docs/blocks/${entry.slug})`);
    const list = names.length > 1 ? `${names.slice(0, -1).join(', ')} and ${names[names.length - 1]}` : names[0];
    parts.push(`This block imports ${list}. Copy ${required.length > 1 ? 'those' : 'that'} into \`components/blocks\` first.`);
  }
  parts.push(
    `Copy ${files.length > 1 ? 'these files' : 'this file'} into \`components/blocks/${slug}\`. Keep the folder names, since blocks import each other by relative path.`,
  );
  for (const file of files) parts.push(`\`${file.path}\``, fence(file.code, file.language));
  return parts.join('\n\n');
}
