import * as React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { renderWithProviders, screen } from '../../test-utils';
import * as Kookie from '../../../src/components/index';
import { Button, Toggle } from '../../../src/components/index';

describe('icon-only buttons', () => {
  it('Button iconOnly is a Button marked icon-only', () => {
    renderWithProviders(<Button iconOnly aria-label="Add">+</Button>);
    const button = screen.getByRole('button', { name: 'Add' });
    expect(button).toHaveClass('rt-Button');
    expect(button).toHaveAttribute('data-icon-only', 'true');
  });

  it('a labelled Button is not marked icon-only', () => {
    renderWithProviders(<Button>Add</Button>);
    expect(screen.getByRole('button', { name: 'Add' })).not.toHaveAttribute('data-icon-only');
  });

  it('Toggle iconOnly is an icon-only Toggle', () => {
    renderWithProviders(
      <>
        <Toggle iconOnly aria-label="One">+</Toggle>
        <Toggle aria-label="Two">+</Toggle>
      </>,
    );
    const one = screen.getByRole('button', { name: 'One' });
    expect(one).toHaveAttribute('data-icon-only', 'true');
    expect(one).toHaveAttribute('aria-pressed', 'false');
    expect(screen.getByRole('button', { name: 'Two' })).not.toHaveAttribute('data-icon-only');
  });

  it('an icon-only button never takes the full width', () => {
    // @ts-expect-error iconOnly excludes fullWidth
    renderWithProviders(<Button iconOnly aria-label="Wide" fullWidth>+</Button>);
    expect(screen.getByRole('button', { name: 'Wide' })).not.toHaveClass('rt-full-width');
  });

  it('a button has no flush mode: it never pulls itself out with a negative margin', () => {
    // @ts-expect-error flush is not a Button prop
    renderWithProviders(<Button variant="ghost" flush>Flush</Button>);
    const button = screen.getByRole('button', { name: 'Flush' });
    expect(button).not.toHaveAttribute('data-flush');
    expect(button.style.margin).toBe('');
  });

  it('an icon-only button needs an aria-label or aria-labelledby', () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {});
    // @ts-expect-error iconOnly requires an accessible name
    renderWithProviders(<Button iconOnly>+</Button>);
    expect(error.mock.calls.some(([message]) => /accessible name/.test(String(message)))).toBe(true);
    vi.restoreAllMocks();
  });

  it('IconButton, ToggleButton and ToggleIconButton are gone', () => {
    for (const name of ['IconButton', 'ToggleButton', 'ToggleIconButton']) expect(name in Kookie).toBe(false);
  });
});
