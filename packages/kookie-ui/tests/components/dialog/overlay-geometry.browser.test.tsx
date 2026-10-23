import * as React from 'react';
import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import { AlertDialog, Dialog, Sheet, Theme } from '../../../src/components/index';

// An overlay (v2): size N pads --surface-p-(N+1) capped at 4, wears --radius-overlay-N and caps
// at --overlay-w-N. Sizes 1-4, rest 2. Measured at radius="full" (the factor caps at 1).
const pad = { '1': 24, '2': 32, '3': 40, '4': 40 } as const;
const corner = { '1': 14, '2': 20, '3': 24, '4': 28 } as const;
const width = { '1': 360, '2': 440, '3': 560, '4': 720 } as const;
type Size = keyof typeof pad;

function measure(selector: string) {
  const el = document.querySelector<HTMLElement>(selector)!;
  const style = getComputedStyle(el);
  return {
    pad: parseFloat(style.paddingTop),
    corner: parseFloat(style.borderTopLeftRadius),
    width: Math.round(el.getBoundingClientRect().width),
  };
}

const sizes = [undefined, '1', '2', '3', '4'] as const;

describe('Dialog geometry', () => {
  for (const size of sizes) {
    it(`size ${size ?? 'default'}`, () => {
      render(
        <Theme radius="full">
          <Dialog.Root open>
            <Dialog.Content size={size} aria-describedby={undefined}>
              <Dialog.Title>Title</Dialog.Title>
            </Dialog.Content>
          </Dialog.Root>
        </Theme>,
      );
      const s: Size = size ?? '2';
      expect(measure('.rt-DialogContent')).toEqual({ pad: pad[s], corner: corner[s], width: width[s] });
    });
  }

  it('follows the Theme size', () => {
    render(
      <Theme radius="full" size="4">
        <Dialog.Root open>
          <Dialog.Content aria-describedby={undefined}>
            <Dialog.Title>Title</Dialog.Title>
          </Dialog.Content>
        </Dialog.Root>
      </Theme>,
    );
    expect(measure('.rt-DialogContent')).toEqual({ pad: 40, corner: 28, width: 720 });
  });

  it('an explicit maxWidth wins over the overlay width', () => {
    render(
      <Theme radius="full">
        <Dialog.Root open>
          <Dialog.Content maxWidth="300px" aria-describedby={undefined}>
            <Dialog.Title>Title</Dialog.Title>
          </Dialog.Content>
        </Dialog.Root>
      </Theme>,
    );
    expect(measure('.rt-DialogContent').width).toBe(300);
  });
});

describe('AlertDialog geometry', () => {
  for (const size of sizes) {
    it(`size ${size ?? 'default'}`, () => {
      render(
        <Theme radius="full">
          <AlertDialog.Root open>
            <AlertDialog.Content size={size} aria-describedby={undefined}>
              <AlertDialog.Title>Title</AlertDialog.Title>
            </AlertDialog.Content>
          </AlertDialog.Root>
        </Theme>,
      );
      const s: Size = size ?? '2';
      expect(measure('.rt-AlertDialogContent')).toEqual({
        pad: pad[s],
        corner: corner[s],
        width: width[s],
      });
    });
  }
});

describe('Sheet geometry', () => {
  it('start side caps at the overlay width and pads by the overlay padding', () => {
    render(
      <Theme radius="full">
        <Sheet.Root open>
          <Sheet.Content side="start" aria-describedby={undefined}>
            <Sheet.Title>Title</Sheet.Title>
          </Sheet.Content>
        </Sheet.Root>
      </Theme>,
    );
    const m = measure('.rt-SheetContent');
    expect(m.pad).toBe(32);
    expect(m.width).toBe(440);
  });

  it('explicit maxWidth wins on a start sheet', () => {
    render(
      <Theme radius="full">
        <Sheet.Root open>
          <Sheet.Content side="end" maxWidth="600px" aria-describedby={undefined}>
            <Sheet.Title>Title</Sheet.Title>
          </Sheet.Content>
        </Sheet.Root>
      </Theme>,
    );
    expect(measure('.rt-SheetContent').width).toBe(600);
  });

  it('bottom side spans the window', () => {
    render(
      <Theme radius="full">
        <Sheet.Root open>
          <Sheet.Content side="bottom" aria-describedby={undefined}>
            <Sheet.Title>Title</Sheet.Title>
          </Sheet.Content>
        </Sheet.Root>
      </Theme>,
    );
    expect(measure('.rt-SheetContent').width).toBe(window.innerWidth);
  });
});
