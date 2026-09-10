import * as React from 'react';
import { act, render } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { useBodyPointerEventsCleanup } from '../../src/hooks/use-body-pointer-events-cleanup.js';

function Probe() {
  useBodyPointerEventsCleanup();
  return <div data-testid="probe" />;
}

describe('useBodyPointerEventsCleanup', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
    document.body.style.pointerEvents = '';
  });

  /**
   * The hook defers its cleanups through timers. Any that outlive the effect
   * fire against a document that may already be gone - under vitest that lands
   * as an unhandled ReferenceError blamed on an unrelated test file, which is
   * how this first showed up.
   */
  test('leaves no timer pending after unmount', () => {
    const view = render(<Probe />);

    // The mount path queues its own initial safeCleanup, so there is real work
    // outstanding to lose track of.
    expect(vi.getTimerCount()).toBeGreaterThan(0);

    view.unmount();

    expect(vi.getTimerCount()).toBe(0);
  });

  test('stops observing the document after unmount', async () => {
    const view = render(<Probe />);
    view.unmount();

    const pendingAfterUnmount = vi.getTimerCount();

    // Delivery is a microtask, so the mutation only reaches the observer once
    // the queue drains - hence the async act. A still-connected observer would
    // queue another deferred cleanup on top of whatever was already pending.
    await act(async () => {
      document.body.appendChild(document.createElement('div'));
    });

    expect(vi.getTimerCount()).toBe(pendingAfterUnmount);
  });

  test('reinstalls after a full unmount', () => {
    render(<Probe />).unmount();

    const view = render(<Probe />);

    // A latch that never released would leave the second mount inert.
    expect(vi.getTimerCount()).toBeGreaterThan(0);
    view.unmount();
  });
});
