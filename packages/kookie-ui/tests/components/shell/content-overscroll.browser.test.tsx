import * as React from 'react';
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { userEvent } from 'vitest/browser';
import { Shell, Theme } from '../../../src/components/index';

const frames = () => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => setTimeout(resolve, 100))));

/**
 * Chromium composites any scroller whose overscroll-behavior is not auto, even when its content
 * fits: a Shell whose page fits had 6 layers with `contain` on the content and 4 without, about
 * 4 MB of layer area at 1280x800 (CDP LayerTree). The Root, which is not user-scrollable, holds
 * the chain there instead, at no cost.
 */
describe('Shell content scroll chaining', () => {
  function Page({ rows }: { rows: number }) {
    return (
      <div data-testid="outer" style={{ height: 300, overflow: 'auto' }}>
        <Theme>
          <Shell.Root height="200px">
            <Shell.Content>
              {Array.from({ length: rows }, (_, i) => (
                <div key={i} style={{ height: 40 }}>
                  Row {i}
                </div>
              ))}
            </Shell.Content>
          </Shell.Root>
        </Theme>
        <div style={{ height: 2000 }} />
      </div>
    );
  }

  it('in Chromium the content is not a non-auto overscroll scroller; the Root holds the chain', () => {
    const { container } = render(<Page rows={1} />);
    const content = container.querySelector<HTMLElement>('.kui-ShellContent')!;
    const root = container.querySelector<HTMLElement>('.kui-ShellRoot')!;
    expect(CSS.supports('-webkit-app-region', 'drag')).toBe(true);
    expect(getComputedStyle(content).overscrollBehaviorY).toBe('auto');
    expect(getComputedStyle(root).overflowY).toBe('hidden');
    expect(getComputedStyle(root).overscrollBehaviorY).toBe('none');
  });

  it('a wheel at the end of overflowing content does not scroll what holds the Shell', async () => {
    const { container, getByTestId } = render(<Page rows={40} />);
    const content = container.querySelector<HTMLElement>('.kui-ShellContent')!;
    const outer = getByTestId('outer');
    expect(content.scrollHeight).toBeGreaterThan(content.clientHeight);
    content.scrollTop = content.scrollHeight;
    await frames();
    await userEvent.wheel(content, { delta: { y: 400 } });
    await frames();
    expect(outer.scrollTop).toBe(0);
  });
});
