import * as React from 'react';
import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import { Button, Notice, Theme } from '../../../src/components/index';

// v2 notice: panel padding, one 12px gap, and a corner concentric with its buttons.
const panel = { '1': 8, '2': 12, '3': 16, '4': 24 } as const;

function measure(size: '1' | '2' | '3' | '4', radius?: 'none' | 'medium' | 'full') {
  const { container, unmount } = render(
    <Theme radius={radius}>
      <Notice size={size} action={<Button size={size}>Fix</Button>}>
        One line.
      </Notice>
    </Theme>,
  );
  const root = container.querySelector<HTMLElement>('.rt-NoticeRoot')!;
  const button = root.querySelector<HTMLElement>('.rt-BaseButton')!;
  const out = {
    pad: parseFloat(getComputedStyle(root).paddingTop),
    gap: parseFloat(getComputedStyle(root).columnGap),
    corner: parseFloat(getComputedStyle(root).borderTopLeftRadius),
    buttonCorner: parseFloat(getComputedStyle(button).borderTopRightRadius),
  };
  unmount();
  return out;
}

describe('Notice geometry', () => {
  for (const size of ['1', '2', '3', '4'] as const) {
    it(`size ${size}`, () => {
      const m = measure(size);
      expect(m.pad).toBe(panel[size]);
      expect(m.gap).toBe(12);
      expect(m.corner).toBeCloseTo(m.buttonCorner + m.pad, 1);
    });
  }

  it('stays square at radius none', () => {
    expect(measure('2', 'none').corner).toBe(0);
  });
});
