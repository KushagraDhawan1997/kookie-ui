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
});
