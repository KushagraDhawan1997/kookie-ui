import * as React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render } from '@testing-library/react';
import { Flex, Sheet, Theme } from '../../../src/components/index';

const missingName = (spy: ReturnType<typeof vi.spyOn>) =>
  spy.mock.calls.some((args: unknown[]) => String(args[0]).includes('Sheet.Content: Missing accessible name'));

describe('Sheet missing-title warning', () => {
  it('does not warn when Sheet.Title is nested inside a layout element', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    render(
      <Theme>
        <Sheet.Root open>
          <Sheet.Content aria-describedby={undefined}>
            <Flex direction="column">
              <Sheet.Title>Order 42</Sheet.Title>
            </Flex>
          </Sheet.Content>
        </Sheet.Root>
      </Theme>,
    );
    expect(missingName(warn)).toBe(false);
  });

  it('warns when there is no title and no aria-label', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    render(
      <Theme>
        <Sheet.Root open>
          <Sheet.Content aria-describedby={undefined}>
            <p>No name</p>
          </Sheet.Content>
        </Sheet.Root>
      </Theme>,
    );
    expect(missingName(warn)).toBe(true);
  });

  it('does not warn with aria-labelledby', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    render(
      <Theme>
        <Sheet.Root open>
          <Sheet.Content aria-labelledby="h" aria-describedby={undefined}>
            <h2 id="h">Named</h2>
          </Sheet.Content>
        </Sheet.Root>
      </Theme>,
    );
    expect(missingName(warn)).toBe(false);
  });
});
