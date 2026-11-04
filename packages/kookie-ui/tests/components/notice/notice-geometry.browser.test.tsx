import * as React from 'react';
import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import { Button, Notice, Theme } from '../../../src/components/index';

// A notice is a surface: Card's padding and corner at the same size, and one 12px gap.
const surface = { '1': 16, '2': 24, '3': 32, '4': 40 } as const;
const corner = { '1': 16, '2': 20, '3': 24, '4': 28 } as const;

function measure(size: '1' | '2' | '3' | '4', radius?: 'none' | 'medium' | 'full') {
  const { container, unmount } = render(
    <Theme radius={radius}>
      <Notice size={size} action={<Button size={size}>Fix</Button>}>
        One line.
      </Notice>
    </Theme>,
  );
  const root = container.querySelector<HTMLElement>('.kui-NoticeRoot')!;
  const out = {
    pad: parseFloat(getComputedStyle(root).paddingTop),
    gap: parseFloat(getComputedStyle(root).columnGap),
    corner: parseFloat(getComputedStyle(root).borderTopLeftRadius),
  };
  unmount();
  return out;
}

describe('Notice geometry', () => {
  for (const size of ['1', '2', '3', '4'] as const) {
    it(`size ${size}`, () => {
      const m = measure(size);
      expect(m.pad).toBe(surface[size]);
      expect(m.gap).toBe(12);
      expect(m.corner).toBeCloseTo(corner[size], 1);
    });
  }

  it('stays square at radius none', () => {
    expect(measure('2', 'none').corner).toBe(0);
  });
});
