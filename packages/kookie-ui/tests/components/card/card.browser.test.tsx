import * as React from 'react';
import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import { Box, Card, CheckboxCards, RadioCards, Theme } from '../../../src/components/index';

// Theme defaults: radius `full` (surface factor 1), scale 1, size 2.
const PADDING = { '1': 16, '2': 24, '3': 32, '4': 40 } as const;
const CORNER = { '1': 10, '2': 16, '3': 22, '4': 28 } as const;
const SIZES = ['1', '2', '3', '4'] as const;

const px = (value: string) => parseFloat(value);

function box(el: Element) {
  const style = getComputedStyle(el);
  return {
    pads: [style.paddingTop, style.paddingRight, style.paddingBottom, style.paddingLeft].map(px),
    corner: px(style.borderTopLeftRadius),
    rect: el.getBoundingClientRect(),
  };
}

describe('Card geometry', () => {
  it('rests at size 2', () => {
    const { container } = render(
      <Theme>
        <Card />
      </Theme>,
    );
    const { pads, corner } = box(container.querySelector('.rt-Card')!);
    expect(pads).toEqual([24, 24, 24, 24]);
    expect(corner).toBe(16);
  });

  for (const size of SIZES) {
    it(`size ${size} pads --surface-p-${size} and draws --radius-surface-${size}`, () => {
      const { container } = render(
        <Theme>
          <Card size={size} />
        </Theme>,
      );
      const { pads, corner } = box(container.querySelector('.rt-Card')!);
      expect(pads).toEqual(Array(4).fill(PADDING[size]));
      expect(corner).toBe(CORNER[size]);
    });
  }

  it('follows the Theme size', () => {
    const { container } = render(
      <Theme size="4">
        <Card />
      </Theme>,
    );
    const { pads, corner } = box(container.querySelector('.rt-Card')!);
    expect(pads[0]).toBe(40);
    expect(corner).toBe(28);
  });

  it('a Card in a Card is concentric: outer corner minus outer padding, never below 0', () => {
    for (const outer of SIZES) {
      for (const inner of SIZES) {
        const { container, unmount } = render(
          <Theme>
            <Card size={outer}>
              <Card size={inner} />
            </Card>
          </Theme>,
        );
        const [, nested] = container.querySelectorAll('.rt-Card');
        const expected = Math.min(Math.max(0, CORNER[outer] - PADDING[outer]), CORNER[inner]);
        const { pads, corner } = box(nested);
        expect(corner, `${outer} > ${inner}`).toBe(expected);
        expect(pads[0], `${outer} > ${inner}`).toBe(PADDING[inner]);
        unmount();
      }
    }
  });

  it('nesting crosses an element in between', () => {
    const { container } = render(
      <Theme>
        <Card size="2">
          <div>
            <Card size="2" />
          </div>
        </Card>
      </Theme>,
    );
    const [, nested] = container.querySelectorAll('.rt-Card');
    expect(box(nested).corner).toBe(0);
  });
});

describe('bleed', () => {
  for (const size of SIZES) {
    it(`runs a child to the edge of a size ${size} Card`, () => {
      const { container } = render(
        <Theme>
          <Card size={size} style={{ width: 300 }}>
            <Box mx="bleed" mt="bleed" data-testid="b" style={{ height: 20 }} />
            <Box m="bleed" data-testid="all" style={{ height: 20 }} />
          </Card>
        </Theme>,
      );
      const cardRect = container.querySelector('.rt-Card')!.getBoundingClientRect();
      const bled = container.querySelector('[data-testid="b"]')!.getBoundingClientRect();
      expect(bled.left).toBeCloseTo(cardRect.left, 1);
      expect(bled.right).toBeCloseTo(cardRect.right, 1);
      expect(bled.top).toBeCloseTo(cardRect.top, 1);
      const all = container.querySelector('[data-testid="all"]')!;
      const style = getComputedStyle(all);
      expect([style.marginTop, style.marginRight, style.marginBottom, style.marginLeft].map(px)).toEqual(
        Array(4).fill(-PADDING[size]),
      );
    });
  }

  it('each side reaches only its own edge', () => {
    const { container } = render(
      <Theme>
        <Card size="2">
          {(['mt', 'mr', 'mb', 'ml'] as const).map((side) => (
            <Box key={side} {...{ [side]: 'bleed' }} data-side={side} />
          ))}
        </Card>
      </Theme>,
    );
    const margins = (side: string) => {
      const style = getComputedStyle(container.querySelector(`[data-side="${side}"]`)!);
      return [style.marginTop, style.marginRight, style.marginBottom, style.marginLeft].map(px);
    };
    expect(margins('mt')).toEqual([-24, 0, 0, 0]);
    expect(margins('mr')).toEqual([0, -24, 0, 0]);
    expect(margins('mb')).toEqual([0, 0, -24, 0]);
    expect(margins('ml')).toEqual([0, 0, 0, -24]);
  });

  it('is 0 outside any surface', () => {
    const { container } = render(
      <Theme>
        <Box m="bleed" data-testid="b" />
      </Theme>,
    );
    expect(px(getComputedStyle(container.querySelector('[data-testid="b"]')!).marginTop)).toBe(0);
  });
});

describe('CheckboxCards and RadioCards items', () => {
  for (const size of SIZES) {
    it(`size ${size} items sit on the surface ladder`, () => {
      const { container } = render(
        <Theme>
          <CheckboxCards.Root size={size}>
            <CheckboxCards.Item value="a">A</CheckboxCards.Item>
          </CheckboxCards.Root>
          <RadioCards.Root size={size}>
            <RadioCards.Item value="a">A</RadioCards.Item>
          </RadioCards.Root>
        </Theme>,
      );
      for (const selector of ['.rt-CheckboxCardsItem', '.rt-RadioCardsItem']) {
        const { pads, corner } = box(container.querySelector(selector)!);
        expect(pads[0], selector).toBe(PADDING[size]);
        expect(pads[2], selector).toBe(PADDING[size]);
        expect(pads[3], selector).toBe(PADDING[size]);
        expect(corner, selector).toBe(CORNER[size]);
      }
    });
  }

  it('unset items rest at size 2', () => {
    const { container } = render(
      <Theme>
        <CheckboxCards.Root>
          <CheckboxCards.Item value="a">A</CheckboxCards.Item>
        </CheckboxCards.Root>
        <RadioCards.Root>
          <RadioCards.Item value="a">A</RadioCards.Item>
        </RadioCards.Root>
      </Theme>,
    );
    for (const selector of ['.rt-CheckboxCardsItem', '.rt-RadioCardsItem']) {
      const { pads, corner } = box(container.querySelector(selector)!);
      expect(pads[0], selector).toBe(24);
      expect(corner, selector).toBe(16);
    }
  });

  it('the checkbox sits inside the right padding', () => {
    const { container } = render(
      <Theme>
        <CheckboxCards.Root size="2">
          <CheckboxCards.Item value="a">A</CheckboxCards.Item>
        </CheckboxCards.Root>
      </Theme>,
    );
    const item = container.querySelector('.rt-CheckboxCardsItem')!;
    const mark = item.querySelector('.rt-CheckboxCardCheckbox, .rt-BaseCheckboxRoot, button')!;
    const itemRect = item.getBoundingClientRect();
    const markRect = mark.getBoundingClientRect();
    expect(markRect.right).toBeCloseTo(itemRect.right - 24, 0);
    expect(itemRect.right - markRect.left).toBeLessThanOrEqual(px(getComputedStyle(item).paddingRight));
  });
});
