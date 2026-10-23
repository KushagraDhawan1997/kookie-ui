import * as React from 'react';
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { Button, TextField, Theme } from '../../../src/components/index';

const sizes = ['1', '2', '3', '4'] as const;
const heights = { '1': 28, '2': 32, '3': 40, '4': 48 };
const px = { '1': 8, '2': 10, '3': 13, '4': 16 };
const pill = { '1': 12, '2': 14, '3': 17, '4': 20 };
const gap = { '1': 4, '2': 8, '3': 8, '4': 12 };
const icon = { '1': 16, '2': 16, '3': 20, '4': 24 };
const inset = { '1': 3, '2': 3, '3': 4, '4': 4 };

const rect = (el: Element) => el.getBoundingClientRect();

function Glyph() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden width="16" height="16">
      <circle cx="8" cy="8" r="4" fill="currentColor" />
    </svg>
  );
}

// Distance from the root's outer left edge to where the input's text starts.
function textStart(root: HTMLElement) {
  const input = root.querySelector<HTMLElement>('.rt-TextFieldInput')!;
  const style = getComputedStyle(input);
  return rect(input).left - rect(root).left + parseFloat(style.textIndent) + parseFloat(style.paddingLeft);
}

describe('TextField on the control ladder', () => {
  for (const size of sizes) {
    describe(`size ${size}`, () => {
      it(`is ${heights[size]}px tall in every variant`, () => {
        const { container } = render(
          <Theme>
            {(['raised', 'surface', 'soft', 'ghost', 'outline'] as const).map((variant) => (
              <TextField.Root key={variant} size={size} variant={variant} aria-label={variant} />
            ))}
          </Theme>,
        );
        for (const root of container.querySelectorAll('.rt-TextFieldRoot')) {
          expect(rect(root).height).toBe(heights[size]);
        }
      });

      it(`pads the text ${px[size]}px, and ${pill[size]}px at radius full (the Theme default)`, () => {
        const { container } = render(
          <Theme>
            <TextField.Root size={size} variant="outline" radius="medium" aria-label="plain" />
            <TextField.Root size={size} variant="outline" radius="full" aria-label="pill" />
          </Theme>,
        );
        const [plain, full] = container.querySelectorAll<HTMLElement>('.rt-TextFieldRoot');
        expect(textStart(plain)).toBeCloseTo(px[size], 1);
        expect(textStart(full)).toBeCloseTo(pill[size], 1);
      });

      it(`sizes slot icons ${icon[size]}px, ${px[size]}px from the edge and ${gap[size]}px from the text`, () => {
        const { container } = render(
          <Theme>
            <TextField.Root size={size} variant="outline" radius="full" aria-label="search">
              <TextField.Slot>
                <Glyph />
              </TextField.Slot>
            </TextField.Root>
          </Theme>,
        );
        const root = container.querySelector<HTMLElement>('.rt-TextFieldRoot')!;
        const svg = root.querySelector('svg')!;
        expect(rect(svg).width).toBe(icon[size]);
        expect(rect(svg).height).toBe(icon[size]);
        // A slotted edge keeps the plain padding, even at radius full.
        expect(rect(svg).left - rect(root).left).toBeCloseTo(px[size], 1);
        expect(textStart(root) - (rect(svg).right - rect(root).left)).toBeCloseTo(gap[size], 1);
      });

      it(`hosts a control ${heights[size] - 2 * inset[size]}px tall, ${inset[size]}px from the edges`, () => {
        const { container } = render(
          <Theme>
            <TextField.Root size={size} variant="outline" aria-label="query">
              <TextField.Slot side="right">
                <Button iconOnly size="2" variant="ghost" aria-label="Clear">
                  <Glyph />
                </Button>
              </TextField.Slot>
            </TextField.Root>
          </Theme>,
        );
        const root = container.querySelector<HTMLElement>('.rt-TextFieldRoot')!;
        const button = root.querySelector<HTMLElement>('[data-icon-only]')!;
        const r = rect(root);
        const b = rect(button);
        expect(r.height).toBe(heights[size]);
        expect(b.height).toBe(heights[size] - 2 * inset[size]);
        // Square, and the same inset above, below and beside it.
        expect(b.width).toBe(b.height);
        expect(b.top - r.top).toBeCloseTo(inset[size], 1);
        expect(r.bottom - b.bottom).toBeCloseTo(inset[size], 1);
        expect(r.right - b.right).toBeCloseTo(inset[size], 1);
      });

      it(`hosts a control in a left slot ${inset[size]}px from the left edge`, () => {
        const { container } = render(
          <Theme>
            <TextField.Root size={size} variant="outline" aria-label="query">
              <TextField.Slot side="left">
                <Button iconOnly size="2" variant="ghost" aria-label="Search">
                  <Glyph />
                </Button>
              </TextField.Slot>
            </TextField.Root>
          </Theme>,
        );
        const root = container.querySelector<HTMLElement>('.rt-TextFieldRoot')!;
        const button = root.querySelector<HTMLElement>('[data-icon-only]')!;
        const r = rect(root);
        const b = rect(button);
        expect(b.height).toBe(heights[size] - 2 * inset[size]);
        expect(b.left - r.left).toBeCloseTo(inset[size], 1);
        expect(textStart(root) - (b.right - r.left)).toBeCloseTo(gap[size], 1);
      });
    });
  }

  it('follows the Theme size', () => {
    const { container } = render(
      <Theme size="3">
        <TextField.Root aria-label="field" />
        <TextField.Root aria-label="default-radius" variant="outline" />
      </Theme>,
    );
    const [root, outline] = container.querySelectorAll<HTMLElement>('.rt-TextFieldRoot');
    expect(rect(root).height).toBe(40);
    // The Theme radius defaults to full, so a bare edge takes the pill padding.
    expect(textStart(outline)).toBeCloseTo(17, 1);
  });
});

