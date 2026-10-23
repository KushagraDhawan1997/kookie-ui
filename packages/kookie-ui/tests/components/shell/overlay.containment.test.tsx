import * as React from 'react';
import { afterAll, beforeAll, describe, expect, it, vi } from 'vitest';
import { renderWithProviders, screen } from '../../test-utils';
import { fireEvent } from '@testing-library/react';
import { Shell } from '../../../src/components/index';

/**
 * In jsdom every window is narrower than the first breakpoint, so the
 * Inspector and the Sidebar take their default posture there: an overlay.
 *
 * jsdom does not implement `inert`. Browsers reflect the property to the
 * attribute, so an app's `inert` prop and the Root's writes meet in one place;
 * the same reflection is installed here for the length of this file.
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

function App({
  onInspector,
  onSidebar,
  inertContent,
}: {
  onInspector?: (open: boolean, meta: { reason: string }) => void;
  onSidebar?: (state: string, meta: { reason: string }) => void;
  inertContent?: boolean;
}) {
  return (
    <Shell.Root>
      <Shell.Header>
        <Shell.Trigger target="inspector">inspector</Shell.Trigger>
        <Shell.Trigger target="sidebar">sidebar</Shell.Trigger>
      </Shell.Header>
      <Shell.Sidebar onStateChange={onSidebar}>
        <button type="button">sidebar item</button>
      </Shell.Sidebar>
      {/* `inert` set by the app is the app's: the Root restores it, not clears it. */}
      <Shell.Content inert={inertContent || undefined}>content</Shell.Content>
      <Shell.Inspector onOpenChange={onInspector}>
        <button type="button">inspector item</button>
      </Shell.Inspector>
    </Shell.Root>
  );
}

const q = (selector: string) => document.querySelector(selector) as HTMLElement;
const isInert = (el: Element) => el.hasAttribute('inert');

function openInspector() {
  const trigger = screen.getByRole('button', { name: 'inspector' });
  trigger.focus();
  fireEvent.click(trigger);
  return trigger;
}

describe('an open overlay contains the frame', () => {
  it('inerts everything in the Root but the overlay and the scrim', () => {
    renderWithProviders(<App />);
    openInspector();

    expect(q('.kui-ShellInspector').getAttribute('data-presentation')).toBe('overlay');
    expect(q('.kui-ShellRoot').hasAttribute('data-overlay-live')).toBe(true);
    expect(isInert(q('.kui-ShellHeader'))).toBe(true);
    expect(isInert(q('.kui-ShellSidebar'))).toBe(true);
    expect(isInert(q('.kui-ShellContent'))).toBe(true);
    expect(isInert(q('.kui-ShellInspector'))).toBe(false);
    expect(isInert(q('.kui-ShellScrim'))).toBe(false);
  });

  it('moves focus into the overlay and returns it to the trigger when it closes', () => {
    renderWithProviders(<App />);
    const trigger = openInspector();

    expect(document.activeElement).toBe(q('.kui-ShellInspector'));

    fireEvent.keyDown(q('.kui-ShellInspector'), { key: 'Escape' });
    expect(document.activeElement).toBe(trigger);
  });

  it('locks the page while open and releases it after', () => {
    renderWithProviders(<App />);
    openInspector();
    expect(document.documentElement.hasAttribute('data-kui-shell-lock')).toBe(true);

    fireEvent.click(q('.kui-ShellScrim'));
    expect(document.documentElement.hasAttribute('data-kui-shell-lock')).toBe(false);
  });

  it('restores what it inerted, including inert the app had set itself', () => {
    renderWithProviders(<App inertContent />);
    expect(isInert(q('.kui-ShellContent'))).toBe(true);
    openInspector();

    fireEvent.keyDown(q('.kui-ShellInspector'), { key: 'Escape' });

    expect(isInert(q('.kui-ShellHeader'))).toBe(false);
    expect(isInert(q('.kui-ShellSidebar'))).toBe(false);
    expect(isInert(q('.kui-ShellContent'))).toBe(true);
  });

  it('leaves the wrapper of a wrapped overlay alone', () => {
    renderWithProviders(
      <Shell.Root>
        <Shell.Header>
          <Shell.Trigger target="inspector">inspector</Shell.Trigger>
        </Shell.Header>
        <Shell.Content>content</Shell.Content>
        <div className="wrapper">
          <Shell.Inspector>inspector</Shell.Inspector>
        </div>
      </Shell.Root>,
    );
    openInspector();

    expect(isInert(q('.wrapper'))).toBe(false);
    expect(isInert(q('.kui-ShellContent'))).toBe(true);
  });
});

describe('dismissing an overlay', () => {
  it('Escape closes it with reason dismiss', () => {
    const onInspector = vi.fn();
    renderWithProviders(<App onInspector={onInspector} />);
    openInspector();
    onInspector.mockClear();

    fireEvent.keyDown(q('.kui-ShellInspector'), { key: 'Escape' });

    expect(onInspector).toHaveBeenCalledTimes(1);
    expect(onInspector).toHaveBeenLastCalledWith(false, { reason: 'dismiss' });
    expect(q('.kui-ShellInspector').getAttribute('data-state')).toBe('closed');
    expect(q('.kui-ShellRoot').hasAttribute('data-overlay-live')).toBe(false);
  });

  it('a press on the scrim closes it with reason dismiss', () => {
    const onInspector = vi.fn();
    renderWithProviders(<App onInspector={onInspector} />);
    openInspector();
    onInspector.mockClear();

    fireEvent.click(q('.kui-ShellScrim'));

    expect(onInspector).toHaveBeenLastCalledWith(false, { reason: 'dismiss' });
    expect(q('.kui-ShellInspector').getAttribute('data-state')).toBe('closed');
  });

  it('closes every live overlay at once, and neither inerts the other', () => {
    const onInspector = vi.fn();
    const onSidebar = vi.fn();
    renderWithProviders(<App onInspector={onInspector} onSidebar={onSidebar} />);
    fireEvent.click(screen.getByRole('button', { name: 'sidebar' }));
    openInspector();

    expect(isInert(q('.kui-ShellSidebar'))).toBe(false);
    expect(isInert(q('.kui-ShellInspector'))).toBe(false);

    fireEvent.keyDown(q('.kui-ShellInspector'), { key: 'Escape' });

    expect(onInspector).toHaveBeenLastCalledWith(false, { reason: 'dismiss' });
    expect(onSidebar).toHaveBeenLastCalledWith('collapsed', { reason: 'dismiss' });
  });

  it('Escape stops at the Shell when it closes something, and passes through when it does not', () => {
    const outer = vi.fn();
    renderWithProviders(
      <div onKeyDown={(event) => outer(event.key)}>
        <App />
      </div>,
    );

    fireEvent.keyDown(q('.kui-ShellContent'), { key: 'Escape' });
    expect(outer).toHaveBeenCalledTimes(1);

    openInspector();
    fireEvent.keyDown(q('.kui-ShellInspector'), { key: 'Escape' });
    expect(outer).toHaveBeenCalledTimes(1);
  });
});
