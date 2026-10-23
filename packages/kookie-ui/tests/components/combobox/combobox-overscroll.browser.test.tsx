import * as React from 'react';
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { userEvent } from 'vitest/browser';
import { Combobox, Theme } from '../../../src/components/index';

const frames = () => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => setTimeout(resolve, 100))));

/**
 * Chromium composites any scroller whose overscroll-behavior is not auto, even when its content
 * fits: an open Combobox with 3 items had 7 layers with `contain` on the list and 5 with it on
 * the content instead (CDP LayerTree, 1280x800). The content is overflow: hidden, not
 * user-scrollable, so it is not composited for it, and it still stops the chain.
 */
describe('Combobox list scroll chaining', () => {
  function Fruit({ count }: { count: number }) {
    return (
      <Theme>
        <Combobox.Root defaultOpen>
          <Combobox.Trigger aria-label="Fruit">
            <Combobox.Value placeholder="Pick" />
          </Combobox.Trigger>
          <Combobox.Content>
            <Combobox.List>
              {Array.from({ length: count }, (_, i) => (
                <Combobox.Item key={i} value={`f${i}`}>
                  Fruit {i}
                </Combobox.Item>
              ))}
            </Combobox.List>
          </Combobox.Content>
        </Combobox.Root>
        <div style={{ height: 3000 }} />
      </Theme>
    );
  }

  const list = () => document.querySelector<HTMLElement>('.kui-ComboboxScrollArea')!;
  const content = () => document.querySelector<HTMLElement>('.kui-ComboboxContent')!;

  it('in Chromium the list is not a non-auto overscroll scroller; the content holds the chain', async () => {
    render(<Fruit count={3} />);
    await frames();
    expect(CSS.supports('-webkit-app-region', 'drag')).toBe(true);
    expect(getComputedStyle(list()).overscrollBehaviorY).toBe('auto');
    expect(getComputedStyle(content()).overflowY).toBe('hidden');
    expect(getComputedStyle(content()).overscrollBehaviorY).toBe('contain');
  });

  it('a wheel at the end of a long list does not scroll the page', async () => {
    render(<Fruit count={40} />);
    await frames();
    window.scrollTo(0, 0);
    const el = list();
    expect(el.scrollHeight).toBeGreaterThan(el.clientHeight);
    el.scrollTop = el.scrollHeight;
    await frames();
    await userEvent.wheel(el, { delta: { y: 400 } });
    await frames();
    expect(window.scrollY).toBe(0);
  });
});
