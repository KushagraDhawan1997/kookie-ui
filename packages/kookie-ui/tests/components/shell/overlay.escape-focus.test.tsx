import * as React from 'react';
import { afterAll, afterEach, beforeAll, describe, expect, it, vi } from 'vitest';
import { act, renderWithProviders, screen } from '../../test-utils';
import { fireEvent } from '@testing-library/react';
import { Shell } from '../../../src/components/index';

/*
 * jsdom does not implement `inert`. Browsers reflect the property to the
 * attribute; the same reflection is installed here for this file.
 */
beforeAll(() => {
  Object.defineProperty(HTMLElement.prototype, 'inert', {
    configurable: true,
    get(this: HTMLElement) {
      return this.hasAttribute('inert');
    },
    set(this: HTMLElement, value: boolean) {
      this.toggleAttribute('inert', Boolean(value));
    },
  });
});
afterAll(() => {
  delete (HTMLElement.prototype as { inert?: boolean }).inert;
});
afterEach(() => {
  vi.useRealTimers();
});

const q = (selector: string) => document.querySelector(selector) as HTMLElement;
const isInert = (el: Element) => el.hasAttribute('inert');

/**
 * At jsdom's width every Inspector and Sidebar is an overlay by default.
 */
describe('Escape inside an overlay pane', () => {
  it('a component that answers Escape itself keeps the pane open', () => {
    const own = vi.fn((event: React.KeyboardEvent) => {
      if (event.key === 'Escape') event.preventDefault();
    });
    renderWithProviders(
      <Shell.Root>
        <Shell.Content>content</Shell.Content>
        <Shell.Inspector defaultOpen>
          <input aria-label="search" onKeyDown={own} />
        </Shell.Inspector>
      </Shell.Root>,
    );

    fireEvent.keyDown(screen.getByRole('textbox', { name: 'search' }), { key: 'Escape' });

    expect(own).toHaveBeenCalledTimes(1);
    expect(q('.kui-ShellInspector').getAttribute('data-state')).toBe('open');
  });

  it('a component that stops the key keeps the pane open', () => {
    renderWithProviders(
      <Shell.Root>
        <Shell.Content>content</Shell.Content>
        <Shell.Inspector defaultOpen>
          <input aria-label="search" onKeyDown={(event) => event.key === 'Escape' && event.stopPropagation()} />
        </Shell.Inspector>
      </Shell.Root>,
    );

    fireEvent.keyDown(screen.getByRole('textbox', { name: 'search' }), { key: 'Escape' });
    expect(q('.kui-ShellInspector').getAttribute('data-state')).toBe('open');
  });

  it('with no handler of its own, Escape closes the pane', () => {
    renderWithProviders(
      <Shell.Root>
        <Shell.Content>content</Shell.Content>
        <Shell.Inspector defaultOpen>
          <input aria-label="search" />
        </Shell.Inspector>
      </Shell.Root>,
    );

    fireEvent.keyDown(screen.getByRole('textbox', { name: 'search' }), { key: 'Escape' });
    expect(q('.kui-ShellInspector').getAttribute('data-state')).toBe('closed');
  });

  it('with focus on the document, Escape still closes the overlay', () => {
    renderWithProviders(
      <Shell.Root>
        <Shell.Content>content</Shell.Content>
        <Shell.Inspector defaultOpen>inspector</Shell.Inspector>
      </Shell.Root>,
    );
    (document.activeElement as HTMLElement | null)?.blur();
    expect(document.activeElement).toBe(document.body);

    fireEvent.keyDown(document.body, { key: 'Escape' });
    expect(q('.kui-ShellInspector').getAttribute('data-state')).toBe('closed');
  });
});

describe('focus with more than one overlay', () => {
  it('closing one from inside it leaves focus in the one still open, and Escape closes that one', () => {
    function App() {
      const [inspector, setInspector] = React.useState(false);
      return (
        <Shell.Root>
          <Shell.Header>
            <Shell.Trigger target="sidebar">sidebar</Shell.Trigger>
          </Shell.Header>
          <Shell.Sidebar>
            <Shell.Trigger target="inspector">details</Shell.Trigger>
          </Shell.Sidebar>
          <Shell.Content>content</Shell.Content>
          <Shell.Inspector open={inspector} onOpenChange={setInspector}>
            <button type="button" onClick={() => setInspector(false)}>
              done
            </button>
          </Shell.Inspector>
        </Shell.Root>
      );
    }
    renderWithProviders(<App />);
    const sidebarTrigger = screen.getByRole('button', { name: 'sidebar' });
    sidebarTrigger.focus();
    fireEvent.click(sidebarTrigger);
    fireEvent.click(screen.getByRole('button', { name: 'details' }));
    const done = screen.getByRole('button', { name: 'done' });
    done.focus();

    fireEvent.click(done);

    expect(q('.kui-ShellInspector').getAttribute('data-state')).toBe('closed');
    // The Trigger that opened the Inspector, inside the Sidebar that stays open.
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'details' }));

    fireEvent.keyDown(document.activeElement as HTMLElement, { key: 'Escape' });
    expect(q('.kui-ShellSidebar').getAttribute('data-state')).toBe('closed');
  });
});

