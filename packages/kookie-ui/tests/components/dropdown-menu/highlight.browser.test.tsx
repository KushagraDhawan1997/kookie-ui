import * as React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from 'vitest/browser';
import { DropdownMenu, Text, Theme } from '../../../src/components/index';

function Menu() {
  return (
    <Theme>
      <DropdownMenu.Root open modal={false}>
        <DropdownMenu.Trigger>
          <button type="button">Open</button>
        </DropdownMenu.Trigger>
        <DropdownMenu.Content>
          <DropdownMenu.Item>
            Report
            <Text emphasis="medium" data-testid="muted">
              PDF
            </Text>
            <Text emphasis="medium" color="gray" data-testid="gray">
              2 MB
            </Text>
            <Text emphasis="medium" data-testid="custom" style={{ color: 'rgb(255, 0, 0)' }}>
              New
            </Text>
            <span data-testid="probe" style={{ color: 'var(--neutral-11)' }} />
          </DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Root>
    </Theme>
  );
}

describe('DropdownMenu highlighted row text', () => {
  it('lifts muted Text a step, and a caller color still wins', async () => {
    render(<Menu />);
    const item = await screen.findByRole('menuitem', { name: /Report/ });
    await userEvent.hover(item);
    await waitFor(() => expect(item).toHaveAttribute('data-highlighted'));

    const lifted = getComputedStyle(screen.getByTestId('probe')).color;
    expect(getComputedStyle(screen.getByTestId('muted')).color).toBe(lifted);
    expect(getComputedStyle(screen.getByTestId('gray')).color).toBe(lifted);
    expect(getComputedStyle(screen.getByTestId('custom')).color).toBe('rgb(255, 0, 0)');
  });
});
