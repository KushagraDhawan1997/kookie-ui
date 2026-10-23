import * as React from 'react';
import { beforeAll, describe, expect, it } from 'vitest';
import userEvent from '@testing-library/user-event';
import { renderWithProviders, screen } from '../../test-utils';
import * as Select from '../../../src/components/select';

function Fruit(props: Select.TriggerProps) {
  return (
    <Select.Root defaultValue="a">
      <Select.Trigger aria-label="Fruit" {...props} />
      <Select.Content>
        <Select.Item value="a">Apple</Select.Item>
        <Select.Item value="b">Banana</Select.Item>
      </Select.Content>
    </Select.Root>
  );
}

describe('Select.Trigger', () => {
  beforeAll(() => {
    // jsdom has no pointer capture; Radix Select calls it on pointerdown.
    Element.prototype.hasPointerCapture ??= () => false;
    Element.prototype.releasePointerCapture ??= () => {};
  });

  it('keeps a caller aria-invalid', () => {
    renderWithProviders(<Fruit aria-invalid="true" />);
    expect(screen.getByRole('combobox', { name: 'Fruit' })).toHaveAttribute('aria-invalid', 'true');
  });

  it('error sets aria-invalid', () => {
    renderWithProviders(<Fruit error />);
    expect(screen.getByRole('combobox', { name: 'Fruit' })).toHaveAttribute('aria-invalid', 'true');
  });

  it('disabled disables the trigger and it does not open', async () => {
    const user = userEvent.setup();
    renderWithProviders(<Fruit disabled />);
    const trigger = screen.getByRole('combobox', { name: 'Fruit' });
    expect(trigger).toBeDisabled();
    expect(trigger).toHaveAttribute('data-disabled');
    expect(trigger).toHaveAttribute('aria-disabled', 'true');
    await user.click(trigger);
    trigger.focus();
    await user.keyboard('{Enter}');
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });
});
