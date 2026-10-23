import * as React from 'react';
import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import { Button, Notice, Theme } from '../../../src/components/index';

// A notice has Callout's spacing: an even inset, the icon on the first line, and an action
// that does not make the strip taller than its words.
describe('Notice spacing', () => {
  for (const size of ['1', '2', '3', '4'] as const) {
    it(`size ${size}`, () => {
      const { container } = render(
        <Theme>
          <div style={{ width: 240 }}>
            <Notice size={size} icon={<svg />}>
              A long message that wraps onto a second line in a narrow strip.
            </Notice>
          </div>
          <Notice size={size} action={<Button size={size}>Fix</Button>}>
            One line.
          </Notice>
        </Theme>,
      );
      const [wrapped, withAction] = container.querySelectorAll<HTMLElement>('.rt-NoticeRoot');
      const style = getComputedStyle(wrapped);
      expect(new Set([style.paddingTop, style.paddingRight, style.paddingBottom, style.paddingLeft]).size).toBe(1);

      const icon = wrapped.querySelector<HTMLElement>('.rt-NoticeIcon')!.getBoundingClientRect();
      const text = wrapped.querySelector<HTMLElement>('.rt-NoticeText')!.getBoundingClientRect();
      const line = parseFloat(getComputedStyle(wrapped.querySelector('.rt-NoticeText')!).lineHeight);
      expect(text.height).toBeGreaterThan(line);
      expect(Math.abs(icon.top + icon.height / 2 - (text.top + line / 2))).toBeLessThan(1);

      const pad = parseFloat(getComputedStyle(withAction).paddingTop);
      expect(withAction.getBoundingClientRect().height).toBeCloseTo(line + 2 * pad, 0);
    });
  }
});
