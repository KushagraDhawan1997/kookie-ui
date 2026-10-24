import * as React from 'react';
import { describe, it, expect, afterEach } from 'vitest';
import { cdp } from 'vitest/browser';
import { render } from '@testing-library/react';
import { TextArea, Theme } from '../../../src/components/index';

const rect = (el: Element) => el.getBoundingClientRect();
const forcedColors = (value: 'active' | 'none') =>
  cdp().send('Emulation.setEmulatedMedia', { features: [{ name: 'forced-colors', value }] });

afterEach(async () => {
  await forcedColors('none');
});

describe('TextArea error message', () => {
  it('sits below the box, outside its border', () => {
    const { container } = render(
      <Theme>
        <div style={{ width: 300 }}>
          <TextArea variant="outline" aria-label="Notes" error errorMessage="Describe the problem" />
        </div>
      </Theme>,
    );
    const root = container.querySelector<HTMLElement>('.kui-TextAreaRoot')!;
    const message = container.querySelector<HTMLElement>('.kui-TextAreaErrorMessage')!;
    expect(root.contains(message)).toBe(false);
    expect(rect(message).top).toBeGreaterThanOrEqual(rect(root).bottom);
    expect(rect(message).left).toBe(rect(root).left);
  });
});

describe('TextArea in forced colors', () => {
  it('draws a real border in every variant', async () => {
    await forcedColors('active');
    const { container } = render(
      <Theme>
        {(['raised', 'surface', 'soft', 'ghost', 'outline'] as const).map((variant) => (
          <TextArea key={variant} variant={variant} aria-label={variant} />
        ))}
      </Theme>,
    );
    for (const root of container.querySelectorAll<HTMLElement>('.kui-TextAreaRoot')) {
      const style = getComputedStyle(root);
      expect(style.borderTopStyle).toBe('solid');
      expect(style.borderTopWidth).toBe('1px');
    }
  });
});
