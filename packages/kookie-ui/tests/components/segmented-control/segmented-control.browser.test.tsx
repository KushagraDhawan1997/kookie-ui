import * as React from 'react';
import { describe, it, expect, afterEach } from 'vitest';
import { cdp, userEvent } from 'vitest/browser';
import { render, fireEvent } from '@testing-library/react';
import { Direction } from 'radix-ui';
import { SegmentedControl, Theme } from '../../../src/components/index';

const emulate = (features: { name: string; value: string }[]) => cdp().send('Emulation.setEmulatedMedia', { features });

afterEach(async () => {
  await emulate([]);
});

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

function Bar(props: Omit<React.ComponentProps<typeof SegmentedControl.Root>, 'children'>) {
  return (
    <SegmentedControl.Root defaultValue="a" {...props}>
      <SegmentedControl.Item value="a">A</SegmentedControl.Item>
      <SegmentedControl.Item value="b">B</SegmentedControl.Item>
      <SegmentedControl.Item value="c">C</SegmentedControl.Item>
    </SegmentedControl.Root>
  );
}

describe('SegmentedControl responsive orientation', () => {
  // The test viewport is 1280px wide, so `md` applies.
  it('turns vertical at a breakpoint, items and indicator included', () => {
    const { container } = render(
      <Theme>
        <Bar orientation={{ initial: 'horizontal', md: 'vertical' }} />
      </Theme>,
    );
    const root = container.querySelector('.kui-SegmentedControlRoot')!;
    expect(getComputedStyle(root).gridAutoFlow).toBe('row');
    const item = root.querySelector('.kui-SegmentedControlItem')!;
    expect(getComputedStyle(item).flexDirection).toBe('column');
    const { indicator, on } = rects(root);
    expect(indicator.width).toBeCloseTo(on.width, 0);
    expect(indicator.height).toBeCloseTo(on.height, 0);
    expect(indicator.top).toBeCloseTo(on.top, 0);
  });

  it('turns horizontal at a breakpoint, items and indicator included', () => {
    const { container } = render(
      <Theme>
        <Bar orientation={{ initial: 'vertical', md: 'horizontal' }} />
      </Theme>,
    );
    const root = container.querySelector('.kui-SegmentedControlRoot')!;
    expect(getComputedStyle(root).gridAutoFlow).toBe('column');
    const item = root.querySelector('.kui-SegmentedControlItem')!;
    expect(getComputedStyle(item).flexDirection).toBe('row');
    expect(root.getBoundingClientRect().height).toBe(32);
    const { indicator, on } = rects(root);
    expect(indicator.width).toBeCloseTo(on.width, 0);
    expect(indicator.left).toBeCloseTo(on.left, 0);
  });
});

describe('SegmentedControl right to left', () => {
  it('puts the indicator under the selected segment and rounds the outer ends', () => {
    const { container } = render(
      <Theme>
        <Direction.Provider dir="rtl">
          <div dir="rtl">
            <Bar defaultValue="a" style={{ width: 300 }} />
          </div>
        </Direction.Provider>
      </Theme>,
    );
    const root = container.querySelector('.kui-SegmentedControlRoot')!;
    let { indicator, on } = rects(root);
    expect(indicator.left).toBeCloseTo(on.left, 0);
    fireEvent.click(root.querySelectorAll('.kui-SegmentedControlItem')[1]);
    ({ indicator, on } = rects(root));
    expect(indicator.left).toBeCloseTo(on.left, 0);

    const [first, , last] = root.querySelectorAll('.kui-SegmentedControlItem');
    expect(first.getBoundingClientRect().left).toBeGreaterThan(last.getBoundingClientRect().left);
    expect(getComputedStyle(first).borderTopRightRadius).not.toBe('0px');
    expect(getComputedStyle(first).borderTopLeftRadius).toBe('0px');
    expect(getComputedStyle(last).borderTopLeftRadius).not.toBe('0px');
  });
});

describe('SegmentedControl keyboard', () => {
  it('selects as the arrow keys move focus, as a radio group does', async () => {
    const { container } = render(
      <Theme>
        <Bar />
      </Theme>,
    );
    const [a, b, c] = container.querySelectorAll<HTMLButtonElement>('.kui-SegmentedControlItem');
    a.focus();
    await userEvent.keyboard('{ArrowRight}');
    await expect.poll(() => document.activeElement).toBe(b);
    expect(b).toHaveAttribute('aria-checked', 'true');
    expect(a).toHaveAttribute('aria-checked', 'false');
    await userEvent.keyboard('{End}');
    await expect.poll(() => document.activeElement).toBe(c);
    expect(c).toHaveAttribute('aria-checked', 'true');
  });

  it('does not select when a segment only takes focus from Tab', async () => {
    const { container } = render(
      <Theme>
        <button type="button">Before</button>
        <Bar defaultValue="b" />
      </Theme>,
    );
    container.querySelector('button')!.focus();
    await userEvent.keyboard('{Tab}');
    const [a, b] = container.querySelectorAll('.kui-SegmentedControlItem');
    expect(b).toHaveAttribute('aria-checked', 'true');
    expect(a).toHaveAttribute('aria-checked', 'false');
  });
});

describe('SegmentedControl disabled', () => {
  it('puts no global .disabled class on the root', () => {
    const { container } = render(
      <Theme>
        <Bar disabled />
      </Theme>,
    );
    const root = container.querySelector('.kui-SegmentedControlRoot')!;
    expect(root).not.toHaveClass('disabled');
    expect(root).toHaveAttribute('data-disabled');
  });
});

describe('SegmentedControl in forced colours', () => {
  it('draws the bar with a border and the selected segment in a system colour', async () => {
    await emulate([{ name: 'forced-colors', value: 'active' }]);
    const { container } = render(
      <Theme>
        <Bar />
      </Theme>,
    );
    const root = getComputedStyle(container.querySelector('.kui-SegmentedControlRoot')!);
    expect(root.borderTopStyle).toBe('solid');
    const indicator = getComputedStyle(container.querySelector('.kui-SegmentedControlIndicator')!, '::before');
    const canvas = getComputedStyle(document.body).backgroundColor;
    expect(indicator.backgroundColor).not.toBe(canvas);
  });
});

describe('SegmentedControl variant', () => {
  const track = (container: HTMLElement) => getComputedStyle(container.querySelector('.kui-SegmentedControlRoot')!);
  const indicator = (container: HTMLElement) => getComputedStyle(container.querySelector('.kui-SegmentedControlIndicator')!, '::before');

  it('is soft by default: a filled track and a raised indicator', () => {
    const { container } = render(
      <Theme>
        <Bar />
      </Theme>,
    );
    expect(track(container).backgroundColor).not.toBe('rgba(0, 0, 0, 0)');
    expect(track(container).boxShadow).toBe('none');
    expect(indicator(container).boxShadow).not.toBe('none');
  });

  it('raised wears the raised field edge, with a soft indicator inset from it', () => {
    const { container } = render(
      <Theme>
        <Bar variant="raised" />
      </Theme>,
    );
    expect(track(container).boxShadow).not.toBe('none');
    expect(indicator(container).boxShadow).toBe('none');
    expect(indicator(container).top).toBe('2px');
  });

  it('outline has no fill, only a hairline edge', () => {
    const { container } = render(
      <Theme>
        <Bar variant="outline" />
      </Theme>,
    );
    expect(track(container).backgroundColor).toBe('rgba(0, 0, 0, 0)');
    expect(track(container).boxShadow).toMatch(/inset/);
    expect(indicator(container).boxShadow).toBe('none');
  });
});
