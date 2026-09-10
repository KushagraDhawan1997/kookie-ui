import * as React from 'react';
import { render, cleanup } from '@testing-library/react';
import { act } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { useBreakpoint } from '../../src/hooks/use-breakpoint.js';

/**
 * Replaces `matchMedia` so a given set of queries reports as matching, which is
 * how a real viewport at that width would behave.
 */
function installMatchMedia(matching: (query: string) => boolean) {
  const created: Array<{ query: string; listeners: Set<() => void> }> = [];

  vi.stubGlobal('matchMedia', (query: string) => {
    const entry = { query, listeners: new Set<() => void>() };
    created.push(entry);
    return {
      media: query,
      get matches() {
        return matching(query);
      },
      addEventListener: (_type: 'change', cb: () => void) => entry.listeners.add(cb),
      removeEventListener: (_type: 'change', cb: () => void) => entry.listeners.delete(cb),
      addListener: (cb: () => void) => entry.listeners.add(cb),
      removeListener: (cb: () => void) => entry.listeners.delete(cb),
      dispatchEvent: () => false,
      onchange: null,
    } as unknown as MediaQueryList;
  });

  return created;
}

describe('useBreakpoint', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  test('resolves the real breakpoint on the first render, not after paint', async () => {
    // 1100px wide: everything up to and including `md` matches.
    installMatchMedia((q) => ['520px', '768px', '1024px'].some((w) => q.includes(w)));
    const { useBreakpoint: freshUseBreakpoint } = await import('../../src/hooks/use-breakpoint.js');

    const seen: Array<{ breakpoint: string; ready: boolean }> = [];
    function Probe() {
      seen.push(freshUseBreakpoint());
      return null;
    }

    render(<Probe />);

    // Rendering at `initial` first and correcting afterwards is what shows up
    // as a layout flash on load, so the first pass has to be right.
    expect(seen[0]).toEqual({ breakpoint: 'md', ready: true });
    expect(seen).toHaveLength(1);
  });

  test('the largest matching breakpoint wins', async () => {
    installMatchMedia(() => true);
    const { useBreakpoint: freshUseBreakpoint } = await import('../../src/hooks/use-breakpoint.js');

    let result: { breakpoint: string; ready: boolean } | undefined;
    function Probe() {
      result = freshUseBreakpoint();
      return null;
    }
    render(<Probe />);

    expect(result).toEqual({ breakpoint: 'xl', ready: true });
  });

  test('components share one set of media query listeners', async () => {
    const created = installMatchMedia(() => false);
    const { useBreakpoint: freshUseBreakpoint } = await import('../../src/hooks/use-breakpoint.js');

    function Probe() {
      freshUseBreakpoint();
      return null;
    }

    render(
      <>
        <Probe />
        <Probe />
        <Probe />
        <Probe />
      </>,
    );

    // Five breakpoints, one MediaQueryList each, however many components ask.
    expect(created).toHaveLength(5);
    for (const entry of created) {
      expect(entry.listeners.size).toBe(1);
    }
  });
});

describe('useBreakpoint subscriptions', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    cleanup();
    vi.unstubAllGlobals();
  });

  test('a media query change updates every subscriber', async () => {
    let wide = false;
    const created = installMatchMedia((q) => (wide ? true : false));
    const { useBreakpoint: freshUseBreakpoint } = await import('../../src/hooks/use-breakpoint.js');

    const seen: string[][] = [];
    function Probe({ id }: { id: number }) {
      const { breakpoint } = freshUseBreakpoint();
      seen[id] = [...(seen[id] ?? []), breakpoint];
      return null;
    }

    render(
      <>
        <Probe id={0} />
        <Probe id={1} />
      </>,
    );

    expect(seen[0].at(-1)).toBe('initial');
    expect(seen[1].at(-1)).toBe('initial');

    act(() => {
      wide = true;
      // One shared handler is registered per query; firing any of them
      // recomputes and notifies every subscriber.
      created.forEach((entry) => entry.listeners.forEach((listener) => listener()));
    });

    expect(seen[0].at(-1)).toBe('xl');
    expect(seen[1].at(-1)).toBe('xl');
  });

  test('a change that does not move the breakpoint does not re-render', async () => {
    const created = installMatchMedia(() => false);
    const { useBreakpoint: freshUseBreakpoint } = await import('../../src/hooks/use-breakpoint.js');

    let renders = 0;
    function Probe() {
      freshUseBreakpoint();
      renders++;
      return null;
    }

    render(<Probe />);
    const before = renders;

    act(() => {
      created.forEach((entry) => entry.listeners.forEach((listener) => listener()));
    });

    expect(renders).toBe(before);
  });

  test('listeners are removed when the last subscriber unmounts', async () => {
    const created = installMatchMedia(() => false);
    const { useBreakpoint: freshUseBreakpoint } = await import('../../src/hooks/use-breakpoint.js');

    function Probe() {
      freshUseBreakpoint();
      return null;
    }

    const { unmount } = render(
      <>
        <Probe />
        <Probe />
      </>,
    );

    expect(created.every((entry) => entry.listeners.size === 1)).toBe(true);

    unmount();

    expect(created.every((entry) => entry.listeners.size === 0)).toBe(true);
  });

  test('listeners stay while other subscribers remain', async () => {
    const created = installMatchMedia(() => false);
    const { useBreakpoint: freshUseBreakpoint } = await import('../../src/hooks/use-breakpoint.js');

    function Probe() {
      freshUseBreakpoint();
      return null;
    }

    function App({ both }: { both: boolean }) {
      return (
        <>
          <Probe />
          {both ? <Probe /> : null}
        </>
      );
    }

    const { rerender } = render(<App both />);
    rerender(<App both={false} />);

    expect(created.every((entry) => entry.listeners.size === 1)).toBe(true);
  });

  test('falls back to the deprecated listener API', async () => {
    // Safari below 14 has no addEventListener on MediaQueryList.
    const created: Array<{ legacy: Set<() => void> }> = [];
    vi.stubGlobal('matchMedia', (query: string) => {
      const entry = { legacy: new Set<() => void>() };
      created.push(entry);
      return {
        media: query,
        matches: false,
        addListener: (cb: () => void) => entry.legacy.add(cb),
        removeListener: (cb: () => void) => entry.legacy.delete(cb),
      } as unknown as MediaQueryList;
    });

    const { useBreakpoint: freshUseBreakpoint } = await import('../../src/hooks/use-breakpoint.js');

    function Probe() {
      freshUseBreakpoint();
      return null;
    }

    const { unmount } = render(<Probe />);
    expect(created.every((entry) => entry.legacy.size === 1)).toBe(true);

    unmount();
    expect(created.every((entry) => entry.legacy.size === 0)).toBe(true);
  });
});

test('useBreakpoint is exported for consumers', () => {
  expect(typeof useBreakpoint).toBe('function');
});
