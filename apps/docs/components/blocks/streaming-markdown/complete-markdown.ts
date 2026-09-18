/**
 * Closes markdown that a stream has cut off mid-token, so a partial message still parses
 * the way the finished one will. Handles code fences, inline code, links, bold, italic,
 * strikethrough, and trailing headings, list items and blockquotes.
 */
export function completeUnterminatedMarkdown(content: string): string {
  if (!content.trim()) return content;

  const trimmed = content.trimEnd();
  const trailingWhitespace = content.slice(trimmed.length);
  const close = (suffix: string) => trimmed + suffix + trailingWhitespace;

  // A fence that has only just opened, e.g. "```python" with no newline yet.
  if (/```[\w-]*$/.test(trimmed) && !trimmed.includes('```\n') && !/```[\w-]+\n/.test(trimmed)) {
    return close('\n```');
  }

  if (countMatches(trimmed, /```/g) % 2 === 1) return close('\n```');

  // Inline backticks, ignoring fence markers.
  if (countMatches(trimmed.replace(/```[\w-]*/g, ''), /`/g) % 2 === 1) return close('`');

  if (/\[[^\]]*\]\([^)]*$/.test(trimmed)) return close(')');

  if (hasUnpairedMarker(trimmed, '**')) return close('**');
  if (hasUnpairedMarker(trimmed, '__')) return close('__');
  if (hasUnpairedMarker(trimmed, '~~')) return close('~~');

  // Structural endings need a newline to parse. Checked before italics so "* item" stays a list.
  const lastLine = trimmed.slice(trimmed.lastIndexOf('\n') + 1);
  if (/^#{1,6}\s+.+$/.test(lastLine) || /^(\s*)([-*+]|\d+\.)\s+.+$/.test(lastLine) || /^>\s+.+$/.test(lastLine)) {
    return close('\n');
  }

  if (hasUnpairedItalic(trimmed, '*')) return close('*');
  if (hasUnpairedItalic(trimmed, '_')) return close('_');

  return content;
}

/**
 * Splits markdown into top-level blocks so each can be memoized while a stream grows.
 * Pass a lexer such as `marked.lexer`; without one the content stays a single block.
 */
export function parseMarkdownIntoBlocks(
  content: string,
  parser?: (content: string) => Array<{ raw?: string }>,
): string[] {
  if (!content.trim()) return [];

  const completed = completeUnterminatedMarkdown(content);
  if (!parser) return [completed];

  return parser(completed)
    .map((token) => (typeof token.raw === 'string' ? token.raw : ''))
    .filter((raw) => raw.trim().length > 0);
}

function countMatches(content: string, pattern: RegExp): number {
  return content.match(pattern)?.length ?? 0;
}

/** An odd number of a double marker, with text after the last one. */
function hasUnpairedMarker(content: string, marker: '**' | '__' | '~~'): boolean {
  if (content.split(marker).length % 2 === 1) return false;
  return content.lastIndexOf(marker) + marker.length < content.length;
}

/** An odd number of single `*` or `_`, skipping list bullets and bold markers. */
function hasUnpairedItalic(content: string, marker: '*' | '_'): boolean {
  let count = 0;
  let lastIndex = -1;

  for (let i = 0; i < content.length; i++) {
    if (content[i] !== marker) continue;

    const isListBullet = marker === '*' && (i === 0 || content[i - 1] === '\n') && content[i + 1] === ' ';
    if (isListBullet) continue;

    if (content[i + 1] === marker) {
      i++; // Skip the pair — it is bold, not italic.
      continue;
    }
    if (content[i - 1] === marker) continue;

    count++;
    lastIndex = i;
  }

  if (count % 2 === 0 || lastIndex === -1) return false;

  // A trailing marker opens new italics only if something comes before it.
  if (lastIndex === content.length - 1) return lastIndex > 0;
  return true;
}
