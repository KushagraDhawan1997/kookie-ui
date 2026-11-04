import * as React from 'react';
import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import { AlertDialog, Box, Card, Dialog, Notice, Popover, Sheet, Theme } from '../../src/components/index';

/**
 * Every surface that pads publishes --kui-sf-p equal to its padding, so a child with m="bleed"
 * reaches the surface's edge on all four sides. Without it bleed falls back to 0.
 */
function expectBleedsToEdge(surfaceSelector: string) {
  const surface = document.querySelector<HTMLElement>(surfaceSelector)!;
  const child = surface.querySelector<HTMLElement>('[data-bleed]')!;
  const pad = parseFloat(getComputedStyle(surface).paddingLeft);
  expect(pad).toBeGreaterThan(0);
  const s = surface.getBoundingClientRect();
  const c = child.getBoundingClientRect();
  expect(Math.round(c.left)).toBe(Math.round(s.left));
  expect(Math.round(c.right)).toBe(Math.round(s.right));
  expect(Math.round(c.top)).toBe(Math.round(s.top));
}

const Bleed = () => <Box m="bleed" data-bleed style={{ height: 20 }} />;

describe('m="bleed" reaches the edge of every padded surface', () => {
  it('Card', () => {
    render(
      <Theme>
        <Card>
          <Bleed />
        </Card>
      </Theme>,
    );
    expectBleedsToEdge('.kui-Card');
  });

  for (const size of ['1', '2', '3', '4'] as const) {
    it(`Dialog size ${size}`, () => {
      render(
        <Theme>
          <Dialog.Root open>
            <Dialog.Content size={size} aria-describedby={undefined}>
              <Bleed />
              <Dialog.Title>Title</Dialog.Title>
            </Dialog.Content>
          </Dialog.Root>
        </Theme>,
      );
      expectBleedsToEdge('.kui-DialogContent');
    });
  }

  it('AlertDialog', () => {
    render(
      <Theme>
        <AlertDialog.Root open>
          <AlertDialog.Content aria-describedby={undefined}>
            <Bleed />
            <AlertDialog.Title>Title</AlertDialog.Title>
          </AlertDialog.Content>
        </AlertDialog.Root>
      </Theme>,
    );
    expectBleedsToEdge('.kui-AlertDialogContent');
  });

  it('Sheet', () => {
    render(
      <Theme>
        <Sheet.Root open>
          <Sheet.Content aria-describedby={undefined}>
            <Bleed />
            <Sheet.Title>Title</Sheet.Title>
          </Sheet.Content>
        </Sheet.Root>
      </Theme>,
    );
    expectBleedsToEdge('.kui-SheetContent');
  });

  for (const size of ['1', '2', '3', '4'] as const) {
    it(`Popover size ${size}`, () => {
      render(
        <Theme>
          <Popover.Root open>
            <Popover.Trigger>
              <button>Open</button>
            </Popover.Trigger>
            <Popover.Content size={size}>
              <Bleed />
            </Popover.Content>
          </Popover.Root>
        </Theme>,
      );
      expectBleedsToEdge('.kui-PopoverContent');
    });
  }

  for (const size of ['1', '2', '3', '4'] as const) {
    it(`Notice size ${size}`, () => {
      render(
        <Theme>
          <Notice size={size}>
            <Bleed />
          </Notice>
        </Theme>,
      );
      expectBleedsToEdge('.kui-NoticeRoot');
    });
  }
});
