import * as React from 'react';
import { describe, expect, it } from 'vitest';
import userEvent from '@testing-library/user-event';
import { renderWithProviders, screen } from '../../test-utils';
import { Button, Shell } from '../../../src/components/index';

describe('Shell.Trigger asChild', () => {
  it('renders one button with the trigger behaviour and ARIA', async () => {
    renderWithProviders(
      <Shell.Root>
        <Shell.Header>
          <Shell.Trigger target="inspector" asChild>
            <Button iconOnly aria-label="Toggle inspector">
              <svg />
            </Button>
          </Shell.Trigger>
        </Shell.Header>
        <Shell.Content>content</Shell.Content>
        <Shell.Inspector id="insp" presentation="fixed" defaultOpen>
          inspector
        </Shell.Inspector>
      </Shell.Root>,
    );

    const buttons = screen.getAllByRole('button', { name: 'Toggle inspector' });
    expect(buttons).toHaveLength(1);
    const trigger = buttons[0];
    expect(trigger.querySelector('button')).toBeNull();
    expect(trigger).toHaveClass('kui-Button');
    expect(trigger).toHaveAttribute('type', 'button');
    expect(trigger).toHaveAttribute('data-shell-trigger', 'inspector');
    expect(trigger).toHaveAttribute('aria-controls', 'insp');
    expect(trigger).toHaveAttribute('aria-expanded', 'true');

    await userEvent.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    await userEvent.click(trigger);
    expect(trigger).toHaveAttribute('aria-expanded', 'true');
  });
});
