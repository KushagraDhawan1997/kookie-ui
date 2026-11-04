import * as React from 'react';
import { renderToString } from 'react-dom/server';
import { hydrateRoot } from 'react-dom/client';
import { act } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, test, vi } from 'vitest';

import { Box, Button, Card, Chip, Flex, Heading, Text, Theme } from '../../src/components/index';
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
          <Chip variant="soft" color="gray">
            Active
          </Chip>
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
 * Pin a user agent that names a platform, so anything that sniffs it and
 * renders a platform attribute shows up as a mismatch below.
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
 * The user agent is something the server cannot know, so nothing derived from
 * it may render. If it ever does, hydration mismatches.
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
    expect(html).toContain('kui-theme');
  });

  test('contains the class names generated from props', () => {
    const html = renderToString(<Screen />);

    expect(html).toContain('kui-r-p-4');
    expect(html).toContain('kui-r-gap-3');
    expect(html).toContain('kui-r-fd-column');
    expect(html).toContain('md:kui-r-fd-row');
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

  test('data-os is not added after hydration either', () => {
    const { container, messages, cleanup } = hydrate(<Screen />);
    try {
      const root = container.querySelector('.kui-theme') as HTMLElement;
      expect(root.hasAttribute('data-os')).toBe(false);
      expect(messages.filter((m) => HYDRATION_NOISE.test(m))).toEqual([]);
    } finally {
      cleanup();
    }
  });
});
