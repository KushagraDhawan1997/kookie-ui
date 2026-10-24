import * as React from 'react';
import { describe, expect, it } from 'vitest';
import { renderWithProviders, screen } from '../../test-utils';
import { Spinner } from '../../../src/components/index';

describe('Spinner semantics', () => {
  it('an unnamed spinner is hidden from screen readers', () => {
    const { container } = renderWithProviders(<Spinner />);
    expect(container.querySelector('.kui-Spinner')).toHaveAttribute('aria-hidden', 'true');
  });

  it('a named spinner is a status with that name', () => {
    renderWithProviders(<Spinner aria-label="Loading comments" />);
    const status = screen.getByRole('status', { name: 'Loading comments' });
    expect(status).not.toHaveAttribute('aria-hidden');
  });

  it('a named spinner carries its name as text, which a live region reads', () => {
    renderWithProviders(<Spinner aria-label="Loading comments" />);
    expect(screen.getByRole('status')).toHaveTextContent('Loading comments');
  });

  it('marks the wrapped content busy while it loads', () => {
    const { container, rerender } = renderWithProviders(
      <Spinner loading>
        <span>42</span>
      </Spinner>,
    );
    const wrapper = container.querySelector('.kui-SpinnerHiddenChildren')!.parentElement!;
    expect(wrapper).toHaveAttribute('aria-busy', 'true');
    rerender(
      <Spinner loading={false}>
        <span>42</span>
      </Spinner>,
    );
    expect(container.querySelector('[aria-busy]')).toBeNull();
  });
});
