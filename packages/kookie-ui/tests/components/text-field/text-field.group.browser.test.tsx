import * as React from 'react';
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { TextField, Theme } from '../../../src/components/index';

const axes = ['X', 'Y', 'Z'] as const;

function Vector(props: Omit<TextField.GroupProps, 'children'> & { invalid?: (typeof axes)[number]; disabledAxis?: (typeof axes)[number] }) {
  const { invalid, disabledAxis, ...groupProps } = props;
  return (
    <Theme>
      <TextField.Group aria-label="Position" style={{ width: 300 }} {...groupProps}>
        {axes.map((axis) => (
          <TextField.Root key={axis} aria-label={axis} defaultValue="1" error={invalid === axis} disabled={disabledAxis === axis || undefined}>
            <TextField.Slot>{axis}</TextField.Slot>
          </TextField.Root>
        ))}
      </TextField.Group>
    </Theme>
  );
}

const fields = (container: HTMLElement) => Array.from(container.querySelectorAll<HTMLElement>('.kui-TextFieldRoot'));
const divider = (field: HTMLElement) => getComputedStyle(field, '::before');

describe('TextField.Group', () => {
  it('is a labelled group of equal fields, one control wide', () => {
    const { container, getByRole } = render(<Vector />);
    const group = getByRole('group', { name: 'Position' });
    const [x, y, z] = fields(container);
    expect(group.getBoundingClientRect().width).toBe(300);
    expect(x.getBoundingClientRect().width).toBeCloseTo(100, 0);
    expect(y.getBoundingClientRect().left).toBeCloseTo(x.getBoundingClientRect().right, 0);
    expect(z.getBoundingClientRect().right).toBeCloseTo(group.getBoundingClientRect().right, 0);
    expect(x.getBoundingClientRect().height).toBe(32);
  });

  it('passes its size and variant to every field', () => {
    const { container } = render(<Vector size="3" variant="outline" />);
    for (const field of fields(container)) {
      expect(field.classList).toContain('kui-variant-outline');
      expect(field.classList).toContain('kui-r-size-3');
      expect(field.getBoundingClientRect().height).toBe(40);
    }
  });

  it('rounds only the outer ends and draws the edge once, on the group', () => {
    const { container } = render(<Vector />);
    const group = container.querySelector<HTMLElement>('.kui-TextFieldGroup')!;
    const [x, y, z] = fields(container).map((field) => getComputedStyle(field));
    expect(parseFloat(x.borderTopLeftRadius)).toBeGreaterThan(0);
    expect(parseFloat(x.borderTopRightRadius)).toBe(0);
    expect(parseFloat(y.borderTopLeftRadius)).toBe(0);
    expect(parseFloat(y.borderBottomRightRadius)).toBe(0);
    expect(parseFloat(z.borderTopLeftRadius)).toBe(0);
    expect(parseFloat(z.borderBottomRightRadius)).toBeGreaterThan(0);
    for (const field of [x, y, z]) expect(field.boxShadow).toBe('none');
    expect(getComputedStyle(group, '::after').boxShadow).not.toBe('none');
  });

  it('wears the same field chrome as a single field, without a button wide blur', () => {
    const { container } = render(
      <Theme>
        <TextField.Root aria-label="single" />
        <TextField.Group aria-label="g">
          <TextField.Root aria-label="a" />
          <TextField.Root aria-label="b" />
        </TextField.Group>
      </Theme>,
    );
    const single = getComputedStyle(container.querySelector('.kui-TextFieldRoot')!).boxShadow;
    const group = getComputedStyle(container.querySelector('.kui-TextFieldGroup')!, '::after').boxShadow;
    expect(group).toBe(single);
    expect(single).not.toMatch(/14px/);
  });

  it('divides the fields with a hairline, none before the first', () => {
    const { container } = render(<Vector />);
    const [x, y, z] = fields(container);
    expect(divider(x).content).toBe('none');
    expect(divider(y).width).toBe('1px');
    expect(divider(z).width).toBe('1px');
  });

  it('hides the hairlines either side of the focused field', () => {
    const { container } = render(<Vector />);
    const [x, y, z] = fields(container);
    y.querySelector('input')!.focus();
    expect(divider(y).opacity).toBe('0');
    expect(divider(z).opacity).toBe('0');
    x.querySelector('input')!.focus();
    expect(divider(y).opacity).toBe('0');
    expect(divider(z).opacity).toBe('1');
  });

  it('disables every field, or one field on its own', () => {
    const all = render(<Vector disabled />);
    for (const field of fields(all.container)) expect(field.querySelector('input')!.disabled).toBe(true);
    all.unmount();

    const one = render(<Vector disabledAxis="Y" />);
    expect(fields(one.container).map((field) => field.querySelector('input')!.disabled)).toEqual([false, true, false]);
  });

  it('ghost draws the dividers alone, no edge', () => {
    const { container } = render(<Vector variant="ghost" />);
    const group = container.querySelector<HTMLElement>('.kui-TextFieldGroup')!;
    const [x, y] = fields(container);
    expect(getComputedStyle(group, '::after').boxShadow).toBe('none');
    expect(x.classList).toContain('kui-variant-ghost');
    expect(divider(y).width).toBe('1px');
    expect(getComputedStyle(x).backgroundColor).toBe('rgba(0, 0, 0, 0)');
  });

  it('keeps a red edge on an invalid field only', () => {
    const { container } = render(<Vector invalid="Y" />);
    const [x, y] = fields(container).map((field) => getComputedStyle(field).boxShadow);
    expect(x).toBe('none');
    expect(y).not.toBe('none');
  });
});
