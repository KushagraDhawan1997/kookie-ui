import * as React from 'react';
import { describe, it, expect, afterEach } from 'vitest';
import { cdp } from 'vitest/browser';
import { render, screen } from '@testing-library/react';
import { Button, Theme, Toggle } from '../../../src/components/index';

const ICON = { '1': 16, '2': 16, '3': 20, '4': 24 } as const;

const Icon = () => (
  <svg viewBox="0 0 24 24" data-testid="icon">
    <path d="M4 12h16" />
  </svg>
);

const emulate = (features: { name: string; value: string }[]) =>
  cdp().send('Emulation.setEmulatedMedia', { features });

afterEach(async () => {
  await emulate([]);
});

describe('Button in RTL', () => {
  it('puts a leading icon at the inline start, on the side with the plain padding', () => {
    render(
      <Theme radius="full">
        <div dir="rtl">
          <Button>
            <Icon />
            Label
          </Button>
        </div>
      </Theme>,
    );
    const button = screen.getByRole('button', { name: 'Label' });
    const icon = screen.getByTestId('icon');
    const style = getComputedStyle(button);
    expect(style.flexDirection).toBe('row');
    // RTL inline start is the right side.
    expect(icon.getBoundingClientRect().right).toBeGreaterThan(button.getBoundingClientRect().right - 20);
    expect(style.paddingRight).toBe('10px');
    expect(style.paddingLeft).toBe('14px');
  });
});

describe('Toggle in forced colors', () => {
  it('a pressed toggle looks different from an unpressed one', async () => {
    await emulate([{ name: 'forced-colors', value: 'active' }]);
    render(
      <Theme>
        <Toggle>Off</Toggle>
        <Toggle defaultPressed>On</Toggle>
      </Theme>,
    );
    const off = getComputedStyle(screen.getByRole('button', { name: 'Off' }));
    const on = getComputedStyle(screen.getByRole('button', { name: 'On' }));
    expect(on.backgroundColor).not.toBe(off.backgroundColor);
    expect(on.color).not.toBe(off.color);
  });
});

describe('the loading spinner rides the icon ladder', () => {
  for (const size of ['1', '2', '3', '4'] as const) {
    it(`is ${ICON[size]}px at size ${size}`, () => {
      const { container } = render(
        <Theme>
          <Button size={size} loading>
            Save
          </Button>
        </Theme>,
      );
      const spinner = container.querySelector<HTMLElement>('.kui-Spinner')!.getBoundingClientRect();
      expect(spinner.width).toBe(ICON[size]);
      expect(spinner.height).toBe(ICON[size]);
    });
  }
});
