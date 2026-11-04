import * as React from 'react';
import { describe, it, expect, afterEach } from 'vitest';
import { cdp } from 'vitest/browser';
import { render } from '@testing-library/react';
import { TextField, Theme } from '../../../src/components/index';

const rect = (el: Element) => el.getBoundingClientRect();
const forcedColors = (value: 'active' | 'none') =>
  cdp().send('Emulation.setEmulatedMedia', { features: [{ name: 'forced-colors', value }] });

afterEach(async () => {
  await forcedColors('none');
});

describe('TextField error message', () => {
  it('sits below the field and leaves the input its full width', () => {
    const { container } = render(
      <Theme>
        <div style={{ width: 300 }}>
          <TextField.Root variant="outline" aria-label="Name" error errorMessage="Name is required" />
        </div>
      </Theme>,
    );
    const root = container.querySelector<HTMLElement>('.kui-TextFieldRoot')!;
    const input = root.querySelector<HTMLElement>('.kui-TextFieldInput')!;
    const message = container.querySelector<HTMLElement>('.kui-TextFieldErrorMessage')!;
    expect(rect(message).top).toBeGreaterThanOrEqual(rect(root).bottom);
    expect(rect(input).width).toBeCloseTo(rect(root).width - 2, 0);
    expect(rect(root).height).toBe(32);
  });
});

describe('TextField error message in a form grid', () => {
  it('takes one cell, so later labels stay in their column', () => {
    const { getByText } = render(
      <Theme>
        <div style={{ display: 'grid', gridTemplateColumns: '120px 200px', width: 320 }}>
          <span>Email</span>
          <TextField.Root aria-label="Email" error errorMessage="Email is required" />
          <span>Name</span>
          <TextField.Root aria-label="Name" />
        </div>
      </Theme>,
    );
    expect(rect(getByText('Name')).left).toBe(rect(getByText('Email')).left);
  });
});

describe('TextField in RTL', () => {
  it('mirrors slot and input padding', () => {
    const { container } = render(
      <Theme>
        <div dir="rtl" style={{ width: 300 }}>
          <TextField.Root variant="outline" radius="medium" aria-label="Search">
            <TextField.Slot side="left">
              <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden>
                <circle cx="8" cy="8" r="4" />
              </svg>
            </TextField.Slot>
          </TextField.Root>
        </div>
      </Theme>,
    );
    const root = container.querySelector<HTMLElement>('.kui-TextFieldRoot')!;
    const slot = root.querySelector<HTMLElement>('.kui-TextFieldSlot')!;
    const input = root.querySelector<HTMLElement>('.kui-TextFieldInput')!;
    const slotStyle = getComputedStyle(slot);
    const inputStyle = getComputedStyle(input);

    // The start slot sits on the right, its outer (right) edge padded 10px and its inner edge the 8px gap.
    expect(rect(slot).right).toBeCloseTo(rect(root).right, 0);
    expect(slotStyle.paddingRight).toBe('10px');
    expect(slotStyle.paddingLeft).toBe('8px');
    // The input's start edge, next to the slot, is bare; its end edge (left) keeps the padding.
    expect(inputStyle.paddingRight).toBe('0px');
    expect(inputStyle.paddingLeft).toBe('9px');
  });
});

describe('TextField in forced colors', () => {
  it('draws a real border in every variant', async () => {
    await forcedColors('active');
    const { container } = render(
      <Theme>
        {(['raised', 'surface', 'soft', 'ghost', 'outline'] as const).map((variant) => (
          <TextField.Root key={variant} variant={variant} aria-label={variant} />
        ))}
        <TextField.Root aria-label="disabled" disabled />
      </Theme>,
    );
    for (const root of container.querySelectorAll<HTMLElement>('.kui-TextFieldRoot')) {
      const style = getComputedStyle(root);
      expect(style.borderTopStyle).toBe('solid');
      expect(style.borderTopWidth).toBe('1px');
    }
  });
});
