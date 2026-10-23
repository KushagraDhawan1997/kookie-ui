import * as React from 'react';
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { Combobox, Select, Theme } from '../../../src/components/index';

const sizes = ['1', '2', '3', '4'] as const;
const heights = { '1': 28, '2': 32, '3': 40, '4': 48 };
const px = { '1': 8, '2': 10, '3': 13, '4': 16 };
const pill = { '1': 12, '2': 14, '3': 17, '4': 20 };

function Trigger(props: { size: (typeof sizes)[number]; radius?: 'full' | 'medium'; error?: boolean; variant?: 'surface' | 'ghost' }) {
  return (
    <Select.Root size={props.size} defaultValue="a">
      <Select.Trigger aria-label="Select" radius={props.radius} error={props.error} variant={props.variant} />
      <Select.Content>
        <Select.Item value="a">A</Select.Item>
      </Select.Content>
    </Select.Root>
  );
}

describe('Select and Combobox triggers on the control ladder', () => {
  for (const size of sizes) {
    it(`size ${size}: ${heights[size]}px tall, ${px[size]}px padding, ${pill[size]}px on the label edge at radius full`, () => {
      const { container } = render(
        <Theme radius="medium">
          <Trigger size={size} />
          <Trigger size={size} variant="ghost" />
          <Trigger size={size} radius="full" />
          <Combobox.Root size={size}>
            <Combobox.Trigger aria-label="Combobox" />
            <Combobox.Content>
              <Combobox.Item value="a">A</Combobox.Item>
            </Combobox.Content>
          </Combobox.Root>
        </Theme>,
      );
      const [plain, ghost, full, combobox] = container.querySelectorAll<HTMLElement>('.rt-SelectTrigger');
      for (const el of [plain, ghost, full, combobox]) {
        expect(el.getBoundingClientRect().height).toBe(heights[size]);
      }
      for (const el of [plain, ghost, combobox]) {
        expect(getComputedStyle(el).paddingLeft).toBe(`${px[size]}px`);
        expect(getComputedStyle(el).paddingRight).toBe(`${px[size]}px`);
      }
      expect(getComputedStyle(full).paddingLeft).toBe(`${pill[size]}px`);
      expect(getComputedStyle(full).paddingRight).toBe(`${px[size]}px`);
    });
  }

  it('styles an invalid trigger on aria-invalid, border only', () => {
    const { container } = render(
      <Theme>
        <Trigger size="2" variant="surface" />
        <Trigger size="2" variant="surface" error />
      </Theme>,
    );
    const [plain, invalid] = container.querySelectorAll<HTMLElement>('.rt-SelectTrigger');
    expect(invalid).toHaveAttribute('aria-invalid', 'true');
    expect(getComputedStyle(invalid).boxShadow).not.toBe(getComputedStyle(plain).boxShadow);
    expect(getComputedStyle(invalid).backgroundColor).toBe(getComputedStyle(plain).backgroundColor);
  });

  it('disables by colour, not opacity or pointer-events, with the arrow cursor', () => {
    const { container } = render(
      <Theme>
        {(['raised', 'soft', 'surface', 'outline', 'ghost'] as const).map((variant) => (
          <Select.Root key={variant} disabled>
            <Select.Trigger aria-label={variant} variant={variant} placeholder="Pick" />
            <Select.Content>
              <Select.Item value="a">A</Select.Item>
            </Select.Content>
          </Select.Root>
        ))}
      </Theme>,
    );
    for (const el of container.querySelectorAll<HTMLElement>('.rt-SelectTrigger')) {
      const style = getComputedStyle(el);
      expect(style.opacity).toBe('1');
      expect(style.pointerEvents).not.toBe('none');
      expect(style.cursor).toBe('default');
      const inner = el.querySelector<HTMLElement>('.rt-SelectTriggerInner')!;
      expect(getComputedStyle(inner).opacity).toBe('1');
    }
  });
});
