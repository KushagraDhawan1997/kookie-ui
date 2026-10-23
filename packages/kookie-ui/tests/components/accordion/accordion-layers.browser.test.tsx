import * as React from 'react';
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { Accordion, Theme } from '../../../src/components/index';

/**
 * Nothing animates Accordion content, so a `will-change` on it only costs: Chromium gave every
 * open item its own composited layer. 20 open items: 24 layers and 12.5 MB of layer area with
 * it, 4 layers and 8.7 MB without (CDP LayerTree, 1280x800).
 */
describe('open Accordion content is not promoted to a layer', () => {
  it('has no will-change and no animation', () => {
    const items = ['a', 'b', 'c'];
    const { container } = render(
      <Theme>
        <Accordion.Root type="multiple" defaultValue={items}>
          {items.map((v) => (
            <Accordion.Item key={v} value={v}>
              <Accordion.Trigger>Item {v}</Accordion.Trigger>
              <Accordion.Content>Body {v}</Accordion.Content>
            </Accordion.Item>
          ))}
        </Accordion.Root>
      </Theme>,
    );
    const contents = container.querySelectorAll<HTMLElement>('.kui-AccordionContent');
    expect(contents).toHaveLength(3);
    for (const content of contents) {
      expect(content.dataset.state).toBe('open');
      const style = getComputedStyle(content);
      expect(style.willChange).toBe('auto');
      expect(style.animationName).toBe('none');
    }
  });
});
