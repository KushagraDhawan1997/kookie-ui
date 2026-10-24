import * as React from 'react';
import { describe, expect, it } from 'vitest';
import { renderWithProviders, screen } from '../../test-utils';
import { Button, Toggle } from '../../../src/components/index';

const Icon = () => <svg data-testid="icon" />;

describe('Button done', () => {
  it('shows a tick in place of the leading icon, and the icon comes back', () => {
    const { rerender } = renderWithProviders(
      <Button>
        <Icon />
        Copy
      </Button>,
    );
    const button = screen.getByRole('button', { name: 'Copy' });
    expect(button).toHaveAttribute('data-icon-start', 'true');

    rerender(
      <Button done>
        <Icon />
        Copied
      </Button>,
    );
    expect(button).toHaveAttribute('data-done', 'true');
    expect(screen.queryByTestId('icon')).toBeNull();
    const tick = button.querySelector('.kui-BaseButtonTick');
    expect(tick).not.toBeNull();
    expect(tick).toHaveAttribute('aria-hidden', 'true');
    expect(button.firstElementChild).toBe(tick);
    expect(button).toHaveAccessibleName('Copied');
    // Same box: the start edge still reads as an icon, so the padding does not change.
    expect(button).toHaveAttribute('data-icon-start', 'true');

    rerender(
      <Button>
        <Icon />
        Copy
      </Button>,
    );
    expect(button).not.toHaveAttribute('data-done');
    expect(button.querySelector('.kui-BaseButtonTick')).toBeNull();
    expect(screen.getByTestId('icon')).toBeInTheDocument();
  });

  it('replaces the content of an icon-only button', () => {
    renderWithProviders(
      <Button iconOnly aria-label="Copied" done>
        <Icon />
      </Button>,
    );
    const button = screen.getByRole('button', { name: 'Copied' });
    expect(screen.queryByTestId('icon')).toBeNull();
    expect(button.children).toHaveLength(1);
    expect(button.firstElementChild).toHaveClass('kui-BaseButtonTick');
  });

  it('puts the tick before a label with no icon, and does not block the press', async () => {
    let presses = 0;
    renderWithProviders(
      <Button done onClick={() => presses++}>
        Copied
      </Button>,
    );
    const button = screen.getByRole('button', { name: 'Copied' });
    expect(button.firstElementChild).toHaveClass('kui-BaseButtonTick');
    expect(button).toHaveTextContent('Copied');
    expect(button).not.toHaveAttribute('aria-disabled');
    button.click();
    expect(presses).toBe(1);
  });

  it('Toggle drops done', () => {
    const props = { done: true } as unknown as Record<string, never>;
    renderWithProviders(
      <Toggle iconOnly aria-label="Bold" {...props}>
        <Icon />
      </Toggle>,
    );
    const toggle = screen.getByRole('button', { name: 'Bold' });
    expect(toggle).not.toHaveAttribute('data-done');
    expect(screen.getByTestId('icon')).toBeInTheDocument();
  });
});
