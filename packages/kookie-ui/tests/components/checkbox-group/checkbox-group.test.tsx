import * as React from 'react';
import { describe, it, expect } from 'vitest';
import userEvent from '@testing-library/user-event';
import { renderWithProviders, screen } from '../../test-utils';
import { CheckboxGroup } from '../../../src/components/index';

function Fruits(props: Partial<CheckboxGroup.RootProps>) {
  return (
    <form>
      <CheckboxGroup.Root name="fruit" aria-label="Fruit" {...props}>
        <CheckboxGroup.Item value="apple">Apple</CheckboxGroup.Item>
        <CheckboxGroup.Item value="banana">Banana</CheckboxGroup.Item>
        <CheckboxGroup.Item value="cherry">Cherry</CheckboxGroup.Item>
      </CheckboxGroup.Root>
    </form>
  );
}

const nativeInputs = (container: HTMLElement) => [...container.querySelectorAll<HTMLInputElement>('input[type="checkbox"]')];

describe('CheckboxGroup', () => {
  it('a required group needs one box checked, not every box', async () => {
    const user = userEvent.setup();
    const { container } = renderWithProviders(<Fruits required />);
    const form = container.querySelector('form')!;
    expect(nativeInputs(container).every((input) => input.required)).toBe(true);
    expect(form.checkValidity()).toBe(false);
    await user.click(screen.getByRole('checkbox', { name: 'Banana' }));
    expect(nativeInputs(container).some((input) => input.required)).toBe(false);
    expect(form.checkValidity()).toBe(true);
  });

  it('gives each checkbox its own tab stop, as native checkboxes do', async () => {
    const user = userEvent.setup();
    renderWithProviders(
      <>
        <Fruits defaultValue={['banana']} />
        <button type="button">After</button>
      </>,
    );
    await user.tab();
    expect(screen.getByRole('checkbox', { name: 'Apple' })).toHaveFocus();
    await user.tab();
    expect(screen.getByRole('checkbox', { name: 'Banana' })).toHaveFocus();
    await user.tab();
    expect(screen.getByRole('checkbox', { name: 'Cherry' })).toHaveFocus();
    await user.tab();
    expect(screen.getByRole('button', { name: 'After' })).toHaveFocus();
  });

  it('arrow keys do not move focus between checkboxes', async () => {
    const user = userEvent.setup();
    renderWithProviders(<Fruits />);
    await user.tab();
    await user.keyboard('{ArrowDown}');
    expect(screen.getByRole('checkbox', { name: 'Apple' })).toHaveFocus();
  });

  it('a responsive size reaches the label text', () => {
    const { container } = renderWithProviders(<Fruits size={{ initial: '1', md: '4' }} />);
    const label = container.querySelector('.kui-CheckboxGroupItem')!;
    expect(label).toHaveClass('kui-r-size-1');
    expect(label).toHaveClass('md:kui-r-size-4');
    expect(label).not.toHaveClass('kui-r-size-3');
  });
});
