import * as React from 'react';
import { act, render, screen } from '@testing-library/react';
import { describe, expect, test } from 'vitest';
import { Direction } from 'radix-ui';

import { Theme, useThemeContext } from '../../../src/components/theme';

function readContext() {
  const seen: Array<ReturnType<typeof useThemeContext>> = [];
  function Probe() {
    seen.push(useThemeContext());
    return null;
  }
  return { seen, Probe };
}

describe('Theme attributes', () => {
  test('the root theme carries the resolved values', () => {
    const { container } = render(<Theme appearance="dark" accentColor="crimson" radius="large" />);
    const root = container.querySelector('.kui-theme') as HTMLElement;

    expect(root.dataset.isRootTheme).toBe('true');
    expect(root.dataset.accentColor).toBe('crimson');
    expect(root.dataset.radius).toBe('large');
    // The scale is fixed, so nothing is written for it.
    expect(root.dataset.scaling).toBeUndefined();
    expect(root.classList.contains('dark')).toBe(true);
  });

  test('a nested theme is not marked as root', () => {
    const { container } = render(
      <Theme>
        <Theme appearance="dark" data-testid="nested" />
      </Theme>,
    );
    const themes = container.querySelectorAll('.kui-theme');

    expect(themes).toHaveLength(2);
    expect((themes[0] as HTMLElement).dataset.isRootTheme).toBe('true');
    expect((themes[1] as HTMLElement).dataset.isRootTheme).toBe('false');
  });

  test('grayColor="auto" resolves against the accent colour', () => {
    const { container } = render(<Theme accentColor="crimson" grayColor="auto" />);
    const root = container.querySelector('.kui-theme') as HTMLElement;

    expect(root.dataset.grayColor).toBeTruthy();
    expect(root.dataset.grayColor).not.toBe('auto');
  });
});

/**
 * Nothing in the library reads an OS attribute, so the root does not sniff the
 * user agent to write one.
 */
describe('Theme data-os', () => {
  test('is not stamped on the root, even when the platform is resolvable', () => {
    const original = Object.getOwnPropertyDescriptor(window.navigator, 'userAgent');
    Object.defineProperty(window.navigator, 'userAgent', {
      value: 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)',
      configurable: true,
    });
    try {
      const { container } = render(<Theme />);
      const root = container.querySelector('.kui-theme') as HTMLElement;
      expect(root.hasAttribute('data-os')).toBe(false);
    } finally {
      if (original) Object.defineProperty(window.navigator, 'userAgent', original);
      else delete (window.navigator as unknown as Record<string, unknown>).userAgent;
    }
  });

  test('a caller-supplied data-os is passed through', () => {
    const { container } = render(<Theme data-os="windows" />);
    const root = container.querySelector('.kui-theme') as HTMLElement;
    expect(root.dataset.os).toBe('windows');
  });
});

describe('Theme values follow their props', () => {
  test('a changed prop reaches the context', () => {
    const { seen, Probe } = readContext();
    const { rerender } = render(
      <Theme accentColor="blue">
        <Probe />
      </Theme>,
    );

    rerender(
      <Theme accentColor="crimson">
        <Probe />
      </Theme>,
    );

    expect(seen.at(-1)?.accentColor).toBe('crimson');
  });

  test('consumers render once per theme change, not twice', () => {
    // Syncing props into state through an effect used to commit the old theme
    // first, so every consumer in the tree rendered twice and the browser could
    // paint the stale value in between.
    const { seen, Probe } = readContext();
    const { rerender } = render(
      <Theme appearance="light">
        <Probe />
      </Theme>,
    );
    seen.length = 0;

    rerender(
      <Theme appearance="dark">
        <Probe />
      </Theme>,
    );

    expect(seen).toHaveLength(1);
    expect(seen[0].appearance).toBe('dark');
  });

  test('the context can still be changed at runtime', () => {
    // This is what ThemePanel does; making the state prop-derived must not take
    // it away.
    const { seen, Probe } = readContext();
    render(
      <Theme accentColor="blue">
        <Probe />
      </Theme>,
    );

    act(() => seen.at(-1)!.onAccentColorChange('jade'));

    expect(seen.at(-1)?.accentColor).toBe('jade');
  });

  test('a change made inside a nested Theme reaches the root', () => {
    // Dialog, Popover and the menus wrap their content in a nested Theme, so a
    // switcher inside one calls the nested context's setter.
    const { seen, Probe } = readContext();
    render(
      <Theme accentColor="blue">
        <Theme>
          <Probe />
        </Theme>
      </Theme>,
    );

    act(() => seen.at(-1)!.onAccentColorChange('red'));
    act(() => seen.at(-1)!.onAppearanceChange('dark'));

    expect(seen.at(-1)?.accentColor).toBe('red');
    expect(seen.at(-1)?.appearance).toBe('dark');
  });

  test('a runtime change is overridden by a later prop change', () => {
    const { seen, Probe } = readContext();
    const { rerender } = render(
      <Theme accentColor="blue">
        <Probe />
      </Theme>,
    );

    act(() => seen.at(-1)!.onAccentColorChange('jade'));
    rerender(
      <Theme accentColor="crimson">
        <Probe />
      </Theme>,
    );

    expect(seen.at(-1)?.accentColor).toBe('crimson');
  });

  test('solid is the only material, so no material attribute is written', () => {
    const { container } = render(<Theme />);
    const root = container.querySelector('.kui-theme') as HTMLElement;

    expect(root.dataset.material).toBeUndefined();
  });
});

describe('useThemeContext outside a provider', () => {
  test('falls back to defaults rather than throwing', () => {
    let value: ReturnType<typeof useThemeContext> | undefined;
    function Probe() {
      value = useThemeContext();
      return <span data-testid="ok" />;
    }

    render(<Probe />);

    expect(screen.getByTestId('ok')).toBeTruthy();
    expect(value?.accentColor).toBeTruthy();
    expect(() => value?.onAccentColorChange('jade')).not.toThrow();
  });
});

describe('Theme direction', () => {
  function DirProbe() {
    return <span data-testid="dir">{Direction.useDirection()}</span>;
  }

  test('defaults to left-to-right', () => {
    render(
      <Theme>
        <DirProbe />
      </Theme>,
    );
    expect(screen.getByTestId('dir').textContent).toBe('ltr');
  });

  test('inherits a direction set above it', () => {
    render(
      <Direction.Provider dir="rtl">
        <Theme>
          <DirProbe />
        </Theme>
      </Direction.Provider>,
    );
    expect(screen.getByTestId('dir').textContent).toBe('rtl');
  });
});
