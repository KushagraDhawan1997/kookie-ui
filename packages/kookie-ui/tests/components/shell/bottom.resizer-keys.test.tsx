import * as React from 'react';
import { describe, it, expect } from 'vitest';
import { renderWithProviders, screen } from '../../test-utils';
import { fireEvent } from '@testing-library/react';
import { Shell } from '../../../src/components/index';

// Bottom's handle sits on its top edge, so dragging up grows it. The keys
// used to run the other way: ArrowUp shrank the pane.
describe('Bottom resizer keys', () => {
  it('ArrowUp grows the pane and ArrowDown shrinks it, matching the drag', () => {
    renderWithProviders(
      <Shell.Root>
        <Shell.Content>content</Shell.Content>
        <Shell.Bottom presentation="fixed" defaultOpen resizable expandedSize={200} minSize={100} maxSize={400}>
          bottom
        </Shell.Bottom>
      </Shell.Root>,
    );

    const handle = screen.getByRole('separator');
    const pane = handle.parentElement as HTMLElement;
    const size = () => parseFloat(getComputedStyle(pane).getPropertyValue('--bottom-size'));

    const before = size();
    expect(before).toBe(200);

    fireEvent.keyDown(handle, { key: 'ArrowUp' });
    const afterUp = size();
    expect(afterUp).toBeGreaterThan(before);

    fireEvent.keyDown(handle, { key: 'ArrowDown' });
    expect(size()).toBeLessThan(afterUp);
  });
});
