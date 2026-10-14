import * as React from 'react';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { describe, it, expect } from 'vitest';
import { renderWithProviders } from '../../test-utils';
import { Shell } from '../../../src/components/index';

// Comments stripped: the stylesheet's own explanation quotes the old selector.
const css = readFileSync(resolve(__dirname, '../../../src/components/shell.css'), 'utf8').replace(/\/\*[\s\S]*?\*\//g, '');

describe('Shell.Root height', () => {
  // The stylesheet's `100dvh` override could never apply while Root wrote an
  // inline `100vh` for its default: an inline declaration beats any rule.
  it('writes no inline height for the default, so the stylesheet decides it', () => {
    const { container } = renderWithProviders(
      <Shell.Root>
        <Shell.Content>content</Shell.Content>
      </Shell.Root>,
    );
    const root = container.querySelector('.rt-ShellRoot') as HTMLElement;
    expect(root.style.height).toBe('');
  });

  it('states 100dvh in the stylesheet, on a selector the default matches', () => {
    expect(css).toMatch(/@supports \(height: 100dvh\)\s*\{\s*\.rt-ShellRoot\s*\{\s*height: 100dvh;/);
    expect(css).not.toContain(":not([style*='height'])");
  });

  it('still writes an explicit height inline', () => {
    const { container } = renderWithProviders(
      <Shell.Root height={480}>
        <Shell.Content>content</Shell.Content>
      </Shell.Root>,
    );
    expect((container.querySelector('.rt-ShellRoot') as HTMLElement).style.height).toBe('480px');
  });
});

describe('pane height prop', () => {
  // PaneBaseProps declares `height`, no pane reads it, and it used to reach
  // the DOM as an invalid attribute on the pane's div.
  it('does not reach the DOM', () => {
    const { container } = renderWithProviders(
      <Shell.Root>
        <Shell.Content>content</Shell.Content>
        <Shell.Inspector presentation="fixed" defaultOpen height={300}>
          inspector
        </Shell.Inspector>
      </Shell.Root>,
    );
    const inspector = container.querySelector('.rt-ShellInspector') as HTMLElement;
    expect(inspector.hasAttribute('height')).toBe(false);
  });
});
