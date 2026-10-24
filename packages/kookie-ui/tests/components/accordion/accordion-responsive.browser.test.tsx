import * as React from 'react';
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { userEvent } from 'vitest/browser';
import { Accordion, Theme } from '../../../src/components/index';

type Size = '1' | '2' | '3' | '4';

function Faq({ size, variant }: { size: Size | { initial: Size; md: Size }; variant?: 'soft' | 'surface' | 'outline' | 'ghost' | 'raised' }) {
  return (
    <Accordion.Root type="single" size={size} variant={variant} defaultValue="a">
      <Accordion.Item value="a">
        <Accordion.Header>
          <Accordion.Trigger>Open</Accordion.Trigger>
        </Accordion.Header>
        <Accordion.Content>Body</Accordion.Content>
      </Accordion.Item>
    </Accordion.Root>
  );
}

function measure(size: Size | { initial: Size; md: Size }) {
  const { container, unmount } = render(
    <Theme>
      <Faq size={size} />
    </Theme>,
  );
  const trigger = getComputedStyle(container.querySelector('.kui-AccordionTrigger')!);
  const chevron = getComputedStyle(container.querySelector('.kui-AccordionChevron')!);
  const inner = getComputedStyle(container.querySelector('.kui-AccordionContentInner')!);
  const out = {
    padding: trigger.padding,
    font: trigger.fontSize,
    chevron: chevron.width,
    inner: inner.padding,
  };
  unmount();
  return out;
}

describe('Accordion responsive size', () => {
  // The viewport is 1280px wide, so the md value applies.
  it('a responsive size matches the fixed size at the current breakpoint', () => {
    expect(measure({ initial: '1', md: '4' })).toEqual(measure('4'));
    expect(measure({ initial: '1', md: '2' })).toEqual(measure('2'));
  });
});

describe('Accordion focus ring', () => {
  it('a mouse click draws no ring on the root', async () => {
    for (const variant of ['soft', 'surface', 'outline', 'ghost', 'raised'] as const) {
      const { container, unmount } = render(
        <Theme>
          <Faq size="2" variant={variant} />
        </Theme>,
      );
      await userEvent.click(container.querySelector('.kui-AccordionTrigger')!);
      expect(getComputedStyle(container.querySelector('.kui-AccordionRoot')!).outlineStyle).toBe('none');
      unmount();
    }
  });
});
