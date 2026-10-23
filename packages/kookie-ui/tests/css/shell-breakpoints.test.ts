import { describe, expect, it } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';
import { _BREAKPOINTS, SHELL_BREAKPOINTS } from '../../src/components/shell.types';

const css = fs.readFileSync(path.join(__dirname, '../../src/components/shell.css'), 'utf8').replace(/\/\*[\s\S]*?\*\//g, (comment) => comment.replace(/[^\n]/g, ' '));

/** Each top-level `@media (min-width: …)` block, with the text inside it. */
function minWidthBlocks() {
  const blocks: Array<{ query: string; body: string }> = [];
  const pattern = /@media\s*(\(min-width:\s*\d+px\))\s*\{/g;
  for (let match = pattern.exec(css); match; match = pattern.exec(css)) {
    let depth = 1;
    let i = pattern.lastIndex;
    while (depth > 0 && i < css.length) {
      if (css[i] === '{') depth += 1;
      else if (css[i] === '}') depth -= 1;
      i += 1;
    }
    blocks.push({ query: match[1], body: css.slice(pattern.lastIndex, i - 1) });
  }
  return blocks;
}

/** The stylesheet with every `@media` block removed: what applies at `initial`. */
function outsideMedia() {
  let out = css;
  for (const { query, body } of minWidthBlocks()) out = out.replace(body, '').replace(`@media ${query}`, '');
  return out;
}

const attributesFor = (bp: string) => [
  `[data-presentation-${bp}='fixed']`,
  `[data-presentation-${bp}='overlay']`,
  `[data-presentation-${bp}='stacked']`,
  `[data-auto-${bp}='closed']`,
  `[data-auto-${bp}='open']`,
];

/**
 * A pane's attributes are written from one table, and two readers act on
 * them: the stylesheet, which places and shows the pane, and the JS mirror
 * (`useBreakpoint`), which sets `aria-expanded` and `data-mode`. They agree
 * only if the stylesheet's `@media` widths are the mirror's widths.
 */
describe('the Shell stylesheet and its JS mirror agree on the breakpoints', () => {
  it('has one min-width block per breakpoint, at the same width as _BREAKPOINTS', () => {
    const queries = minWidthBlocks().map((block) => block.query);
    expect(queries).toEqual(Object.values(_BREAKPOINTS));
  });

  it('reads each breakpoint attribute only inside that breakpoint block', () => {
    const blocks = minWidthBlocks();
    for (const bp of SHELL_BREAKPOINTS) {
      const home = bp === 'initial' ? outsideMedia() : blocks.find((block) => block.query === _BREAKPOINTS[bp as keyof typeof _BREAKPOINTS])?.body;
      expect(home, bp).toBeDefined();
      for (const attribute of attributesFor(bp)) {
        expect(home, `${attribute} should be styled`).toContain(attribute);
        for (const other of blocks) {
          if (other.body === home) continue;
          expect(other.body, `${attribute} inside ${other.query}`).not.toContain(attribute);
        }
      }
    }
  });

  it('lists the breakpoints in the order the stylesheet cascades them', () => {
    expect(SHELL_BREAKPOINTS).toEqual(['initial', ...Object.keys(_BREAKPOINTS)]);
    const widths = Object.values(_BREAKPOINTS).map((query) => Number(query.match(/(\d+)px/)?.[1]));
    expect(widths).toEqual([...widths].sort((a, b) => a - b));
  });
});

/**
 * The inset backdrop must not wait for a script. The Root's `data-has-inset`
 * is set after hydration; the `:has()` arm paints the same backdrop from the
 * server markup, so a first paint already shows the gray behind inset panes.
 */
describe('the inset backdrop paints before hydration', () => {
  it('has a :has() arm sharing the data-has-inset rule', () => {
    const rule = css.match(/([^{}]*\.kui-ShellRoot\[data-has-inset\]::before)\s*\{/);
    expect(rule, 'the data-has-inset backdrop rule').not.toBeNull();
    expect(rule?.[1]).toContain('.kui-ShellRoot:has(> [data-inset])::before');
  });
});
