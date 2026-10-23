import * as React from 'react';
import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import { Popover, Theme } from '../../../src/components/index';

// A popover is a card that floats (v2): surface padding and surface corner, sizes 1-4, rest 2.
const pad = { '1': 16, '2': 24, '3': 32, '4': 40 } as const;
const corner = { '1': 8, '2': 12, '3': 16, '4': 20 } as const;
type Size = keyof typeof pad;

function measure(selector: string) {
  const el = document.querySelector<HTMLElement>(selector)!;
  const style = getComputedStyle(el);
  return { pad: parseFloat(style.paddingTop), corner: parseFloat(style.borderTopLeftRadius) };
}

describe('Popover geometry', () => {
  for (const size of [undefined, '1', '2', '3', '4'] as const) {
    it(`size ${size ?? 'default'}`, () => {
      const { unmount } = render(
        <Theme radius="full">
          <Popover.Root open>
            <Popover.Trigger>
              <button>Open</button>
            </Popover.Trigger>
            <Popover.Content size={size}>Body</Popover.Content>
          </Popover.Root>
        </Theme>,
      );
      const s: Size = size ?? '2';
      expect(measure('.kui-PopoverContent')).toEqual({ pad: pad[s], corner: corner[s] });
      unmount();
    });
  }
});
