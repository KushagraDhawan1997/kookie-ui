import { afterEach, describe, expect, it } from 'vitest';

import { releaseBodyPointerEvents } from '../../src/hooks/use-body-pointer-events-cleanup';

/**
 * A dialog that closes clears the `pointer-events: none` Radix can leave on the body. It used to
 * clear it unconditionally, which unlocked the page behind any other dialog that was still open.
 */
describe('releaseBodyPointerEvents', () => {
  afterEach(() => {
    document.body.style.pointerEvents = '';
    document.body.innerHTML = '';
  });

  it('clears the value when no dialog is open', () => {
    document.body.style.pointerEvents = 'none';
    releaseBodyPointerEvents();
    expect(document.body.style.pointerEvents).toBe('');
  });

  it('clears the value when the only dialog in the page is the one closing', () => {
    document.body.innerHTML = '<div role="dialog" data-state="closed"></div>';
    document.body.style.pointerEvents = 'none';
    releaseBodyPointerEvents();
    expect(document.body.style.pointerEvents).toBe('');
  });

  it('leaves the value while another dialog is open', () => {
    document.body.innerHTML = '<div role="dialog" data-state="open"></div>';
    document.body.style.pointerEvents = 'none';
    releaseBodyPointerEvents();
    expect(document.body.style.pointerEvents).toBe('none');
  });

  it('leaves the value while an alert dialog is open', () => {
    document.body.innerHTML = '<div role="alertdialog" data-state="open"></div>';
    document.body.style.pointerEvents = 'none';
    releaseBodyPointerEvents();
    expect(document.body.style.pointerEvents).toBe('none');
  });
});
