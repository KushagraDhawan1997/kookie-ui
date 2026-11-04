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
  it('remap to the neutral disabled fill, unchecked or checked, alone or in a group', () => {
    const { container } = render(
      <Theme>
        <Checkbox aria-label="Live" />
        <Checkbox disabled aria-label="Off" />
        <Checkbox disabled defaultChecked aria-label="On" />
        <CheckboxGroup.Root disabled aria-label="Group">
          <CheckboxGroup.Item value="a">A</CheckboxGroup.Item>
        </CheckboxGroup.Root>
      </Theme>,
    );
    const [live, off, on] = container.querySelectorAll('.kui-CheckboxRoot');
    expect(fill(off)).not.toBe(fill(live));
    expect(fill(on)).toBe(fill(off));
    expect(fill(container.querySelector('.kui-CheckboxGroupItemCheckbox')!)).toBe(fill(off));
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
