import * as React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { fireEvent } from '@testing-library/react';

import { renderWithProviders, screen } from '../test-utils';
import { Shell } from '../../src/components/index';

function App({ onResize, onResizeEnd }: { onResize?: (size: number) => void; onResizeEnd?: (size: number) => void }) {
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

const panelSize = () => Number.parseFloat((document.querySelector('.rt-ShellPanel') as HTMLElement).style.getPropertyValue('--panel-size'));

/**
 * Dragging a resize handle is the most latency-sensitive interaction the
 * shell has. A move writes the size variable on the pane and nothing else;
 * `onResize` is called at most once per animation frame, with the latest
 * size, and once more when the drag ends so the final size is never lost.
 */
describe('pane resize drag', () => {
  afterEach(() => {
    vi.useRealTimers();
  });

  it('writes the size on every move and calls onResize once per frame with the latest size', () => {
    vi.useFakeTimers({ toFake: ['requestAnimationFrame', 'cancelAnimationFrame'] });
    const onResize = vi.fn();
    renderWithProviders(<App onResize={onResize} />);
    const handle = screen.getByRole('separator');

    fireEvent.pointerDown(handle, { pointerId: 1, clientX: 100 });
    fireEvent.pointerMove(window, { clientX: 110 });
    expect(panelSize()).toBe(210);
    fireEvent.pointerMove(window, { clientX: 120 });
    expect(panelSize()).toBe(220);
    expect(onResize).not.toHaveBeenCalled();

    vi.advanceTimersToNextFrame();
    expect(onResize).toHaveBeenCalledTimes(1);
    expect(onResize).toHaveBeenLastCalledWith(220);

    fireEvent.pointerMove(window, { clientX: 130 });
    vi.advanceTimersToNextFrame();
    expect(onResize).toHaveBeenCalledTimes(2);
    expect(onResize).toHaveBeenLastCalledWith(230);

    fireEvent.pointerUp(window);
  });

  it('delivers the last size when the drag ends before the frame', () => {
    vi.useFakeTimers({ toFake: ['requestAnimationFrame', 'cancelAnimationFrame'] });
    const onResize = vi.fn();
    renderWithProviders(<App onResize={onResize} />);
    const handle = screen.getByRole('separator');

    fireEvent.pointerDown(handle, { pointerId: 1, clientX: 100 });
    fireEvent.pointerMove(window, { clientX: 140 });
    fireEvent.pointerUp(window);

    expect(onResize).toHaveBeenCalledTimes(1);
    expect(onResize).toHaveBeenLastCalledWith(240);

    // Nothing is left scheduled.
    vi.advanceTimersToNextFrame();
    expect(onResize).toHaveBeenCalledTimes(1);
  });

  it('does not double-handle a move dispatched at the handle itself', () => {
    vi.useFakeTimers({ toFake: ['requestAnimationFrame', 'cancelAnimationFrame'] });
    const onResize = vi.fn();
    renderWithProviders(<App onResize={onResize} />);
    const handle = screen.getByRole('separator');

    fireEvent.pointerDown(handle, { pointerId: 1, clientX: 100 });
    // With pointer capture set, real browsers retarget moves to the handle,
    // and the same move then reaches the document and the window. Only the
    // first copy may do any work: one write of the size per move.
    const writes = vi.spyOn(CSSStyleDeclaration.prototype, 'setProperty');
    fireEvent.pointerMove(handle, { clientX: 150 });
    expect(writes.mock.calls.filter(([name]) => name === '--panel-size')).toHaveLength(1);
    writes.mockRestore();
    vi.advanceTimersToNextFrame();

    expect(onResize).toHaveBeenCalledTimes(1);
    expect(onResize).toHaveBeenLastCalledWith(250);

    fireEvent.pointerUp(window);
  });

  it('ends the drag exactly once', () => {
    const onResizeEnd = vi.fn();
    renderWithProviders(<App onResizeEnd={onResizeEnd} />);
    const handle = screen.getByRole('separator');

    fireEvent.pointerDown(handle, { pointerId: 1, clientX: 100 });
    fireEvent.pointerMove(window, { clientX: 150 });
    fireEvent.pointerUp(window);
    fireEvent.pointerUp(document);

    expect(onResizeEnd).toHaveBeenCalledTimes(1);
    expect(onResizeEnd).toHaveBeenLastCalledWith(250);
  });

  it('stops responding to moves after the drag has ended', () => {
    const onResize = vi.fn();
    renderWithProviders(<App onResize={onResize} />);
    const handle = screen.getByRole('separator');

    fireEvent.pointerDown(handle, { pointerId: 1, clientX: 100 });
    fireEvent.pointerUp(window);
    onResize.mockClear();

    fireEvent.pointerMove(window, { clientX: 180 });
    expect(onResize).not.toHaveBeenCalled();
    expect(panelSize()).toBe(200);
  });

  // Reading the text direction inside every move forced a style
  // recalculation right after the previous move had written the size. The
  // direction is read once when the drag starts.
  it('reads no computed style while the pointer moves', () => {
    renderWithProviders(<App />);
    const handle = screen.getByRole('separator');

    fireEvent.pointerDown(handle, { pointerId: 1, clientX: 100 });
    const spy = vi.spyOn(window, 'getComputedStyle');
    try {
      for (let x = 110; x <= 190; x += 10) fireEvent.pointerMove(window, { clientX: x });
      expect(spy).not.toHaveBeenCalled();
    } finally {
      spy.mockRestore();
      fireEvent.pointerUp(window);
    }
  });
});
