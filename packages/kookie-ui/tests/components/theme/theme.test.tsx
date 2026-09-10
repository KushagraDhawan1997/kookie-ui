import * as React from 'react';
import { act, render, screen } from '@testing-library/react';
import { describe, expect, test, vi } from 'vitest';

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
    const { container } = render(<Theme appearance="dark" accentColor="crimson" radius="large" scaling="105%" />);
    const root = container.querySelector('.radix-themes') as HTMLElement;

    expect(root.dataset.isRootTheme).toBe('true');
    expect(root.dataset.accentColor).toBe('crimson');
    expect(root.dataset.radius).toBe('large');
    expect(root.dataset.scaling).toBe('105%');
    expect(root.classList.contains('dark')).toBe(true);
  });

  test('a nested theme is not marked as root', () => {
    const { container } = render(
      <Theme>
        <Theme appearance="dark" data-testid="nested" />
      </Theme>,
    );
    const themes = container.querySelectorAll('.radix-themes');

    expect(themes).toHaveLength(2);
    expect((themes[0] as HTMLElement).dataset.isRootTheme).toBe('true');
    expect((themes[1] as HTMLElement).dataset.isRootTheme).toBe('false');
  });

  test('grayColor="auto" resolves against the accent colour', () => {
    const { container } = render(<Theme accentColor="crimson" grayColor="auto" />);
    const root = container.querySelector('.radix-themes') as HTMLElement;

    expect(root.dataset.grayColor).toBeTruthy();
    expect(root.dataset.grayColor).not.toBe('auto');
  });
});

/**
 * `data-os` cannot be resolved on the server, so it is written to the DOM in a
 * layout effect rather than rendered. That keeps it out of the server markup —
 * so hydration still matches — without costing the root an extra render pass,
 * but it also means React is no longer managing the attribute.
 */
describe('Theme data-os', () => {
  /**
   * jsdom reports a user agent with no recognisable platform, so the OS has to
   * be supplied for these to mean anything.
   */
  function withUserAgent(userAgent: string) {
    const original = Object.getOwnPropertyDescriptor(window.navigator, 'userAgent');
    Object.defineProperty(window.navigator, 'userAgent', { value: userAgent, configurable: true });
    return () => {
      if (original) Object.defineProperty(window.navigator, 'userAgent', original);
      else delete (window.navigator as unknown as Record<string, unknown>).userAgent;
    };
  }

  test.each([
    ['Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)', 'macos'],
    ['Mozilla/5.0 (Windows NT 10.0; Win64; x64)', 'windows'],
    ['Mozilla/5.0 (X11; Linux x86_64)', 'linux'],
  ])('%s resolves to %s', (userAgent, expected) => {
    const restore = withUserAgent(userAgent);
    try {
      const { container } = render(<Theme />);
      const root = container.querySelector('.radix-themes') as HTMLElement;
      expect(root.dataset.os).toBe(expected);
    } finally {
      restore();
    }
  });

  test('an unrecognised platform leaves the attribute off entirely', () => {
    const restore = withUserAgent('Mozilla/5.0 (something else)');
    try {
      const { container } = render(<Theme />);
      const root = container.querySelector('.radix-themes') as HTMLElement;
      expect(root.hasAttribute('data-os')).toBe(false);
    } finally {
      restore();
    }
  });

  test('is not applied to a nested theme', () => {
    const restore = withUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)');
    try {
      const { container } = render(
        <Theme>
          <Theme appearance="dark" />
        </Theme>,
      );
      const themes = container.querySelectorAll('.radix-themes');

      expect((themes[0] as HTMLElement).dataset.os).toBe('macos');
      expect((themes[1] as HTMLElement).hasAttribute('data-os')).toBe(false);
    } finally {
      restore();
    }
  });

  test('survives a re-render', () => {
    // React does not own the attribute any more, so a reconcile must not drop it.
    const restore = withUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)');
    try {
      const { container, rerender } = render(<Theme accentColor="blue" />);
      const root = container.querySelector('.radix-themes') as HTMLElement;

      rerender(<Theme accentColor="crimson" />);

      expect(root.dataset.accentColor).toBe('crimson');
      expect(root.dataset.os).toBe('macos');
    } finally {
      restore();
    }
  });

  test('a caller-supplied data-os is left alone', () => {
    const restore = withUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)');
    try {
      const { container } = render(<Theme data-os="windows" />);
      const root = container.querySelector('.radix-themes') as HTMLElement;
      expect(root.dataset.os).toBe('windows');
    } finally {
      restore();
    }
  });

  test('is cleaned up on unmount', () => {
    const restore = withUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)');
    try {
      const { container, unmount } = render(<Theme />);
      const root = container.querySelector('.radix-themes') as HTMLElement;
      expect(root.dataset.os).toBe('macos');

      unmount();

      expect(root.hasAttribute('data-os')).toBe(false);
    } finally {
      restore();
    }
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

  test('panelBackground tracks material for backwards compatibility', () => {
    const { seen, Probe } = readContext();
    render(
      <Theme material="solid">
        <Probe />
      </Theme>,
    );

    expect(seen.at(-1)?.material).toBe('solid');
    expect(seen.at(-1)?.panelBackground).toBe('solid');
  });

  test('material is settled on the first commit, not corrected afterwards', () => {
    const { container } = render(<Theme material="solid" />);
    const root = container.querySelector('.radix-themes') as HTMLElement;

    expect(root.dataset.material).toBe('solid');
    expect(root.dataset.panelBackground).toBe('solid');
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
