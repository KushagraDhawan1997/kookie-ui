import * as React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { renderWithProviders, screen } from '../../test-utils';
import { fireEvent } from '@testing-library/react';
import { Shell } from '../../../src/components/index';

function App({
  onSizeChange,
  min = 200,
  max = 500,
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
      <Shell.Panel>panel</Shell.Panel>
      <Shell.Content>content</Shell.Content>
      <Shell.Inspector presentation={{ initial: 'fixed' }} defaultOpen resizable minSize={min} maxSize={max} onSizeChange={onSizeChange} sizeUpdate={sizeUpdate} sizeUpdateMs={sizeUpdateMs}>
        inspector
        <Shell.Inspector.Handle />
      </Shell.Inspector>
    </Shell.Root>
  );
}

describe('Inspector onSizeChange', () => {
  it('emits px on boundary keys (Home/End), clamped to min/max', () => {
    const spy = vi.fn();
    renderWithProviders(<App onSizeChange={spy} min={200} max={500} />);
    const handle = screen.getByRole('separator');
    fireEvent.keyDown(handle, { key: 'End' });
    fireEvent.keyUp(handle, { key: 'End' });
    expect(spy).toHaveBeenCalled();
    let [size, meta] = spy.mock.calls.at(-1)!;
    expect(meta).toEqual({ reason: 'resize' });
    expect(size).toBe(500);
    fireEvent.keyDown(handle, { key: 'Home' });
    fireEvent.keyUp(handle, { key: 'Home' });
    [size, meta] = spy.mock.calls.at(-1)!;
    expect(meta).toEqual({ reason: 'resize' });
    expect(size).toBe(200);
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
    expect(spy.mock.calls.at(-1)![0]).toBe(500);

    // A second press inside the window is held back...
    fireEvent.keyDown(handle, { key: 'Home' });
    fireEvent.keyUp(handle, { key: 'Home' });
    expect(spy.mock.calls.length).toBe(afterFirst);

    // ...and delivered on the trailing edge, so the final size is never dropped.
    vi.advanceTimersByTime(50);
    expect(spy.mock.calls.length).toBe(afterFirst + 1);
    expect(spy.mock.calls.at(-1)![0]).toBe(200);
    expect(spy.mock.calls.at(-1)![1]).toEqual({ reason: 'resize' });
    vi.useRealTimers();
  });
});
