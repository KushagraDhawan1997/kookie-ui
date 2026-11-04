import * as React from 'react';
import { act, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { appearanceScript, APPEARANCE_STORAGE_KEY } from '../../src/hooks/appearance-script.js';
import { setAppearance, useAppearance } from '../../src/hooks/use-appearance.js';

function mockSystem(dark: boolean) {
  vi.stubGlobal(
    'matchMedia',
    vi.fn().mockImplementation((query: string) => ({
      matches: dark && query === '(prefers-color-scheme: dark)',
      media: query,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
    })),
  );
}

function runScript() {
  // eslint-disable-next-line no-new-func
  new Function(appearanceScript)();
}

function Probe() {
  const { choice, appearance } = useAppearance();
  return <div data-testid="probe">{`${choice}:${appearance}`}</div>;
}

describe('appearance', () => {
  beforeEach(() => {
    localStorage.clear();
    document.documentElement.className = '';
    document.documentElement.removeAttribute('data-appearance');
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  test('the script follows the system when nothing is stored', () => {
    mockSystem(true);
    runScript();
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    expect(document.documentElement.dataset.appearance).toBe('dark');
  });

  test('the script prefers the stored choice over the system', () => {
    mockSystem(true);
    localStorage.setItem(APPEARANCE_STORAGE_KEY, 'light');
    runScript();
    expect(document.documentElement.className).toBe('light');
  });

  test('the script still stamps when storage throws', () => {
    mockSystem(true);
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    runScript();
    expect(document.documentElement.classList.contains('dark')).toBe(true);
    vi.mocked(Storage.prototype.getItem).mockRestore();
  });

  test('useAppearance reads <html> and setAppearance writes it and stores the choice', () => {
    mockSystem(false);
    runScript();
    render(<Probe />);
    expect(screen.getByTestId('probe').textContent).toBe('system:light');

    act(() => setAppearance('dark'));
    expect(screen.getByTestId('probe').textContent).toBe('dark:dark');
    expect(document.documentElement.className).toBe('dark');
    expect(localStorage.getItem(APPEARANCE_STORAGE_KEY)).toBe('dark');

    act(() => setAppearance('system'));
    expect(screen.getByTestId('probe').textContent).toBe('system:light');
    expect(localStorage.getItem(APPEARANCE_STORAGE_KEY)).toBeNull();
  });

  test('with storage blocked, an explicit choice holds when the system changes', () => {
    const system = liveSystem(false);
    vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    runScript();
    render(<Probe />);

    act(() => setAppearance('dark'));
    expect(screen.getByTestId('probe').textContent).toBe('dark:dark');

    act(() => system.set(false));
    expect(screen.getByTestId('probe').textContent).toBe('dark:dark');
    expect(document.documentElement.className).toBe('dark');

    vi.spyOn(Storage.prototype, 'removeItem').mockImplementation(() => {
      throw new Error('blocked');
    });
    act(() => setAppearance('system'));
    expect(screen.getByTestId('probe').textContent).toBe('system:light');
  });

  test('many consumers share one system listener and one stamp per change', () => {
    const system = liveSystem(false);
    runScript();
    render(
      <>
        <Probe />
        <Probe />
        <Probe />
        <Probe />
      </>,
    );
    expect(system.listenerCount()).toBe(1);

    const add = vi.spyOn(document.documentElement.classList, 'add');
    act(() => system.set(true));
    expect(add).toHaveBeenCalledTimes(1);
    expect(screen.getAllByTestId('probe').map((el) => el.textContent)).toEqual(Array(4).fill('system:dark'));
  });
});

/** A prefers-color-scheme query whose value can change, with its listeners counted. */
function liveSystem(initial: boolean) {
  let dark = initial;
  const handlers = new Set<() => void>();
  vi.stubGlobal(
    'matchMedia',
    vi.fn().mockImplementation((query: string) => ({
      get matches() {
        return dark && query === '(prefers-color-scheme: dark)';
      },
      media: query,
      addEventListener: (_: string, handler: () => void) => handlers.add(handler),
      removeEventListener: (_: string, handler: () => void) => handlers.delete(handler),
    })),
  );
  return {
    set(next: boolean) {
      dark = next;
      handlers.forEach((handler) => handler());
    },
    listenerCount: () => handlers.size,
  };
}
