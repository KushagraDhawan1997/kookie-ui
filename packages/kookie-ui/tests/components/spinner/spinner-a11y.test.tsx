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

// Starting or stopping `loading` must not remount the children: a remount drops their state,
// focus and refs, as a field inside a loading region would show.
describe('Spinner with children', () => {
  it('keeps the same children, and their focus, as loading starts and stops', () => {
    const view = (loading: boolean) => (
      <Spinner loading={loading}>
        <input aria-label="Name" defaultValue="" />
      </Spinner>
    );
    const { rerender, container } = renderWithProviders(view(false));
    const input = screen.getByRole('textbox') as HTMLInputElement;
    input.focus();
    input.value = 'Ada';

    rerender(view(true));
    expect(screen.getByRole('textbox', { hidden: true })).toBe(input);
    expect(input.value).toBe('Ada');
    expect(container.querySelector('.kui-SpinnerHost')).toHaveAttribute('aria-busy', 'true');
    expect(container.querySelector('.kui-Spinner')).not.toBeNull();

    rerender(view(false));
    expect(screen.getByRole('textbox')).toBe(input);
    expect(document.activeElement).toBe(input);
    expect(container.querySelector('.kui-Spinner')).toBeNull();
    expect(container.querySelector('.kui-SpinnerHost')).not.toHaveAttribute('aria-busy');
  });
});
