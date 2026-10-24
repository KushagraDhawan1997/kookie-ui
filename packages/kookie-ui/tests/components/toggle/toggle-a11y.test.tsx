import * as React from 'react';
import { describe, expect, it } from 'vitest';
import { fireEvent, renderWithProviders, screen } from '../../test-utils';
import { Toggle } from '../../../src/components/index';

describe('Toggle', () => {
  it('announces its state through aria-pressed only, with no second live announcement', () => {
    renderWithProviders(<Toggle>Bold</Toggle>);
    const button = screen.getByRole('button', { name: 'Bold' });
    expect(button).toHaveAttribute('aria-pressed', 'false');
    fireEvent.click(button);
    expect(button).toHaveAttribute('aria-pressed', 'true');
    expect(document.getElementById('kui-live-announcer')).toBeNull();
    expect(document.querySelector('[aria-live]')).toBeNull();
  });

  it('still calls onPressedChange with the new state', () => {
    const changes: boolean[] = [];
    renderWithProviders(<Toggle onPressedChange={(p) => changes.push(p)}>Bold</Toggle>);
    const button = screen.getByRole('button', { name: 'Bold' });
    fireEvent.click(button);
    fireEvent.click(button);
    expect(changes).toEqual([true, false]);
  });
});
