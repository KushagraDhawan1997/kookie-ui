import * as React from 'react';
import { describe, expect, it } from 'vitest';
import { renderWithProviders, screen } from '../../test-utils';
import { Avatar } from '../../../src/components/index';

describe('Avatar status dot', () => {
  it('is named by statusLabel', () => {
    renderWithProviders(<Avatar fallback="MK" status="green" statusLabel="Online" />);
    const dot = screen.getByRole('img', { name: 'Online' });
    expect(dot).toHaveClass('kui-AvatarStatus');
  });

  it('is hidden from screen readers without a label', () => {
    const { container } = renderWithProviders(<Avatar fallback="MK" status="green" />);
    expect(container.querySelector('.kui-AvatarStatus')).toHaveAttribute('aria-hidden', 'true');
  });
});
