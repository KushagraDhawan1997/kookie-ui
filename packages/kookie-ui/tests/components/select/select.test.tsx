import * as React from 'react';
import { beforeAll, describe, expect, it, vi } from 'vitest';
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

/**
 * While closed, Radix still renders Content's children into a detached fragment, so every
 * closed Select on a page pays for whatever wraps them. The theme wrapper and the scroll area
 * (two resize observers) are mounted only while the list is open. Measured with
 * apps/bench/profile.mjs, per closed Select: 111.4 KB heap and 27 DOM nodes before, 93.1 KB and
 * 20 nodes after.
 */
describe('Select.Content while closed', () => {
  beforeAll(() => {
    Element.prototype.hasPointerCapture ??= () => false;
    Element.prototype.releasePointerCapture ??= () => {};
  });

  function Closed(props: { itemRef?: React.Ref<HTMLDivElement> }) {
    return (
      <Select.Root defaultValue="a">
        <Select.Trigger aria-label="Fruit" />
        <Select.Content>
          <Select.Item value="a" ref={props.itemRef}>
            Apple
          </Select.Item>
          <Select.Item value="g">Grape</Select.Item>
        </Select.Content>
      </Select.Root>
    );
  }

  it('renders the items bare, without the scroll area or theme wrapper', () => {
    const ref = React.createRef<HTMLDivElement>();
    renderWithProviders(<Closed itemRef={ref} />);
    // Radix holds the closed items in a div inside a detached fragment.
    const holder = ref.current!.parentElement!;
    expect(holder.parentNode).toBeInstanceOf(DocumentFragment);
    expect(holder.querySelector('.kui-ScrollAreaRoot, .kui-ScrollAreaScrollbar')).toBeNull();
    expect([...holder.children].every((el) => el.classList.contains('kui-SelectItem'))).toBe(true);
  });

  it('starts no resize observers', () => {
    const observe = vi.spyOn(window.ResizeObserver.prototype, 'observe');
    renderWithProviders(<Closed />);
    expect(observe).not.toHaveBeenCalled();
  });

  it('keeps the value label and typeahead on the closed trigger', async () => {
    const user = userEvent.setup();
    renderWithProviders(<Closed />);
    const trigger = screen.getByRole('combobox', { name: 'Fruit' });
    expect(trigger).toHaveTextContent('Apple');
    trigger.focus();
    await user.keyboard('g');
    expect(trigger).toHaveTextContent('Grape');
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
  });

  it('opens with the theme wrapper and scroll area, and closes back', async () => {
    const user = userEvent.setup();
    const onOpenChange = vi.fn();
    function Spy() {
      return (
        <Select.Root defaultValue="a" onOpenChange={onOpenChange}>
          <Select.Trigger aria-label="Fruit" />
          <Select.Content>
            <Select.Item value="a">Apple</Select.Item>
            <Select.Item value="g">Grape</Select.Item>
          </Select.Content>
        </Select.Root>
      );
    }
    renderWithProviders(<Spy />);
    const trigger = screen.getByRole('combobox', { name: 'Fruit' });
    trigger.focus();
    await user.keyboard('{Enter}');
    const listbox = await screen.findByRole('listbox');
    const content = listbox.closest('.kui-SelectContent')!;
    expect(content).toHaveClass('kui-theme');
    expect(content.querySelector('.kui-ScrollAreaRoot')).not.toBeNull();
    expect(onOpenChange).toHaveBeenLastCalledWith(true);
    await user.keyboard('{ArrowDown}{Enter}');
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    expect(trigger).toHaveTextContent('Grape');
    expect(onOpenChange).toHaveBeenLastCalledWith(false);
  });

  it('follows a controlled open prop', () => {
    const { rerender } = renderWithProviders(
      <Select.Root defaultValue="a" open={false}>
        <Select.Trigger aria-label="Fruit" />
        <Select.Content>
          <Select.Item value="a">Apple</Select.Item>
        </Select.Content>
      </Select.Root>,
    );
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    rerender(
      <Select.Root defaultValue="a" open>
        <Select.Trigger aria-label="Fruit" />
        <Select.Content>
          <Select.Item value="a">Apple</Select.Item>
        </Select.Content>
      </Select.Root>,
    );
    expect(screen.getByRole('listbox').closest('.kui-SelectContent')?.querySelector('.kui-ScrollAreaRoot')).not.toBeNull();
  });
});
