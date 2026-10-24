import * as React from 'react';
import { describe, it, expect, afterEach } from 'vitest';
import { cdp } from 'vitest/browser';
import { render } from '@testing-library/react';
import { Checkbox, CheckboxGroup, Radio, RadioGroup, Theme } from '../../../src/components/index';

const emulate = (features: { name: string; value: string }[]) => cdp().send('Emulation.setEmulatedMedia', { features });

afterEach(async () => {
  await emulate([]);
});

const fill = (el: Element) => getComputedStyle(el, '::before').backgroundColor;

describe('Checkbox disabled colours', () => {
  it('keep each variant’s own disabled fill', () => {
    const { container } = render(
      <Theme>
        <Checkbox disabled variant="outline" aria-label="Outline" />
        <Checkbox disabled variant="surface" aria-label="Surface" />
        <Checkbox disabled variant="soft" aria-label="Soft" />
        <CheckboxGroup.Root disabled variant="outline" aria-label="Group">
          <CheckboxGroup.Item value="a">A</CheckboxGroup.Item>
        </CheckboxGroup.Root>
      </Theme>,
    );
    const [outline, surface, soft] = container.querySelectorAll('.kui-CheckboxRoot');
    expect(fill(outline)).toBe('rgba(0, 0, 0, 0)');
    expect(fill(surface)).not.toBe(fill(soft));
    expect(fill(container.querySelector('.kui-CheckboxGroupItemCheckbox')!)).toBe('rgba(0, 0, 0, 0)');
  });
});

describe('Checkbox and Radio in forced colours', () => {
  it('draw the box and ring with a border', async () => {
    await emulate([{ name: 'forced-colors', value: 'active' }]);
    const { container } = render(
      <Theme>
        <Checkbox aria-label="Check" />
        <Radio value="a" aria-label="Radio" />
        <RadioGroup.Root defaultValue="a" aria-label="Group">
          <RadioGroup.Item value="a">A</RadioGroup.Item>
        </RadioGroup.Root>
      </Theme>,
    );
    for (const selector of ['.kui-CheckboxRoot', '.kui-RadioRoot', '.kui-RadioGroupItem .kui-BaseRadioRoot']) {
      const mark = getComputedStyle(container.querySelector(selector)!, '::before');
      expect(mark.borderTopStyle, selector).toBe('solid');
      expect(mark.borderTopWidth, selector).toBe('1px');
      // The border sits inside the box, so the mark keeps its size.
      expect(mark.width, selector).toBe('20px');
    }
  });
});
