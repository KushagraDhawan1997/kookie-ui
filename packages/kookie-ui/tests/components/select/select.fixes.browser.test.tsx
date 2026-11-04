import * as React from 'react';
import { describe, it, expect, afterEach } from 'vitest';
import { cdp } from 'vitest/browser';
import { render } from '@testing-library/react';
import { Combobox, Select, Theme } from '../../../src/components/index';

const forcedColors = (value: 'active' | 'none') =>
  cdp().send('Emulation.setEmulatedMedia', { features: [{ name: 'forced-colors', value }] });

afterEach(async () => {
  await forcedColors('none');
});

function Picker({ dir, ...props }: React.ComponentProps<typeof Select.Trigger> & { dir?: 'ltr' | 'rtl' }) {
  return (
    <Select.Root defaultValue="a" dir={dir}>
      <Select.Trigger aria-label="Pick" {...props} />
      <Select.Content>
        <Select.Item value="a">Apple</Select.Item>
      </Select.Content>
    </Select.Root>
  );
}

describe('Select trigger in RTL', () => {
  it('puts the pill padding on the label side, which is the right', () => {
    const { container } = render(
      <Theme>
        <div dir="rtl">
          {/* Radix stamps its own dir on the trigger, so Root takes it too. */}
          <Picker radius="full" dir="rtl" />
        </div>
      </Theme>,
    );
    const style = getComputedStyle(container.querySelector<HTMLElement>('.kui-SelectTrigger')!);
    // Size 2: 10px plain, 14px at radius full.
    expect(style.paddingRight).toBe('14px');
    expect(style.paddingLeft).toBe('10px');
  });
});

describe('Select and Combobox loading', () => {
  it('sizes the spinner to the icon box and slows it under reduced motion', async () => {
    await cdp().send('Emulation.setEmulatedMedia', { features: [{ name: 'prefers-reduced-motion', value: 'reduce' }] });
    const { container } = render(
      <Theme>
        <Picker size="3" loading />
        <Combobox.Root>
          <Combobox.Trigger aria-label="Fruit" size="3" loading />
        </Combobox.Root>
      </Theme>,
    );
    for (const trigger of container.querySelectorAll<HTMLElement>('.kui-SelectTrigger')) {
      const icon = trigger.querySelector<HTMLElement>('.kui-SelectLoadingIcon')!;
      const spinner = icon.querySelector<HTMLElement>('.kui-Spinner')!;
      expect(spinner.getBoundingClientRect().width).toBe(icon.getBoundingClientRect().width);
      expect(getComputedStyle(spinner.querySelector('.kui-SpinnerWheel')!).animationDuration).not.toBe('0.8s');
    }
  });
});

describe('Select trigger in forced colors', () => {
  it('draws a real border in every variant', async () => {
    await forcedColors('active');
    const { container } = render(
      <Theme>
        {(['raised', 'surface', 'soft', 'ghost', 'outline'] as const).map((variant) => (
          <Picker key={variant} variant={variant} />
        ))}
      </Theme>,
    );
    for (const trigger of container.querySelectorAll<HTMLElement>('.kui-SelectTrigger')) {
      const style = getComputedStyle(trigger);
      expect(style.borderTopStyle).toBe('solid');
      expect(style.borderTopWidth).toBe('1px');
    }
  });
});

describe('Select.Item check mark', () => {
  const Glyph = () => (
    <svg viewBox="0 0 24 24" width="24" height="24" aria-hidden>
      <circle cx="12" cy="12" r="6" fill="currentColor" />
    </svg>
  );
  const centre = (r: DOMRect) => r.top + r.height / 2;

  function open(children: React.ReactNode) {
    render(
      <Theme>
        <Select.Root defaultValue="a" defaultOpen size="1">
          <Select.Trigger aria-label="Pick" />
          <Select.Content position="popper">{children}</Select.Content>
        </Select.Root>
      </Theme>,
    );
    const item = document.querySelector<HTMLElement>('.kui-SelectItem[data-state="checked"]')!;
    return { item: item.getBoundingClientRect(), mark: item.querySelector('.kui-SelectItemIndicator')!.getBoundingClientRect() };
  }

  it('is centred on a one-line item with an icon, even when the icon makes the row taller', () => {
    const { item, mark } = open(
      <Select.Item value="a">
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
          <Glyph />
          Sphere
        </span>
      </Select.Item>,
    );
    expect(centre(mark)).toBeCloseTo(centre(item), 0);
  });

  it('stays on the first line of an item that wraps', () => {
    const { item, mark } = open(
      <Select.Item value="a">
        <span style={{ display: 'flex', flexDirection: 'column' }}>
          <span>Sphere</span>
          <span>A round primitive with a radius</span>
        </span>
      </Select.Item>,
    );
    expect(centre(mark)).toBeLessThan(centre(item) - 4);
  });
});
