import * as React from 'react';
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { Checkbox, CheckboxCards, Radio, SegmentedControl, Slider, Switch, Tabs, Theme } from '../../../src/components/index';

const box = (el: Element, pseudo = '::before') => {
  const style = getComputedStyle(el, pseudo);
  return [parseFloat(style.width), parseFloat(style.height)];
};

// v2's mark ladder: Checkbox and Radio share one box per size; Switch's track is one index up.
const MARK = { '1': 16, '2': 20, '3': 24, '4': 26 } as const;
const TRACK = { '1': [34, 20], '2': [40, 24], '3': [44, 26], '4': [48, 28] } as const;

describe('choice controls on the v2 ladders', () => {
  for (const size of ['1', '2', '3', '4'] as const) {
    it(`size ${size}`, () => {
      const { container } = render(
        <Theme>
          <Checkbox size={size} aria-label="Check" />
          <Radio size={size} value="a" aria-label="Radio" />
          <Switch size={size} aria-label="Switch" />
          <SegmentedControl.Root size={size} defaultValue="a">
            <SegmentedControl.Item value="a">A</SegmentedControl.Item>
            <SegmentedControl.Item value="b">B</SegmentedControl.Item>
          </SegmentedControl.Root>
          <Slider size={size} defaultValue={[50]} aria-label="Slider" />
          <Tabs.Root defaultValue="a">
            <Tabs.List size={size}>
              <Tabs.Trigger value="a">Tab</Tabs.Trigger>
            </Tabs.List>
          </Tabs.Root>
        </Theme>,
      );
      expect(box(container.querySelector('.rt-CheckboxRoot')!)).toEqual([MARK[size], MARK[size]]);
      expect(box(container.querySelector('.rt-RadioRoot')!)).toEqual([MARK[size], MARK[size]]);
      expect(box(container.querySelector('.rt-SwitchRoot')!)).toEqual([...TRACK[size]]);

      const height = { '1': 28, '2': 32, '3': 40, '4': 48 }[size];
      const px = { '1': 8, '2': 10, '3': 13, '4': 16 }[size];
      const segmented = container.querySelector('.rt-SegmentedControlRoot')!;
      expect(segmented.getBoundingClientRect().height).toBe(height);
      const label = getComputedStyle(container.querySelector('.rt-SegmentedControlItemLabel')!);
      expect(parseFloat(label.paddingInlineStart)).toBe(px);
      const inner = getComputedStyle(container.querySelector('.rt-BaseTabListTriggerInner')!);
      expect(parseFloat(inner.paddingInlineStart)).toBe(px);
      expect(container.querySelector('.rt-BaseTabListTrigger')!.getBoundingClientRect().height).toBe(height);

      // Track on v2's slider ladder; the thumb keeps v1's paint (thumb box + v1 overshoot).
      const track = container.querySelector('.rt-SliderTrack')!.getBoundingClientRect().height;
      expect(track).toBe({ '1': 4, '2': 5, '3': 6, '4': 7 }[size]);
      const thumb = box(container.querySelector('.rt-SliderThumb')!, '::after');
      expect(thumb).toEqual([...{ '1': [14, 10], '2': [19, 15], '3': [20, 16], '4': [25, 21] }[size]]);
    });
  }

  it('disabled marks keep a default cursor and full opacity', () => {
    const { container } = render(
      <Theme>
        <Checkbox disabled aria-label="Check" />
        <Radio disabled value="a" aria-label="Radio" />
        <Switch disabled aria-label="Switch" />
      </Theme>,
    );
    for (const selector of ['.rt-CheckboxRoot', '.rt-RadioRoot', '.rt-SwitchRoot']) {
      const el = container.querySelector(selector)!;
      expect(getComputedStyle(el).cursor, selector).toBe('default');
      expect(getComputedStyle(el).opacity, selector).toBe('1');
    }
  });

  it('CheckboxCards rings its card, not the mark inside it', () => {
    const { container } = render(
      <Theme>
        <CheckboxCards.Root defaultValue={[]}>
          <CheckboxCards.Item value="a">A</CheckboxCards.Item>
        </CheckboxCards.Root>
      </Theme>,
    );
    const mark = container.querySelector<HTMLElement>('.rt-CheckboxCardCheckbox')!;
    mark.focus();
    expect(mark.matches(':focus-visible')).toBe(true);
    expect(getComputedStyle(mark, '::before').outlineStyle).toBe('none');
  });
});
