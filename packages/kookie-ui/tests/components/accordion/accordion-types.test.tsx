import * as React from 'react';
import { describe, expect, it } from 'vitest';
import { renderWithProviders as render } from '../../test-utils';
import { Accordion } from '../../../src/components/index';

describe('Accordion.Root types', () => {
  it('accepts defaultValue and collapsible for each type', () => {
    const single = <Accordion.Root type="single" defaultValue="a" collapsible />;
    const multiple = <Accordion.Root type="multiple" defaultValue={['a']} />;
    // @ts-expect-error a multiple accordion takes an array
    const wrong = <Accordion.Root type="multiple" defaultValue="a" />;
    expect([single, multiple, wrong]).toHaveLength(3);
  });

  it('opens the item named by defaultValue', () => {
    const { getByText } = render(
      <Accordion.Root type="single" defaultValue="a" collapsible>
        <Accordion.Item value="a">
          <Accordion.Header>
            <Accordion.Trigger>Billing</Accordion.Trigger>
          </Accordion.Header>
          <Accordion.Content>Invoices</Accordion.Content>
        </Accordion.Item>
      </Accordion.Root>,
    );
    expect(getByText('Billing').closest('button')?.getAttribute('aria-expanded')).toBe('true');
  });
});
