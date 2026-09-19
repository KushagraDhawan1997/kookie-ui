import * as React from 'react';
import { render } from '@testing-library/react';
import { describe, expect, test } from 'vitest';

import { Theme, useThemeContext } from '../../src/components/theme.js';
import { Button } from '../../src/components/button.js';
import { Flex } from '../../src/components/flex.js';
import { RenderCounter } from '../helpers/render-counter.js';

/**
 * Counts how often a component reading the theme context is rendered. Theme
 * context consumers are everywhere, so an extra pass here is an extra pass
 * across the whole application.
 */
function makeThemeConsumer() {
  const renders = { current: 0 };
  function Consumer() {
    useThemeContext();
    renders.current++;
    return <span data-testid="consumer" />;
  }
  return { Consumer, renders };
}

/**
 * Mounting a provider must not cost the whole tree an extra render pass.
 * `Theme` wraps every application built on the library, so a second render here
 * is a second render of everything.
 */
describe('mount render counts', () => {
  test('Theme renders its subtree exactly once on mount', () => {
    const counter = { current: 0 };
    render(
      <Theme>
        <RenderCounter counter={counter} />
      </Theme>,
    );
    expect(counter.current).toBe(1);
  });

  test('nested Theme renders its subtree exactly once on mount', () => {
    const counter = { current: 0 };
    render(
      <Theme>
        <Theme appearance="dark">
          <RenderCounter counter={counter} />
        </Theme>
      </Theme>,
    );
    expect(counter.current).toBe(1);
  });

  test('changing a theme prop re-renders the subtree once', () => {
    const counter = { current: 0 };
    const { rerender } = render(
      <Theme accentColor="blue">
        <RenderCounter counter={counter} />
      </Theme>,
    );
    counter.current = 0;
    rerender(
      <Theme accentColor="crimson">
        <RenderCounter counter={counter} />
      </Theme>,
    );
    expect(counter.current).toBe(1);
  });

  test('theme context consumers render once on mount', () => {
    const { Consumer, renders } = makeThemeConsumer();
    render(
      <Theme>
        <Consumer />
      </Theme>,
    );
    expect(renders.current).toBe(1);
  });

  test('theme context consumers render once when a theme prop changes', () => {
    const { Consumer, renders } = makeThemeConsumer();
    const { rerender } = render(
      <Theme accentColor="blue">
        <Consumer />
      </Theme>,
    );
    renders.current = 0;
    rerender(
      <Theme accentColor="crimson">
        <Consumer />
      </Theme>,
    );
    expect(renders.current).toBe(1);
  });

  test('theme context consumers render once when the appearance is toggled', () => {
    const { Consumer, renders } = makeThemeConsumer();
    const { rerender } = render(
      <Theme appearance="light">
        <Consumer />
      </Theme>,
    );
    renders.current = 0;
    rerender(
      <Theme appearance="dark">
        <Consumer />
      </Theme>,
    );
    expect(renders.current).toBe(1);
  });

  test('a screen of components mounts without extra passes', () => {
    const counter = { current: 0 };
    render(
      <Theme>
        <Flex direction="column" gap="3" p="4">
          <Button size="2" variant="classic">
            Save
          </Button>
          <RenderCounter counter={counter} />
        </Flex>
      </Theme>,
    );
    expect(counter.current).toBe(1);
  });
});
