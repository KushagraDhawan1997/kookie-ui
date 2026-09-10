import * as React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent } from '@testing-library/react';

import { renderWithProviders, screen } from '../test-utils';
import { Shell } from '../../src/components/index';

function App({ onResize, onResizeEnd }: { onResize?: (size: number) => void; onResizeEnd?: () => void }) {
  return (
    <Shell.Root>
      <Shell.Rail presentation="fixed" />
      <Shell.Panel resizable expandedSize={200} minSize={120} maxSize={300} defaultOpen onResize={onResize} onResizeEnd={onResizeEnd}>
        panel
        <Shell.Panel.Handle />
      </Shell.Panel>
      <Shell.Content>content</Shell.Content>
    </Shell.Root>
  );
}

/**
 * Dragging a resize handle is the most latency-sensitive interaction the shell
 * has: the work runs on every pointer move. The handler used to be attached to
 * the handle, the document and the window at once, so a single move ran it
 * three times over — three style writes, three attribute writes and three
 * callbacks per frame.
 */
describe('pane resize drag', () => {
  it('runs the resize handler once per pointer move', () => {
    const onResize = vi.fn();
    renderWithProviders(<App onResize={onResize} />);
    const slider = screen.getByRole('slider');

    fireEvent.pointerDown(slider, { pointerId: 1, clientX: 0 });
    fireEvent.pointerMove(window, { clientX: 250 });

    expect(onResize).toHaveBeenCalledTimes(1);

    fireEvent.pointerMove(window, { clientX: 260 });
    expect(onResize).toHaveBeenCalledTimes(2);

    fireEvent.pointerUp(window);
  });

  it('does not double-handle a move dispatched at the handle itself', () => {
    const onResize = vi.fn();
    renderWithProviders(<App onResize={onResize} />);
    const slider = screen.getByRole('slider');

    fireEvent.pointerDown(slider, { pointerId: 1, clientX: 0 });
    // With pointer capture set, real browsers retarget moves to the handle.
    fireEvent.pointerMove(slider, { clientX: 250 });

    expect(onResize).toHaveBeenCalledTimes(1);

    fireEvent.pointerUp(window);
  });

  it('ends the drag exactly once', () => {
    const onResizeEnd = vi.fn();
    renderWithProviders(<App onResizeEnd={onResizeEnd} />);
    const slider = screen.getByRole('slider');

    fireEvent.pointerDown(slider, { pointerId: 1, clientX: 0 });
    fireEvent.pointerMove(window, { clientX: 250 });
    fireEvent.pointerUp(window);

    expect(onResizeEnd).toHaveBeenCalledTimes(1);
  });

  it('stops responding to moves after the drag has ended', () => {
    const onResize = vi.fn();
    renderWithProviders(<App onResize={onResize} />);
    const slider = screen.getByRole('slider');

    fireEvent.pointerDown(slider, { pointerId: 1, clientX: 0 });
    fireEvent.pointerUp(window);
    onResize.mockClear();

    fireEvent.pointerMove(window, { clientX: 280 });
    expect(onResize).not.toHaveBeenCalled();
  });
});
