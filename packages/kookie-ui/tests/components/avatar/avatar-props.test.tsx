import * as React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, renderWithProviders, screen } from '../../test-utils';
import { Avatar } from '../../../src/components/index';

describe('Avatar props', () => {
  it('puts id, aria, title, data and handlers on the root when there is no picture', () => {
    const onClick = vi.fn();
    const { container } = renderWithProviders(
      <Avatar fallback="AB" id="av" aria-describedby="note" title="Ana" data-testid="av" onClick={onClick} />,
    );
    const root = container.querySelector('.kui-AvatarRoot')!;
    expect(document.getElementById('av')).toBe(root);
    expect(root).toHaveAttribute('aria-describedby', 'note');
    expect(root).toHaveAttribute('title', 'Ana');
    expect(screen.getByTestId('av')).toBe(root);
    fireEvent.click(root);
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});

describe('Avatar fallback', () => {
  it('renders in the same commit as the error, with no empty box', () => {
    const { container } = renderWithProviders(<Avatar fallback="AB" />);
    expect(container.querySelector('.kui-AvatarFallback')).toHaveTextContent('AB');
  });

  it('is named from alt', () => {
    renderWithProviders(<Avatar fallback="AB" alt="Ana Bell" />);
    expect(screen.getByRole('img', { name: 'Ana Bell' })).toHaveClass('kui-AvatarFallback');
  });

  it('is hidden from screen readers without alt', () => {
    const { container } = renderWithProviders(<Avatar fallback="AB" />);
    expect(container.querySelector('.kui-AvatarFallback')).toHaveAttribute('aria-hidden', 'true');
  });
});
