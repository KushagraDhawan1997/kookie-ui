import * as React from 'react';
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { Checkbox, CheckboxGroup, Radio, RadioGroup, Slider, Switch, Theme } from '../../../src/components/index';

// The marks have one look, as in v2. `variant` is not a prop any more; a caller who still passes
// one (from untyped code) gets the one look, never a variant class.
const legacy = { variant: 'soft' } as Record<string, unknown>;

const style = (el: Element, pseudo?: string) => getComputedStyle(el, pseudo);
const variantClasses = (container: HTMLElement) =>
  Array.from(container.querySelectorAll('*')).flatMap((el) => Array.from(el.classList).filter((c) => c.startsWith('kui-variant-')));

describe('variant is no longer accepted', () => {
  it('Switch', () => {
    const { container } = render(<Theme><Switch {...legacy} aria-label="Switch" /></Theme>);
    expect(variantClasses(container)).toEqual([]);
  });

  it('Slider', () => {
    const { container } = render(<Theme><Slider {...legacy} defaultValue={[50]} aria-label="Slider" /></Theme>);
    expect(variantClasses(container)).toEqual([]);
  });

  it('Checkbox', () => {
    const { container } = render(<Theme><Checkbox {...legacy} aria-label="Check" /></Theme>);
    expect(variantClasses(container)).toEqual([]);
  });

  it('CheckboxGroup', () => {
    const { container } = render(
      <Theme>
        <CheckboxGroup.Root {...legacy} aria-label="Group">
          <CheckboxGroup.Item value="a">A</CheckboxGroup.Item>
        </CheckboxGroup.Root>
      </Theme>,
    );
    expect(variantClasses(container)).toEqual([]);
  });

  it('Radio', () => {
    const { container } = render(<Theme><Radio {...legacy} value="a" aria-label="Radio" /></Theme>);
    expect(variantClasses(container)).toEqual([]);
  });

  it('RadioGroup', () => {
    const { container } = render(
      <Theme>
        <RadioGroup.Root {...legacy} defaultValue="a" aria-label="Group">
          <RadioGroup.Item value="a">A</RadioGroup.Item>
        </RadioGroup.Root>
      </Theme>,
    );
    expect(variantClasses(container)).toEqual([]);
  });
});

describe('the one look', () => {
  it('Switch and Slider share the well and the grip', () => {
    const { container } = render(
      <Theme>
        <Switch aria-label="Off" />
        <Switch defaultChecked aria-label="On" />
        <Slider defaultValue={[50]} aria-label="Slider" />
      </Theme>,
    );
    const [off, on] = container.querySelectorAll('.kui-SwitchRoot');
    const track = style(off, '::before');
    expect(track.boxShadow).toBe('none');
    expect(style(on, '::before').backgroundColor).not.toBe(track.backgroundColor);

    const rail = style(container.querySelector('.kui-SliderTrack')!);
    expect(rail.backgroundColor).toBe(track.backgroundColor);
    expect(rail.boxShadow).toBe('none');
    expect(style(container.querySelector('.kui-SliderRange')!).backgroundColor).toBe(style(on, '::before').backgroundColor);

    const [, onThumb] = container.querySelectorAll('.kui-SwitchThumb');
    const grip = style(container.querySelector('.kui-SliderThumb')!, '::after');
    expect(grip.backgroundColor).toBe(style(onThumb).backgroundColor);
    expect(grip.boxShadow).toBe(style(onThumb).boxShadow);
    expect(grip.boxShadow).not.toBe('none');
  });

  it('Checkbox and Radio share the soft fill, and checked is the switch’s accent solid', () => {
    const { container } = render(
      <Theme>
        <Checkbox aria-label="Off" />
        <Checkbox defaultChecked aria-label="On" />
        <Radio value="a" aria-label="Off" />
        <Radio value="b" defaultChecked aria-label="On" />
        <Switch defaultChecked aria-label="On" />
      </Theme>,
    );
    const [box, ticked] = container.querySelectorAll('.kui-CheckboxRoot');
    const [ring, chosen] = container.querySelectorAll('.kui-RadioRoot');
    const solid = style(container.querySelector('.kui-SwitchRoot')!, '::before').backgroundColor;

    expect(style(box, '::before').backgroundColor).not.toBe('rgba(0, 0, 0, 0)');
    expect(style(ring, '::before').backgroundColor).toBe(style(box, '::before').backgroundColor);
    expect(style(ring, '::before').boxShadow).toBe(style(box, '::before').boxShadow);
    expect(style(ticked, '::before').backgroundColor).toBe(solid);
    expect(style(chosen, '::before').backgroundColor).toBe(solid);
    expect(style(ticked.querySelector('.kui-CheckboxIndicator')!).color).toBe(style(chosen, '::after').backgroundColor);
  });

  it('invalid marks take a red edge; disabled outranks invalid', () => {
    const { container } = render(
      <Theme>
        <Checkbox aria-label="Sound" />
        <Checkbox aria-invalid="true" aria-label="Wrong" />
        <Checkbox disabled aria-label="Dead" />
        <Checkbox disabled aria-invalid="true" aria-label="Dead and wrong" />
        <Radio value="a" aria-invalid="true" aria-label="Wrong" />
      </Theme>,
    );
    const [sound, wrong, dead, deadWrong] = Array.from(container.querySelectorAll('.kui-CheckboxRoot')).map((el) => style(el, '::before').boxShadow);
    expect(wrong).not.toBe(sound);
    expect(deadWrong).toBe(dead);
    expect(style(container.querySelector('.kui-RadioRoot')!, '::before').boxShadow).toBe(wrong);
  });
});
