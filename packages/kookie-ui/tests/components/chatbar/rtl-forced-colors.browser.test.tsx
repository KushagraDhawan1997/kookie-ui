import * as React from 'react';
import { describe, it, expect, afterEach } from 'vitest';
import { cdp } from 'vitest/browser';
import { render, screen } from '@testing-library/react';
import { Button, Chatbar, Theme } from '../../../src/components/index';

const rect = (el: Element) => el.getBoundingClientRect();
const forcedColors = (value: 'active' | 'none') =>
  cdp().send('Emulation.setEmulatedMedia', { features: [{ name: 'forced-colors', value }] });

afterEach(async () => {
  await forcedColors('none');
});

describe('Chatbar.Row in RTL', () => {
  it('keeps RowEnd at the far (left) edge', () => {
    const { container } = render(
      <Theme>
        <div dir="rtl" style={{ width: 500 }}>
          <Chatbar.Root open>
            <Chatbar.Textarea aria-label="Message" />
            <Chatbar.Row>
              <Chatbar.RowStart>
                <Button iconOnly aria-label="Attach">
                  +
                </Button>
              </Chatbar.RowStart>
              <Chatbar.RowEnd>
                <Button iconOnly aria-label="Send">
                  ↑
                </Button>
              </Chatbar.RowEnd>
            </Chatbar.Row>
          </Chatbar.Root>
        </div>
      </Theme>,
    );
    const start = container.querySelector<HTMLElement>('.kui-ChatbarRowStart')!;
    const end = container.querySelector<HTMLElement>('.kui-ChatbarRowEnd')!;
    const box = container.querySelector<HTMLElement>('.kui-ChatbarBox')!;
    expect(rect(start).right).toBeGreaterThan(rect(box).right - 40);
    expect(rect(end).left).toBeLessThan(rect(box).left + 40);
  });
});

describe('Chatbar in forced colors', () => {
  it('draws a real border in every variant', async () => {
    await forcedColors('active');
    const { container } = render(
      <Theme>
        {(['raised', 'surface', 'soft', 'ghost', 'outline'] as const).map((variant) => (
          <Chatbar.Root key={variant} variant={variant}>
            <Chatbar.Textarea aria-label={variant} />
          </Chatbar.Root>
        ))}
      </Theme>,
    );
    for (const box of container.querySelectorAll<HTMLElement>('.kui-ChatbarBox')) {
      const style = getComputedStyle(box);
      expect(style.borderTopStyle).toBe('solid');
      expect(style.borderTopWidth).toBe('1px');
    }
  });

  it('outlines the focused raised box', async () => {
    await forcedColors('active');
    render(
      <Theme>
        <Chatbar.Root>
          <Chatbar.Textarea aria-label="Message" />
        </Chatbar.Root>
      </Theme>,
    );
    const textarea = screen.getByRole('textbox', { name: 'Message' });
    textarea.focus();
    const box = textarea.closest<HTMLElement>('.kui-ChatbarBox')!;
    expect(box).toHaveClass('kui-variant-raised');
    const style = getComputedStyle(box);
    expect(style.outlineStyle).toBe('solid');
    expect(parseFloat(style.outlineWidth)).toBeGreaterThan(0);
  });
});
