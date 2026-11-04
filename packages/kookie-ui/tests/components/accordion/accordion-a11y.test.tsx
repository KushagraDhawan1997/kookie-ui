import * as React from 'react';
import { describe, expect, it } from 'vitest';
import { renderWithProviders, screen } from '../../test-utils';
import { Accordion } from '../../../src/components/index';

function Faq() {
  return (
    <Accordion.Root type="single" defaultValue="a">
      <Accordion.Item value="a">
        <Accordion.Header>
          <Accordion.Trigger>Can I get a refund?</Accordion.Trigger>
        </Accordion.Header>
        <Accordion.Content>Yes, within 30 days.</Accordion.Content>
      </Accordion.Item>
    </Accordion.Root>
  );
}

describe('Accordion', () => {
  it('Content is not a live region', () => {
    renderWithProviders(<Faq />);
    const panel = screen.getByText('Yes, within 30 days.').closest('.kui-AccordionContent')!;
    expect(panel).not.toHaveAttribute('aria-live');
  });

  it('Trigger draws a hidden chevron and keeps its text as its name', () => {
    renderWithProviders(<Faq />);
    const trigger = screen.getByRole('button', { name: 'Can I get a refund?' });
    const chevron = trigger.querySelector('svg.kui-AccordionChevron');
    expect(chevron).not.toBeNull();
    expect(chevron).toHaveAttribute('aria-hidden', 'true');
  });
});

describe('Accordion.Trigger asChild', () => {
  it('puts the chevron inside the child element', () => {
    renderWithProviders(
      <Accordion.Root type="single">
        <Accordion.Item value="a">
          <Accordion.Header>
            <Accordion.Trigger asChild>
              <button type="button" data-own>
                Shipping
              </button>
            </Accordion.Trigger>
          </Accordion.Header>
          <Accordion.Content>Body</Accordion.Content>
        </Accordion.Item>
      </Accordion.Root>,
    );
    const trigger = screen.getByRole('button', { name: 'Shipping' });
    expect(trigger).toHaveAttribute('data-own');
    expect(trigger.querySelector('.kui-AccordionChevron')).not.toBeNull();
  });
});
