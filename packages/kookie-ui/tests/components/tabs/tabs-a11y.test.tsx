import * as React from 'react';
import { describe, expect, it } from 'vitest';
import { renderWithProviders, screen } from '../../test-utils';
import { Tabs } from '../../../src/components/index';

describe('Tabs.Content', () => {
  it('is not a live region, so a switch is not read out as a whole panel', () => {
    renderWithProviders(
      <Tabs.Root defaultValue="a">
        <Tabs.List>
          <Tabs.Trigger value="a">A</Tabs.Trigger>
          <Tabs.Trigger value="b">B</Tabs.Trigger>
        </Tabs.List>
        <Tabs.Content value="a">Panel A</Tabs.Content>
        <Tabs.Content value="b">Panel B</Tabs.Content>
      </Tabs.Root>,
    );
    const panel = screen.getByRole('tabpanel');
    expect(panel).not.toHaveAttribute('aria-live');
    expect(panel).not.toHaveAttribute('aria-atomic');
  });
});
