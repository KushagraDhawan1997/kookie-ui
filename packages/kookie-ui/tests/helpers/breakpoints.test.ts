import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { describe, expect, it } from 'vitest';
import { breakpoints } from '../../src/index';

// The exported widths are the stylesheet's, so an app's media queries switch with Kookie's props.
describe('breakpoints', () => {
  it('match styles/breakpoints.css', () => {
    const css = readFileSync(join(process.cwd(), 'src/styles/breakpoints.css'), 'utf8');
    const fromCss = Object.fromEntries([...css.matchAll(/@custom-media --(\w+) \(min-width: (\d+)px\)/g)].map(([, name, px]) => [name, Number(px)]));
    expect(breakpoints).toEqual(fromCss);
    expect(Object.keys(fromCss)).toEqual(['xs', 'sm', 'md', 'lg', 'xl']);
  });
});
