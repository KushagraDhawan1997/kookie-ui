import * as React from 'react';
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { Accordion, Theme } from '../../../src/components/index';

function Faq({ size }: { size: '1' | '2' | '3' | '4' }) {
  return (
    <Accordion.Root type="single" size={size} defaultValue="a">
      <Accordion.Item value="a">
        <Accordion.Header>
          <Accordion.Trigger>Open</Accordion.Trigger>
        </Accordion.Header>
        <Accordion.Content>Body</Accordion.Content>
      </Accordion.Item>
      <Accordion.Item value="b">
        <Accordion.Header>
          <Accordion.Trigger>Closed</Accordion.Trigger>
        </Accordion.Header>
        <Accordion.Content>Body</Accordion.Content>
      </Accordion.Item>
    </Accordion.Root>
  );
}

describe('Accordion look', () => {
  it('the corner steps up the surface radius with the size', () => {
    const radii = (['1', '2', '3', '4'] as const).map((size) => {
      const { container, unmount } = render(
        <Theme>
          <Faq size={size} />
        </Theme>,
      );
      const r = parseFloat(getComputedStyle(container.querySelector('.kui-AccordionRoot')!).borderTopLeftRadius);
      unmount();
      return r;
    });
    for (let i = 1; i < radii.length; i++) expect(radii[i]).toBeGreaterThan(radii[i - 1]);
  });

  it('the chevron sits at the far end and turns while open', () => {
    const { container } = render(
      <Theme>
        <Faq size="2" />
      </Theme>,
    );
    const [open, closed] = container.querySelectorAll<HTMLElement>('.kui-AccordionTrigger');
    const chevron = open.querySelector<SVGElement>('.kui-AccordionChevron')!;
    const triggerRect = open.getBoundingClientRect();
    const chevronRect = chevron.getBoundingClientRect();
    expect(chevronRect.width).toBeGreaterThan(8);
    expect(triggerRect.right - chevronRect.right).toBeLessThan(40);
    expect(getComputedStyle(chevron).rotate).toBe('180deg');
    expect(getComputedStyle(closed.querySelector('.kui-AccordionChevron')!).rotate).not.toBe('180deg');
  });
});
