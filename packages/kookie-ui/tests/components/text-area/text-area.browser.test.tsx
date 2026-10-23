import * as React from 'react';
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { TextArea, Theme } from '../../../src/components/index';

const sizes = ['1', '2', '3', '4'] as const;
const heights = { '1': 28, '2': 32, '3': 40, '4': 48 };
const px = { '1': 8, '2': 10, '3': 13, '4': 16 };

// Distance from the root's outer edge to the text box on each axis.
function inset(root: HTMLElement) {
  const textarea = root.querySelector<HTMLElement>('textarea')!;
  const style = getComputedStyle(textarea);
  const r = root.getBoundingClientRect();
  const t = textarea.getBoundingClientRect();
  return { x: t.left - r.left + parseFloat(style.paddingLeft), y: t.top - r.top + parseFloat(style.paddingTop) };
}

describe('TextArea on the control ladder', () => {
  for (const size of sizes) {
    it(`size ${size}: pads ${px[size]}px on both axes, floor ${heights[size]}px`, () => {
      const { container } = render(
        <Theme>
          <TextArea size={size} variant="outline" aria-label="outline" />
          <TextArea size={size} variant="soft" aria-label="soft" />
          <TextArea size={size} variant="outline" rows={1} style={{ height: 0 }} aria-label="floor" />
        </Theme>,
      );
      const [outline, soft, floor] = container.querySelectorAll<HTMLElement>('.kui-TextAreaRoot');
      for (const root of [outline, soft]) {
        const { x, y } = inset(root);
        expect(x).toBeCloseTo(px[size], 1);
        expect(y).toBeCloseTo(px[size], 1);
      }
      expect(floor.getBoundingClientRect().height).toBeGreaterThanOrEqual(heights[size]);
      expect(getComputedStyle(floor).minHeight).toBe(`${heights[size]}px`);
    });
  }

  it('styles error and aria-invalid the same way, border only', () => {
    const { container } = render(
      <Theme>
        <TextArea variant="surface" aria-label="a" />
        <TextArea variant="surface" error aria-label="b" />
        <TextArea variant="surface" aria-invalid aria-label="c" />
      </Theme>,
    );
    const [plain, viaError, viaAria] = container.querySelectorAll<HTMLElement>('.kui-TextAreaRoot');
    expect(getComputedStyle(viaError).boxShadow).toBe(getComputedStyle(viaAria).boxShadow);
    expect(getComputedStyle(viaError).boxShadow).not.toBe(getComputedStyle(plain).boxShadow);
    expect(getComputedStyle(viaError).backgroundColor).toBe(getComputedStyle(plain).backgroundColor);
  });

  it('disables by colour, not opacity, with the arrow cursor', () => {
    const { container } = render(
      <Theme>
        <TextArea disabled placeholder="Notes" aria-label="notes" />
      </Theme>,
    );
    const textarea = container.querySelector('textarea')!;
    expect(getComputedStyle(textarea).opacity).toBe('1');
    expect(getComputedStyle(textarea, '::placeholder').opacity).toBe('1');
    expect(getComputedStyle(textarea).cursor).toBe('default');
  });
});
