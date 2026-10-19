import * as React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { renderWithProviders, screen } from '../../test-utils';
import { Button, IconButton, ToggleButton, ToggleIconButton } from '../../../src/components/index';

describe('icon-only buttons', () => {
  it('Button iconOnly renders the icon button', () => {
    renderWithProviders(<Button iconOnly aria-label="Add">+</Button>);
    const button = screen.getByRole('button', { name: 'Add' });
    expect(button).toHaveClass('rt-IconButton');
    expect(button).not.toHaveClass('rt-Button');
  });

  it('IconButton is Button with iconOnly', () => {
    renderWithProviders(
      <>
        <IconButton aria-label="One">+</IconButton>
        <Button iconOnly aria-label="Two">+</Button>
      </>,
    );
    expect(screen.getByRole('button', { name: 'One' }).className).toBe(screen.getByRole('button', { name: 'Two' }).className);
  });

  it('ToggleIconButton is ToggleButton with iconOnly', () => {
    renderWithProviders(
      <>
        <ToggleIconButton aria-label="One">+</ToggleIconButton>
        <ToggleButton iconOnly aria-label="Two">+</ToggleButton>
      </>,
    );
    const one = screen.getByRole('button', { name: 'One' });
    const two = screen.getByRole('button', { name: 'Two' });
    expect(one.className).toBe(two.className);
    expect(one).toHaveAttribute('aria-pressed', 'false');
  });

  it('an icon-only button never takes the full width', () => {
    renderWithProviders(
      <Button iconOnly aria-label="Wide" fullWidth>
        +
      </Button>,
    );
    expect(screen.getByRole('button', { name: 'Wide' })).not.toHaveClass('rt-full-width');
  });
});
