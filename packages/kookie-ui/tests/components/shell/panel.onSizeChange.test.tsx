import * as React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { renderWithProviders, screen } from '../../test-utils';
import { fireEvent } from '@testing-library/react';
import { Shell } from '../../../src/components/index';

function App({
  onSizeChange,
  min = 120,
  max = 300,
  sizeUpdate,
  sizeUpdateMs,
}: {
  onSizeChange?: (size: number, meta: { reason: string }) => void;
  min?: number;
  max?: number;
  sizeUpdate?: 'throttle' | 'debounce';
  sizeUpdateMs?: number;
}) {
  return (
    <Shell.Root>
      <Shell.Rail presentation="fixed" />
      <Shell.Panel resizable expandedSize={200} minSize={min} maxSize={max} defaultOpen onSizeChange={onSizeChange} sizeUpdate={sizeUpdate} sizeUpdateMs={sizeUpdateMs}>
        panel
        <Shell.Panel.Handle />
      </Shell.Panel>
      <Shell.Content>content</Shell.Content>
    </Shell.Root>
  );
}

describe('Panel onSizeChange', () => {
  it('emits px on drag end (reason=resize)', () => {
    const spy = vi.fn();
    renderWithProviders(<App onSizeChange={spy} />);
    const handle = screen.getByRole('separator');
    // Start drag
    fireEvent.pointerDown(handle, { pointerId: 1, clientX: 0 });
    fireEvent.pointerMove(window, { clientX: 250 });
    fireEvent.pointerUp(window);
    expect(spy).toHaveBeenCalled();
    const [size, meta] = spy.mock.calls.at(-1)!;
    expect(typeof size).toBe('number');
    expect(meta).toEqual({ reason: 'resize' });
  });

  it('Arrow/Home/End adjust and emit onSizeChange at end of key action', () => {
    const spy = vi.fn();
    renderWithProviders(<App onSizeChange={spy} min={120} max={300} />);
    const handle = screen.getByRole('separator');
    // End -> max
    fireEvent.keyDown(handle, { key: 'End' });
    fireEvent.keyUp(handle, { key: 'End' });
    expect(spy).toHaveBeenCalled();
    let [size, meta] = spy.mock.calls.at(-1)!;
    expect(meta).toEqual({ reason: 'resize' });
    expect(size).toBe(300);
    // Home -> min
    fireEvent.keyDown(handle, { key: 'Home' });
    fireEvent.keyUp(handle, { key: 'Home' });
    [size, meta] = spy.mock.calls.at(-1)!;
    expect(meta).toEqual({ reason: 'resize' });
    expect(size).toBe(120);
  });

  it('throttle: rate-limits key presses but still delivers the final size', () => {
    vi.useFakeTimers();
    const spy = vi.fn();
    renderWithProviders(<App onSizeChange={spy} sizeUpdate="throttle" sizeUpdateMs={50} />);
    const handle = screen.getByRole('separator');

    // Leading edge: the first press is reported immediately.
    fireEvent.keyDown(handle, { key: 'End' });
    fireEvent.keyUp(handle, { key: 'End' });
    const afterFirst = spy.mock.calls.length;
    expect(afterFirst).toBe(1);
    expect(spy.mock.calls.at(-1)![0]).toBe(300);

    // A second press inside the window is held back...
    fireEvent.keyDown(handle, { key: 'Home' });
    fireEvent.keyUp(handle, { key: 'Home' });
    expect(spy.mock.calls.length).toBe(afterFirst);

    // ...and delivered on the trailing edge, so the final size is never dropped.
    vi.advanceTimersByTime(50);
    expect(spy.mock.calls.length).toBe(afterFirst + 1);
    expect(spy.mock.calls.at(-1)![0]).toBe(120);
    expect(spy.mock.calls.at(-1)![1]).toEqual({ reason: 'resize' });
    vi.useRealTimers();
  });
});
