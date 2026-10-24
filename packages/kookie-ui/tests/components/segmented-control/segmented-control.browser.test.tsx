import * as React from 'react';
import { describe, it, expect } from 'vitest';
import { render, fireEvent } from '@testing-library/react';
import { SegmentedControl, Theme } from '../../../src/components/index';

const values = Array.from({ length: 12 }, (_, i) => `item-${i + 1}`);

function rects(root: Element) {
  const indicator = root.querySelector('.kui-SegmentedControlIndicator')!.getBoundingClientRect();
  const on = root.querySelector('.kui-SegmentedControlItem[data-state="on"]')!.getBoundingClientRect();
  return { indicator, on };
}

describe('SegmentedControl indicator', () => {
  it('sits on the selected segment past ten items', () => {
    const { container } = render(
      <Theme>
        <SegmentedControl.Root defaultValue="item-12" style={{ width: 600 }}>
          {values.map((value) => (
            <SegmentedControl.Item key={value} value={value}>
              {value.slice(5)}
            </SegmentedControl.Item>
          ))}
        </SegmentedControl.Root>
      </Theme>,
    );
    const { indicator, on } = rects(container.querySelector('.kui-SegmentedControlRoot')!);
    expect(indicator.width).toBeCloseTo(on.width, 0);
    expect(indicator.left).toBeCloseTo(on.left, 0);
  });

  it('follows the selection, including items inside a fragment', () => {
    const { container } = render(
      <Theme>
        <SegmentedControl.Root defaultValue="a" style={{ width: 300 }}>
          <SegmentedControl.Item value="a">A</SegmentedControl.Item>
          <>
            <SegmentedControl.Item value="b">B</SegmentedControl.Item>
            <SegmentedControl.Item value="c">C</SegmentedControl.Item>
          </>
        </SegmentedControl.Root>
      </Theme>,
    );
    const root = container.querySelector('.kui-SegmentedControlRoot')!;
    fireEvent.click(root.querySelectorAll('.kui-SegmentedControlItem')[2]);
    const { indicator, on } = rects(root);
    expect(indicator.width).toBeCloseTo(on.width, 0);
    expect(indicator.left).toBeCloseTo(on.left, 0);
  });
});

describe('SegmentedControl.Item disabled', () => {
  it('disables one segment and leaves the others selectable', () => {
    const { container } = render(
      <Theme>
        <SegmentedControl.Root defaultValue="a">
          <SegmentedControl.Item value="a">A</SegmentedControl.Item>
          <SegmentedControl.Item value="b" disabled>
            B
          </SegmentedControl.Item>
          <SegmentedControl.Item value="c">C</SegmentedControl.Item>
        </SegmentedControl.Root>
      </Theme>,
    );
    const [a, b, c] = container.querySelectorAll<HTMLButtonElement>('.kui-SegmentedControlItem');
    expect(b).toBeDisabled();
    expect(a).not.toBeDisabled();
    fireEvent.click(b);
    expect(b).toHaveAttribute('data-state', 'off');
    fireEvent.click(c);
    expect(c).toHaveAttribute('data-state', 'on');
    // The indicator keeps its normal look: only a disabled selected segment greys it.
    const indicator = container.querySelector('.kui-SegmentedControlIndicator')!;
    expect(getComputedStyle(indicator, '::before').boxShadow).not.toBe('none');
  });
});