describe('focus taken away after an overlay opens or closes', () => {
  it('an overlay opened from outside the frame takes focus back if the opener drops it on the document', () => {
    vi.useFakeTimers({ toFake: ['requestAnimationFrame', 'cancelAnimationFrame'] });
    function App() {
      const [open, setOpen] = React.useState(false);
      return (
        <>
          {/* Stands in for a menu item in a portal, which is removed when its menu closes. */}
          <button type="button" data-testid="opener" onClick={() => setOpen(true)}>
            open
          </button>
          <Shell.Root>
            <Shell.Content>content</Shell.Content>
            <Shell.Inspector open={open} onOpenChange={setOpen}>
              inspector
            </Shell.Inspector>
          </Shell.Root>
        </>
      );
    }
    renderWithProviders(<App />);
    const opener = screen.getByTestId('opener');
    opener.focus();
    fireEvent.click(opener);
    expect(document.activeElement).toBe(q('.kui-ShellInspector'));

    // The menu restores focus to itself, then goes away.
    opener.focus();
    opener.remove();
    expect(document.activeElement).toBe(document.body);
    act(() => {
      vi.advanceTimersToNextFrame();
    });

    expect(document.activeElement).toBe(q('.kui-ShellInspector'));
  });

  it('closing from a layer outside the frame returns focus once that layer lets go', () => {
    vi.useFakeTimers({ toFake: ['requestAnimationFrame', 'cancelAnimationFrame'] });
    function App() {
      const [open, setOpen] = React.useState(false);
      return (
        <>
          <button type="button" data-testid="menu-item" onClick={() => setOpen(false)}>
            close
          </button>
          <Shell.Root>
            <Shell.Header>
              <Shell.Trigger target="inspector">inspector</Shell.Trigger>
            </Shell.Header>
            <Shell.Content>content</Shell.Content>
            <Shell.Inspector open={open} onOpenChange={setOpen}>
              inspector
            </Shell.Inspector>
          </Shell.Root>
        </>
      );
    }
    renderWithProviders(<App />);
    const trigger = screen.getByRole('button', { name: 'inspector' });
    trigger.focus();
    fireEvent.click(trigger);
    const item = screen.getByTestId('menu-item');
    item.focus();

    fireEvent.click(item);
    // Focus is still in the menu: nothing to do yet.
    expect(document.activeElement).toBe(item);
    item.remove();
    act(() => {
      vi.advanceTimersToNextFrame();
    });

    expect(document.activeElement).toBe(trigger);
  });
});

describe('containment keeps up with the frame', () => {
  it('a child that appears by its own state while an overlay is live is inerted', async () => {
    let show: () => void = () => {};
    function Banner() {
      const [shown, setShown] = React.useState(false);
      show = () => setShown(true);
      return shown ? <div data-testid="banner">banner</div> : null;
    }
    renderWithProviders(
      <Shell.Root>
        <Shell.Content>content</Shell.Content>
        <Banner />
        <Shell.Inspector defaultOpen>inspector</Shell.Inspector>
      </Shell.Root>,
    );
    expect(q('.kui-ShellRoot').hasAttribute('data-overlay-live')).toBe(true);

    await act(async () => {
      show();
    });

    expect(isInert(screen.getByTestId('banner'))).toBe(true);
  });

  it('inert the app changes during an overlay is the app’s value after it closes', async () => {
    function App({ busy }: { busy: boolean }) {
      return (
        <Shell.Root>
          <Shell.Content inert={busy || undefined}>content</Shell.Content>
          <Shell.Inspector defaultOpen>inspector</Shell.Inspector>
        </Shell.Root>
      );
    }
    const { rerender } = renderWithProviders(<App busy />);
    await act(async () => {
      rerender(<App busy={false} />);
    });
    fireEvent.click(q('.kui-ShellScrim'));

    expect(isInert(q('.kui-ShellContent'))).toBe(false);
  });
});

describe('the page lock', () => {
  afterEach(() => {
    document.documentElement.removeAttribute('data-kui-shell-lock');
  });

  it('a Shell given its own height leaves the page alone', () => {
    renderWithProviders(
      <Shell.Root height={480}>
        <Shell.Content>content</Shell.Content>
        <Shell.Inspector defaultOpen>inspector</Shell.Inspector>
      </Shell.Root>,
    );
    expect(q('.kui-ShellRoot').hasAttribute('data-overlay-live')).toBe(true);
    expect(document.documentElement.hasAttribute('data-kui-shell-lock')).toBe(false);
  });

  it('a full-height Shell and an auto-height Shell lock it, and the auto one says so', () => {
    const { unmount } = renderWithProviders(
      <Shell.Root height="auto">
        <Shell.Content>content</Shell.Content>
        <Shell.Inspector defaultOpen>inspector</Shell.Inspector>
      </Shell.Root>,
    );
    expect(q('.kui-ShellRoot').getAttribute('data-height')).toBe('auto');
    expect(document.documentElement.hasAttribute('data-kui-shell-lock')).toBe(true);
    unmount();
    expect(document.documentElement.hasAttribute('data-kui-shell-lock')).toBe(false);
  });
});