describe('TextField states', () => {
  it('styles error and aria-invalid the same way', () => {
    const { container } = render(
      <Theme>
        <TextField.Root variant="outline" aria-label="a" />
        <TextField.Root variant="outline" error aria-label="b" />
        <TextField.Root variant="outline" aria-invalid aria-label="c" />
      </Theme>,
    );
    const [plain, viaError, viaAria] = container.querySelectorAll<HTMLElement>('.rt-TextFieldRoot');
    const shadow = (el: HTMLElement) => getComputedStyle(el).boxShadow;
    expect(shadow(viaError)).toBe(shadow(viaAria));
    expect(shadow(viaError)).not.toBe(shadow(plain));
    // Only the border moves: the fill stays the variant's.
    expect(getComputedStyle(viaError).backgroundColor).toBe(getComputedStyle(plain).backgroundColor);
  });

  it('leaves the fill alone on an invalid soft field', () => {
    const { container } = render(
      <Theme>
        <TextField.Root variant="soft" aria-label="a" />
        <TextField.Root variant="soft" error aria-label="b" />
      </Theme>,
    );
    const [plain, invalid] = container.querySelectorAll<HTMLElement>('.rt-TextFieldRoot');
    expect(getComputedStyle(invalid).backgroundColor).toBe(getComputedStyle(plain).backgroundColor);
    expect(getComputedStyle(invalid).boxShadow).not.toBe(getComputedStyle(plain).boxShadow);
  });

  it('disables by colour, not opacity, with the arrow cursor', () => {
    const { container } = render(
      <Theme>
        <TextField.Root variant="outline" disabled placeholder="Name" aria-label="name" />
      </Theme>,
    );
    const root = container.querySelector<HTMLElement>('.rt-TextFieldRoot')!;
    const input = root.querySelector<HTMLInputElement>('input')!;
    expect(getComputedStyle(root).opacity).toBe('1');
    expect(getComputedStyle(input).opacity).toBe('1');
    expect(getComputedStyle(input, '::placeholder').opacity).toBe('1');
    expect(getComputedStyle(input).cursor).toBe('default');
  });
});
