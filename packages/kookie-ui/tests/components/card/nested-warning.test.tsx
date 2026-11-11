import * as React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render } from '@testing-library/react';
import { Button, Card, Dialog, Flex, Theme } from '../../../src/components/index';

const nested = (spy: ReturnType<typeof vi.spyOn>) =>
  spy.mock.calls.filter((args: unknown[]) => String(args[0]).includes('A <Card> is rendering inside another <Card>')).length;

describe('Card nesting warning', () => {
  it('warns once when a card renders inside a card, however deep', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    render(
      <Theme>
        <Card>
          <Flex direction="column">
            <Card>Inner</Card>
          </Flex>
        </Card>
      </Theme>,
    );
    expect(nested(warn)).toBe(1);
    warn.mockRestore();
  });

  it('warns for an asChild card inside a card', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    render(
      <Theme>
        <Card>
          <Card asChild>
            <a href="/x">Inner</a>
          </Card>
        </Card>
      </Theme>,
    );
    expect(nested(warn)).toBe(1);
    warn.mockRestore();
  });

  it('does not warn for cards side by side', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    render(
      <Theme>
        <Flex gap="3">
          <Card>One</Card>
          <Card>Two</Card>
        </Flex>
      </Theme>,
    );
    expect(nested(warn)).toBe(0);
    warn.mockRestore();
  });

  it('does not warn for a card in a dialog opened from a card', () => {
    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
    render(
      <Theme>
        <Card>
          <Dialog.Root open>
            <Dialog.Trigger>
              <Button>Open</Button>
            </Dialog.Trigger>
            <Dialog.Content aria-label="Pick" aria-describedby={undefined}>
              <Card>In the dialog</Card>
            </Dialog.Content>
          </Dialog.Root>
        </Card>
      </Theme>,
    );
    expect(nested(warn)).toBe(0);
    warn.mockRestore();
  });
});
