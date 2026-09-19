import * as React from 'react';
import { renderToString } from 'react-dom/server';
import { hydrateRoot } from 'react-dom/client';
import { act } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { Badge, Box, Button, Card, Flex, Heading, Text, Theme } from '../../src/components/index';
import { Shell } from '../../src/components/index';

function Screen() {
  return (
    <Theme>
      <Box p="4">
        <Flex direction={{ initial: 'column', md: 'row' }} gap="3" align="center">
          <Card variant="classic" size="2">
            <Heading size="3">Title</Heading>
            <Text size="2" color="gray">
              Body
            </Text>
          </Card>
          <Badge variant="soft" color="gray">
            Active
          </Badge>
          <Button size="2" variant="classic">
            Save
          </Button>
        </Flex>
      </Box>
    </Theme>
  );
}

const HYDRATION_NOISE = /hydrat|did not match|server (html|rendered)|mismatch/i;

/**
 * jsdom's default user agent names no platform it recognises, which would make
 * `data-os` absent from the server markup whether or not it is rendered through
 * React — the assertions below would then pass for the wrong reason. Pin a user
 * agent that does resolve, so anything rendering `data-os` shows up.
 */
const MAC_UA = 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7)';
let restoreUserAgent: (() => void) | undefined;

beforeEach(() => {
  const original = Object.getOwnPropertyDescriptor(window.navigator, 'userAgent');
  Object.defineProperty(window.navigator, 'userAgent', { value: MAC_UA, configurable: true });
  restoreUserAgent = () => {
    if (original) Object.defineProperty(window.navigator, 'userAgent', original);
  };
});

afterEach(() => {
  restoreUserAgent?.();
  restoreUserAgent = undefined;
  vi.restoreAllMocks();
});

/**
 * `data-os` is resolved from the user agent, which the server cannot know. It
 * is written to the DOM in a layout effect precisely so it stays out of the
 * server markup — if it ever renders, hydration mismatches.
 */
describe('server markup', () => {
  test('does not contain data-os, even when the platform is resolvable', () => {
    expect(window.navigator.userAgent).toBe(MAC_UA);
    expect(renderToString(<Screen />)).not.toContain('data-os');
  });

  test('still contains the theme attributes the server can resolve', () => {
    const html = renderToString(<Screen />);

    expect(html).toContain('data-is-root-theme="true"');
    expect(html).toContain('data-accent-color=');
    expect(html).toContain('radix-themes');
  });

  test('contains the class names generated from props', () => {
    const html = renderToString(<Screen />);

    expect(html).toContain('rt-r-p-4');
    expect(html).toContain('rt-r-gap-3');
    expect(html).toContain('rt-r-fd-column');
    expect(html).toContain('md:rt-r-fd-row');
  });

  test('renders the shell at the initial breakpoint', () => {
    // The server has no viewport, so anything else would be a guess that
    // hydration then has to undo.
    const html = renderToString(
      <Theme>
        <Shell.Root>
          <Shell.Content>content</Shell.Content>
        </Shell.Root>
      </Theme>,
    );

    expect(html).toContain('content');
  });
});

describe('hydration', () => {
  function hydrate(element: React.ReactElement) {
    const html = renderToString(element);
    const container = document.createElement('div');
    container.innerHTML = html;
    document.body.appendChild(container);

    const error = vi.spyOn(console, 'error').mockImplementation(() => {});
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

    let root: ReturnType<typeof hydrateRoot>;
    act(() => {
      root = hydrateRoot(container, element);
    });

    const messages = [...error.mock.calls, ...warn.mock.calls].map((call) => String(call[0]));
    return {
      container,
      messages,
      cleanup: () => {
        act(() => root.unmount());
        container.remove();
      },
    };
  }

  test('a screen of components hydrates without a mismatch', () => {
    const { messages, cleanup } = hydrate(<Screen />);
    try {
      expect(messages.filter((m) => HYDRATION_NOISE.test(m))).toEqual([]);
    } finally {
      cleanup();
    }
  });

  test('hydration logs nothing at all', () => {
    const { messages, cleanup } = hydrate(<Screen />);
    try {
      expect(messages).toEqual([]);
    } finally {
      cleanup();
    }
  });

  test('data-os is added after hydration, not before', () => {
    const { container, messages, cleanup } = hydrate(<Screen />);
    try {
      const root = container.querySelector('.radix-themes') as HTMLElement;
      expect(root.dataset.os).toBe('macos');
      expect(messages.filter((m) => HYDRATION_NOISE.test(m))).toEqual([]);
    } finally {
      cleanup();
    }
  });
});
