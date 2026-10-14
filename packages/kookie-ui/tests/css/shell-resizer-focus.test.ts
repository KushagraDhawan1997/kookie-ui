import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, it, expect } from 'vitest';

const css = readFileSync(resolve(__dirname, '../../src/components/shell.css'), 'utf8');

// The resize handle took keyboard focus and drew nothing. It draws the
// system's focus value as a line on the pane edge it moves.
describe('shell resizer focus style', () => {
  it('paints the focus value on focus-visible', () => {
    const rule = css.match(/\.rt-ShellResizer:focus-visible::before\s*\{([^}]*)\}/);
    expect(rule, 'focus-visible rule').toBeTruthy();
    expect(rule![1]).toMatch(/background-color:\s*var\(--focus-8\)/);
  });

  it('gives the line an extent on both orientations', () => {
    expect(css).toMatch(/\.rt-ShellResizer\[data-orientation='vertical'\]::before\s*\{[^}]*inline-size:\s*2px/);
    expect(css).toMatch(/\.rt-ShellResizer\[data-orientation='horizontal'\]::before\s*\{[^}]*block-size:\s*2px/);
  });
});
