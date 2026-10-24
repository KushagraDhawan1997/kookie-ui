import * as React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render } from '@testing-library/react';
import { AlertDialog, Dialog, Theme } from '../../../src/components/index';

const wait = (ms: number) => act(() => new Promise((resolve) => setTimeout(resolve, ms)));

function ClosedDialog() {
  return (
    <Dialog.Root>
      <Dialog.Content aria-describedby={undefined}>
        <Dialog.Title>Closed</Dialog.Title>
      </Dialog.Content>
    </Dialog.Root>
  );
}

// A closed dialog's focus scope restores focus, and resets pointer-events, on a zero-delay timer.
// Let the previous test's timer run before this test sets up its own state.
beforeEach(async () => {
  await new Promise((resolve) => setTimeout(resolve, 20));
  document.body.style.pointerEvents = '';
});

afterEach(() => {
  vi.unstubAllEnvs();
  document.body.style.pointerEvents = '';
  document.body.removeAttribute('data-scroll-locked');
});

describe('useBodyPointerEventsCleanup', () => {
  it('keeps working for the overlays still mounted when the first one unmounts', async () => {
    const first = render(<Theme><ClosedDialog /></Theme>);
    render(<Theme><ClosedDialog /></Theme>);
    first.unmount();

    document.body.style.pointerEvents = 'none';
    fireEvent.pointerUp(document.body);
    await wait(120);
    expect(document.body.style.pointerEvents).toBe('');
  });

  it('Escape does not unblock the page or drop the scroll lock under an open dialog', async () => {
    render(
      <Theme>
        <Dialog.Root open onOpenChange={() => {}}>
          <Dialog.Content aria-describedby={undefined}>
            <Dialog.Title>Open</Dialog.Title>
          </Dialog.Content>
        </Dialog.Root>
      </Theme>,
    );
    document.body.style.pointerEvents = 'none';
    document.body.setAttribute('data-scroll-locked', '1');

    fireEvent.keyDown(document.activeElement ?? document.body, { key: 'Escape' });
    await wait(300);

    expect(document.querySelector('[role="dialog"]')).not.toBeNull();
    expect(document.body.style.pointerEvents).toBe('none');
    expect(document.body.getAttribute('data-scroll-locked')).toBe('1');
  });

  it('an outside click does not unblock the page under an open dialog', async () => {
    render(
      <Theme>
        <button data-testid="outside">Outside</button>
        <Dialog.Root open onOpenChange={() => {}}>
          <Dialog.Content aria-describedby={undefined}>
            <Dialog.Title>Open</Dialog.Title>
          </Dialog.Content>
        </Dialog.Root>
      </Theme>,
    );
    document.body.style.pointerEvents = 'none';
    fireEvent.click(document.querySelector('[data-testid="outside"]')!);
    await wait(200);
    expect(document.body.style.pointerEvents).toBe('none');
  });

  it('an open accordion-style data-state does not keep a stuck page blocked', async () => {
    render(
      <Theme>
        <div data-state="open">Expanded section</div>
        <ClosedDialog />
      </Theme>,
    );
    document.body.style.pointerEvents = 'none';
    fireEvent.pointerUp(document.body);
    await wait(120);
    expect(document.body.style.pointerEvents).toBe('');
  });

  it('does not queue work for DOM changes while the page is not blocked', async () => {
    render(<Theme><ClosedDialog /></Theme>);
    const host = document.createElement('div');
    document.body.appendChild(host);
    await wait(150);

    const spy = vi.spyOn(globalThis, 'setTimeout');
    const deep = document.createElement('div');
    host.appendChild(deep);
    deep.setAttribute('data-x', '1');
    await Promise.resolve();
    expect(spy).not.toHaveBeenCalled();
    host.remove();
  });

  it('does not log in production', async () => {
    vi.stubEnv('NODE_ENV', 'production');
    const log = vi.spyOn(console, 'log').mockImplementation(() => {});
    render(<Theme><ClosedDialog /></Theme>);
    document.body.style.pointerEvents = 'none';
    fireEvent.pointerUp(document.body);
    await wait(120);
    expect(document.body.style.pointerEvents).toBe('');
    expect(log).not.toHaveBeenCalled();
  });

  it('AlertDialog installs the same fallback', async () => {
    render(
      <Theme>
        <AlertDialog.Root>
          <AlertDialog.Content aria-describedby={undefined}>
            <AlertDialog.Title>Closed</AlertDialog.Title>
          </AlertDialog.Content>
        </AlertDialog.Root>
      </Theme>,
    );
    document.body.style.pointerEvents = 'none';
    fireEvent.pointerUp(document.body);
    await wait(120);
    expect(document.body.style.pointerEvents).toBe('');
  });
});
