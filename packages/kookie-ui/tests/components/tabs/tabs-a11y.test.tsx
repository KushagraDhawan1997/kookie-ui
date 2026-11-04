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

describe('Tabs.Trigger children', () => {
  it('renders element children once, so ids are not duplicated', () => {
    const { container } = renderWithProviders(
      <Tabs.Root defaultValue="a">
        <Tabs.List>
          <Tabs.Trigger value="a">
            <span id="dup">A</span>
          </Tabs.Trigger>
        </Tabs.List>
      </Tabs.Root>,
    );
    expect(container.querySelectorAll('#dup')).toHaveLength(1);
  });

  it('keeps a hidden width copy for plain text, out of the accessibility tree', () => {
    const { container } = renderWithProviders(
      <Tabs.Root defaultValue="a">
        <Tabs.List>
          <Tabs.Trigger value="a">Account {2}</Tabs.Trigger>
        </Tabs.List>
      </Tabs.Root>,
    );
    expect(container.querySelector('.kui-TabsTriggerInnerHidden')).toHaveAttribute('aria-hidden', 'true');
    expect(screen.getByRole('tab', { name: 'Account 2' })).toBeInTheDocument();
  });
});
