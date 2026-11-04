import * as React from 'react';
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { Blockquote, Theme } from '../../../src/components/index';

describe('Blockquote in right-to-left text', () => {
  it('draws its bar and padding on the start side', () => {
    const { container } = render(
      <Theme>
        <div dir="rtl">
          <Blockquote>Quote</Blockquote>
        </div>
      </Theme>,
    );
    const s = getComputedStyle(container.querySelector('.kui-Blockquote')!);
    expect(parseFloat(s.borderRightWidth)).toBeGreaterThan(0);
    expect(parseFloat(s.paddingRight)).toBeGreaterThan(0);
    expect(parseFloat(s.borderLeftWidth)).toBe(0);
    expect(parseFloat(s.paddingLeft)).toBe(0);
  });

  it('keeps the bar on the left in left-to-right text', () => {
    const { container } = render(
      <Theme>
        <Blockquote>Quote</Blockquote>
      </Theme>,
    );
    const s = getComputedStyle(container.querySelector('.kui-Blockquote')!);
    expect(parseFloat(s.borderLeftWidth)).toBeGreaterThan(0);
    expect(parseFloat(s.borderRightWidth)).toBe(0);
  });
});
