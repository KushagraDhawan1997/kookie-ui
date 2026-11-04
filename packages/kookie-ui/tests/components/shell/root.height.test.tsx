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
    const root = container.querySelector('.kui-ShellRoot') as HTMLElement;
    expect(root.style.height).toBe('');
  });

  it('states 100dvh in the stylesheet, on a selector the default matches', () => {
    expect(css).toMatch(/@supports \(height: 100dvh\)\s*\{\s*\.kui-ShellRoot\s*\{\s*height: 100dvh;/);
    expect(css).not.toContain(":not([style*='height'])");
  });

  it('still writes an explicit height inline', () => {
    const { container } = renderWithProviders(
      <Shell.Root height={480}>
        <Shell.Content>content</Shell.Content>
      </Shell.Root>,
    );
    expect((container.querySelector('.kui-ShellRoot') as HTMLElement).style.height).toBe('480px');
  });
});

describe('Shell.Root contained', () => {
  const rootOf = (ui: React.ReactElement) => renderWithProviders(ui).container.querySelector('.kui-ShellRoot') as HTMLElement;
  const shell = (props: Partial<React.ComponentProps<typeof Shell.Root>>) => (
    <Shell.Root {...props}>
      <Shell.Content>content</Shell.Content>
    </Shell.Root>
  );

  it('a Shell with no height is a window Shell', () => {
    const root = rootOf(shell({}));
    expect(root.hasAttribute('data-window')).toBe(true);
    expect(root.hasAttribute('data-contained')).toBe(false);
  });

  it('`contained` fills the parent: no inline height, and the stylesheet says 100%', () => {
    const root = rootOf(shell({ contained: true }));
    expect(root.hasAttribute('data-contained')).toBe(true);
    expect(root.hasAttribute('data-window')).toBe(false);
    expect(root.style.height).toBe('');
    expect(css).toMatch(/\.kui-ShellRoot\[data-contained\]\s*\{\s*height: 100%;/);
  });

  it('an explicit height implies contained, and is written inline', () => {
    for (const height of [480, '100vh', '100%']) {
      const root = rootOf(shell({ height }));
      expect(root.hasAttribute('data-contained'), String(height)).toBe(true);
      expect(root.hasAttribute('data-window'), String(height)).toBe(false);
    }
  });

  it('`auto` grows with its content and is neither a window Shell nor contained', () => {
    const root = rootOf(shell({ height: 'auto' }));
    expect(root.getAttribute('data-height')).toBe('auto');
    expect(root.hasAttribute('data-window')).toBe(false);
    expect(root.hasAttribute('data-contained')).toBe(false);
  });

  it('`contained` with `auto` keeps its overlays in its own box', () => {
    const root = rootOf(shell({ height: 'auto', contained: true }));
    expect(root.hasAttribute('data-height')).toBe(false);
    expect(root.hasAttribute('data-contained')).toBe(true);
  });

  it('a Shell.Header that is not 64px tells the Root its height', () => {
    const root = rootOf(
      <Shell.Root>
        <Shell.Header height={48}>header</Shell.Header>
        <Shell.Content>content</Shell.Content>
      </Shell.Root>,
    );
    expect(root.style.getPropertyValue('--kui-shell-header-h')).toBe('48px');
    const plain = rootOf(
      <Shell.Root>
        <Shell.Header>header</Shell.Header>
        <Shell.Content>content</Shell.Content>
      </Shell.Root>,
    );
    expect(plain.style.getPropertyValue('--kui-shell-header-h')).toBe('');
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
    const inspector = container.querySelector('.kui-ShellInspector') as HTMLElement;
    expect(inspector.hasAttribute('height')).toBe(false);
  });
});
