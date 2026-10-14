import * as React from 'react';
import { afterAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { renderWithProviders, screen } from '../../test-utils';
import { fireEvent } from '@testing-library/react';
import { Shell } from '../../../src/components/index';
import { installViewport } from '../../helpers/viewport';

const viewport = installViewport(0);
afterAll(() => viewport.restore());
beforeEach(() => viewport.setWidth(0));

function Counter({ onMount }: { onMount: () => void }) {
  const [count, setCount] = React.useState(0);
  React.useEffect(onMount, [onMount]);
  return (
    <button type="button" onClick={() => setCount((c) => c + 1)}>
      count {count}
    </button>
  );
}

/**
 * Since 0.8.0 a pane is one element at every width. Crossing into or out of
 * the overlay posture changes attributes on that element; it does not swap in
 * a Sheet, so the pane's children keep their state and nothing remounts.
 */
describe('a pane keeps its element across a breakpoint', () => {
  it('is the same element, with the same children, overlay or not', () => {
    const onMount = vi.fn();
    renderWithProviders(
      <Shell.Root>
        <Shell.Content>content</Shell.Content>
        <Shell.Inspector defaultOpen>
          <Counter onMount={onMount} />
          <input aria-label="note" />
        </Shell.Inspector>
      </Shell.Root>,
    );

    const before = document.querySelector('.rt-ShellInspector');
    expect(before?.getAttribute('data-presentation')).toBe('overlay');
    fireEvent.click(screen.getByRole('button', { name: 'count 0' }));
    fireEvent.change(screen.getByRole('textbox', { name: 'note' }), { target: { value: 'kept' } });

    viewport.setWidth(1100);
    const after = document.querySelector('.rt-ShellInspector');
    expect(after).toBe(before);
    expect(after?.getAttribute('data-presentation')).toBe('fixed');

    viewport.setWidth(300);
    expect(document.querySelector('.rt-ShellInspector')).toBe(before);
    expect(screen.getByRole('button', { name: 'count 1' })).toBeTruthy();
    expect((screen.getByRole('textbox', { name: 'note' }) as HTMLInputElement).value).toBe('kept');
    expect(onMount).toHaveBeenCalledTimes(1);
  });
});
