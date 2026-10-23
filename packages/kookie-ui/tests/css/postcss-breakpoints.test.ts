import { describe, expect, it } from 'vitest';
import postcss from 'postcss';
import * as path from 'path';

// The plugin reads src/styles/breakpoints.css relative to the package root.
process.chdir(path.join(__dirname, '../..'));
// eslint-disable-next-line @typescript-eslint/no-require-imports
const breakpoints = require('../../postcss-breakpoints.cjs');

const run = (css: string) => postcss([breakpoints()]).process(css, { from: undefined }).css;

describe('postcss-breakpoints', () => {
  it('prefixes responsive classes per breakpoint', () => {
    const out = run('@breakpoints { .kui-Box.kui-r-p-2 { padding: 1px; } }');
    expect(out).toContain('.kui-Box.kui-r-p-2');
    expect(out).toMatch(/\.xs\\:kui-r-p-2/);
  });

  it('refuses compound props on a kui- component', () => {
    expect(() => run('@breakpoints { .kui-DialogContent.kui-r-size-2.gray { padding: 1px; } }')).toThrow(/compound props/);
  });
});
