import * as React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import userEvent from '@testing-library/user-event';
import { act, renderWithProviders, screen, waitFor, within } from '../../test-utils';
import * as Combobox from '../../../src/components/combobox';

const fruits = [
  { value: 'apple', label: 'Apple' },
  { value: 'banana', label: 'Banana' },
  { value: 'cherry', label: 'Cherry' },
];

type FruitComboboxProps = Omit<Combobox.RootProps, 'children'> & {
  contentProps?: Combobox.ContentProps;
  triggerProps?: Combobox.TriggerProps;
  withInput?: boolean;
};

function FruitCombobox({ contentProps, triggerProps, withInput = true, ...rootProps }: FruitComboboxProps) {
  return (
    <Combobox.Root {...rootProps}>
      <Combobox.Trigger aria-label="Fruit" data-testid="trigger" {...triggerProps}>
        <Combobox.Value placeholder="Pick a fruit" />
      </Combobox.Trigger>
      <Combobox.Content {...contentProps}>
        {withInput ? <Combobox.Input /> : null}
        <Combobox.List>
          {fruits.map((fruit) => (
            <Combobox.Item key={fruit.value} value={fruit.value}>
              {fruit.label}
            </Combobox.Item>
          ))}
          <Combobox.Empty>No fruit</Combobox.Empty>
        </Combobox.List>
      </Combobox.Content>
    </Combobox.Root>
  );
}

const getSearchInput = () => document.querySelector('[cmdk-input]') as HTMLInputElement;
const optionNames = () => screen.queryAllByRole('option').map((option) => option.textContent);

describe('Combobox', () => {
  beforeEach(() => {
    // The unlabelled-trigger warning is covered by its own test.
    vi.spyOn(console, 'warn').mockImplementation(() => {});
  });

  describe('Root', () => {
    it('renders the trigger and keeps content unmounted while closed', () => {
      renderWithProviders(<FruitCombobox />);
      expect(screen.getByTestId('trigger')).toHaveClass('rt-ComboboxTrigger', 'rt-SelectTrigger');
      expect(document.querySelector('.rt-ComboboxContent')).not.toBeInTheDocument();
    });

    it('keeps content mounted but closed with forceMount', () => {
      renderWithProviders(<FruitCombobox contentProps={{ forceMount: true }} />);
      expect(document.querySelector('.rt-ComboboxContent')).toHaveAttribute('data-state', 'closed');
    });

    it('disables the trigger when Root is disabled', () => {
      renderWithProviders(<FruitCombobox disabled />);
      const trigger = screen.getByTestId('trigger');
      expect(trigger).toBeDisabled();
      expect(trigger).toHaveAttribute('aria-disabled', 'true');
    });
  });

  describe('Search', () => {
    it('accepts typing when search is uncontrolled', async () => {
      const user = userEvent.setup();
      const onSearchValueChange = vi.fn();
      renderWithProviders(<FruitCombobox defaultOpen onSearchValueChange={onSearchValueChange} />);

      await user.type(getSearchInput(), 'ban');

      expect(getSearchInput()).toHaveValue('ban');
      expect(onSearchValueChange).toHaveBeenLastCalledWith('ban');
      expect(optionNames()).toEqual(['Banana']);
    });

    it('accepts typing when search is controlled', async () => {
      const user = userEvent.setup();
      function Controlled() {
        const [search, setSearch] = React.useState('');
        return (
          <>
            <output data-testid="search">{search}</output>
            <FruitCombobox defaultOpen searchValue={search} onSearchValueChange={setSearch} />
          </>
        );
      }
      renderWithProviders(<Controlled />);

      await user.type(getSearchInput(), 'che');

      expect(getSearchInput()).toHaveValue('che');
      expect(screen.getByTestId('search')).toHaveTextContent('che');
      expect(optionNames()).toEqual(['Cherry']);
    });

    it('ignores typing when searchValue is controlled and not updated', async () => {
      const user = userEvent.setup();
      renderWithProviders(<FruitCombobox defaultOpen searchValue="" onSearchValueChange={() => {}} />);
      await user.type(getSearchInput(), 'x');
      expect(getSearchInput()).toHaveValue('');
    });

    it('matches the visible text, not only the value', async () => {
      const user = userEvent.setup();
      renderWithProviders(
        <Combobox.Root defaultOpen>
          <Combobox.Trigger aria-label="Country">
            <Combobox.Value />
          </Combobox.Trigger>
          <Combobox.Content>
            <Combobox.Input />
            <Combobox.List>
              <Combobox.Item value="uk">
                <span>United Kingdom</span>
              </Combobox.Item>
              <Combobox.Item value="fr">France</Combobox.Item>
              <Combobox.Empty>No country</Combobox.Empty>
            </Combobox.List>
          </Combobox.Content>
        </Combobox.Root>,
      );

      await user.type(getSearchInput(), 'United');
      expect(optionNames()).toEqual(['United Kingdom']);

      await user.clear(getSearchInput());
      await user.type(getSearchInput(), 'uk');
      expect(optionNames()).toEqual(['United Kingdom']);
    });

    it('uses label and keywords for matching, and picks up label changes', async () => {
      const user = userEvent.setup();
      function Dynamic({ label }: { label: string }) {
        return (
          <Combobox.Root defaultOpen>
            <Combobox.Trigger aria-label="Language">
              <Combobox.Value />
            </Combobox.Trigger>
            <Combobox.Content>
              <Combobox.Input />
              <Combobox.List>
                <Combobox.Item value="1" label={label} keywords={['typed']}>
                  <span>Item</span>
                </Combobox.Item>
                <Combobox.Item value="2">Other</Combobox.Item>
              </Combobox.List>
            </Combobox.Content>
          </Combobox.Root>
        );
      }
      const { rerender } = renderWithProviders(<Dynamic label="TypeScript" />);

      await user.type(getSearchInput(), 'typescript');
      expect(optionNames()).toEqual(['Item']);

      rerender(<Dynamic label="JavaScript" />);
      await user.clear(getSearchInput());
      await user.type(getSearchInput(), 'javascript');
      expect(optionNames()).toEqual(['Item']);

      await user.clear(getSearchInput());
      await user.type(getSearchInput(), 'typed');
      expect(optionNames()).toEqual(['Item']);
    });

    it('clears the search after a selection by default', async () => {
      const user = userEvent.setup();
      const onSearchValueChange = vi.fn();
      renderWithProviders(<FruitCombobox onSearchValueChange={onSearchValueChange} />);

      await user.click(screen.getByTestId('trigger'));
      await user.type(getSearchInput(), 'ban');
      await user.click(screen.getByRole('option', { name: 'Banana' }));

      expect(onSearchValueChange).toHaveBeenLastCalledWith('');
      await user.click(screen.getByTestId('trigger'));
      expect(getSearchInput()).toHaveValue('');
      expect(optionNames()).toHaveLength(3);
    });

    it('keeps the search after a selection with resetSearchOnSelect={false}', async () => {
      const user = userEvent.setup();
      renderWithProviders(<FruitCombobox resetSearchOnSelect={false} />);

      await user.click(screen.getByTestId('trigger'));
      await user.type(getSearchInput(), 'ban');
      await user.click(screen.getByRole('option', { name: 'Banana' }));

      await user.click(screen.getByTestId('trigger'));
      expect(getSearchInput()).toHaveValue('ban');
    });

    it('clears the search when dismissed without a selection', async () => {
      const user = userEvent.setup();
      renderWithProviders(<FruitCombobox />);

      await user.click(screen.getByTestId('trigger'));
      await user.type(getSearchInput(), 'ban');
      await user.keyboard('{Escape}');
      await user.click(screen.getByTestId('trigger'));

      expect(getSearchInput()).toHaveValue('');
    });

    it('keeps the search when dismissed with resetSearchOnClose={false}', async () => {
      const user = userEvent.setup();
      renderWithProviders(<FruitCombobox resetSearchOnClose={false} />);

      await user.click(screen.getByTestId('trigger'));
      await user.type(getSearchInput(), 'ban');
      await user.keyboard('{Escape}');
      await user.click(screen.getByTestId('trigger'));

      expect(getSearchInput()).toHaveValue('ban');
    });

    it('announces the result count', async () => {
      const user = userEvent.setup();
      renderWithProviders(<FruitCombobox defaultOpen />);
      await user.type(getSearchInput(), 'an');
      const status = screen.getByRole('status');
      await waitFor(() => expect(status).toHaveTextContent('1 result'));
      await user.type(getSearchInput(), 'zzz');
      await waitFor(() => expect(status).toHaveTextContent('No results'));
    });
  });

  describe('Selection', () => {
    it('selects with the pointer and shows the value', async () => {
      const user = userEvent.setup();
      const onValueChange = vi.fn();
      renderWithProviders(<FruitCombobox onValueChange={onValueChange} displayValue={(value) => fruits.find((f) => f.value === value)?.label} />);

      await user.click(screen.getByTestId('trigger'));
      await user.click(screen.getByRole('option', { name: 'Cherry' }));

      expect(onValueChange).toHaveBeenCalledWith('cherry');
      expect(screen.getByTestId('trigger')).toHaveTextContent('Cherry');
      expect(document.querySelector('.rt-ComboboxContent')).not.toBeInTheDocument();
    });

    it('selects with the keyboard', async () => {
      const user = userEvent.setup();
      const onValueChange = vi.fn();
      renderWithProviders(<FruitCombobox onValueChange={onValueChange} />);

      screen.getByTestId('trigger').focus();
      await user.keyboard('{Enter}');
      expect(getSearchInput()).toHaveFocus();
      await user.keyboard('{ArrowDown}{Enter}');

      expect(onValueChange).toHaveBeenCalledWith('banana');
    });

    it('opens from the trigger with ArrowDown', async () => {
      const user = userEvent.setup();
      renderWithProviders(<FruitCombobox />);
      screen.getByTestId('trigger').focus();
      await user.keyboard('{ArrowDown}');
      expect(screen.getByRole('listbox')).toBeInTheDocument();
    });

    it('starts the highlight on the selected value', async () => {
      const user = userEvent.setup();
      const onValueChange = vi.fn();
      renderWithProviders(<FruitCombobox defaultValue="cherry" onValueChange={onValueChange} />);

      await user.click(screen.getByTestId('trigger'));
      expect(screen.getByRole('option', { name: 'Cherry' })).toHaveAttribute('aria-selected', 'true');
      await user.keyboard('{Enter}');
      expect(onValueChange).not.toHaveBeenCalledWith('apple');
    });

    it('supports the keyboard without a search field', async () => {
      const user = userEvent.setup();
      const onValueChange = vi.fn();
      renderWithProviders(<FruitCombobox withInput={false} onValueChange={onValueChange} />);

      await user.click(screen.getByTestId('trigger'));
      expect(screen.getByRole('listbox')).toHaveFocus();
      await user.keyboard('{ArrowDown}{Enter}');
      expect(onValueChange).toHaveBeenCalledWith('banana');
    });

    it('selects an item without a value using its text', async () => {
      const user = userEvent.setup();
      const onValueChange = vi.fn();
      const onSelect = vi.fn();
      renderWithProviders(
        <Combobox.Root defaultOpen onValueChange={onValueChange}>
          <Combobox.Trigger aria-label="Fruit">
            <Combobox.Value />
          </Combobox.Trigger>
          <Combobox.Content>
            <Combobox.List>
              <Combobox.Item onSelect={onSelect}>Mango</Combobox.Item>
            </Combobox.List>
          </Combobox.Content>
        </Combobox.Root>,
      );

      await user.click(screen.getByRole('option', { name: 'Mango' }));
      expect(onValueChange).toHaveBeenCalledWith('Mango');
      expect(onSelect).toHaveBeenCalledWith('Mango');
    });

    it('does not open when readOnly or loading', async () => {
      const user = userEvent.setup();
      const { unmount } = renderWithProviders(<FruitCombobox triggerProps={{ readOnly: true }} />);
      await user.click(screen.getByTestId('trigger'));
      screen.getByTestId('trigger').focus();
      await user.keyboard('{ArrowDown}');
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
      unmount();

      renderWithProviders(<FruitCombobox triggerProps={{ loading: true }} />);
      await user.click(screen.getByTestId('trigger'));
      expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    });
  });

  describe('ARIA', () => {
    it('describes the trigger as a combobox with a dialog popup', async () => {
      const user = userEvent.setup();
      renderWithProviders(<FruitCombobox />);
      const trigger = screen.getByRole('combobox', { name: 'Fruit' });

      expect(trigger).toHaveAttribute('aria-haspopup', 'dialog');
      expect(trigger).toHaveAttribute('aria-expanded', 'false');
      expect(trigger).not.toHaveAttribute('aria-autocomplete');

      await user.click(trigger);
      expect(trigger).toHaveAttribute('aria-expanded', 'true');
      const dialog = screen.getByRole('dialog', { name: 'Fruit' });
      expect(trigger.getAttribute('aria-controls')).toBe(dialog.id);
    });

    it('labels the search field and listbox and links them', async () => {
      const user = userEvent.setup();
      renderWithProviders(<FruitCombobox />);
      await user.click(screen.getByTestId('trigger'));

      const dialog = screen.getByRole('dialog');
      const input = within(dialog).getByRole('combobox', { name: 'Fruit' });
      const listbox = within(dialog).getByRole('listbox', { name: 'Fruit' });
      expect(input.getAttribute('aria-controls')).toBe(listbox.id);
      await user.keyboard('{ArrowDown}');
      expect(document.getElementById(input.getAttribute('aria-activedescendant') ?? '')).toHaveTextContent('Banana');
    });

    it('marks the chosen option with aria-checked, separate from the highlight', async () => {
      const user = userEvent.setup();
      renderWithProviders(<FruitCombobox defaultValue="banana" />);
      await user.click(screen.getByTestId('trigger'));
      await user.keyboard('{ArrowDown}');

      const banana = screen.getByRole('option', { name: 'Banana' });
      const cherry = screen.getByRole('option', { name: 'Cherry' });
      expect(banana).toHaveAttribute('aria-checked', 'true');
      expect(banana).toHaveAttribute('aria-selected', 'false');
      expect(cherry).toHaveAttribute('aria-checked', 'false');
      expect(cherry).toHaveAttribute('aria-selected', 'true');
    });

    it('sets aria-invalid, aria-busy and aria-readonly from trigger state', () => {
      renderWithProviders(<FruitCombobox triggerProps={{ error: true, loading: true, readOnly: true }} />);
      const trigger = screen.getByTestId('trigger');
      expect(trigger).toHaveAttribute('aria-invalid', 'true');
      expect(trigger).toHaveAttribute('aria-busy', 'true');
      expect(trigger).toHaveAttribute('aria-readonly', 'true');
      expect(trigger).toHaveAttribute('data-error', 'true');
      expect(trigger).toHaveAttribute('data-loading', 'true');
    });

    it('names a group after its label', () => {
      renderWithProviders(
        <Combobox.Root defaultOpen>
          <Combobox.Trigger aria-label="Framework">
            <Combobox.Value />
          </Combobox.Trigger>
          <Combobox.Content>
            <Combobox.List>
              <Combobox.Group>
                <Combobox.Label>React</Combobox.Label>
                <Combobox.Item value="next">Next.js</Combobox.Item>
              </Combobox.Group>
            </Combobox.List>
          </Combobox.Content>
        </Combobox.Root>,
      );
      expect(screen.getByRole('group', { name: 'React' })).toBeInTheDocument();
      expect(screen.getByText('React')).toHaveClass('rt-ComboboxLabel', 'rt-BaseMenuLabel');
    });

    it('warns in development when the trigger has no accessible name', () => {
      const warn = vi.mocked(console.warn);
      renderWithProviders(
        <Combobox.Root>
          <Combobox.Trigger>
            <Combobox.Value />
          </Combobox.Trigger>
        </Combobox.Root>,
      );
      expect(warn).toHaveBeenCalledWith(expect.stringContaining('Combobox.Trigger has no accessible name'));
    });

    it('takes the trigger name from a <label htmlFor>', async () => {
      const user = userEvent.setup();
      renderWithProviders(
        <>
          <label htmlFor="fruit">Favourite fruit</label>
          <Combobox.Root>
            <Combobox.Trigger id="fruit">
              <Combobox.Value />
            </Combobox.Trigger>
            <Combobox.Content>
              <Combobox.Input />
              <Combobox.List>
                <Combobox.Item value="a">A</Combobox.Item>
              </Combobox.List>
            </Combobox.Content>
          </Combobox.Root>
        </>,
      );
      await user.click(screen.getByRole('combobox', { name: 'Favourite fruit' }));
      expect(screen.getByRole('dialog', { name: 'Favourite fruit' })).toBeInTheDocument();
    });
  });

  describe('Trigger styling', () => {
    it('applies variant, color and placeholder state', () => {
      renderWithProviders(<FruitCombobox triggerProps={{ variant: 'soft', color: 'jade' }} />);
      const trigger = screen.getByTestId('trigger');
      expect(trigger).toHaveClass('rt-variant-soft');
      expect(trigger).toHaveAttribute('data-accent-color', 'jade');
      expect(trigger).toHaveAttribute('data-placeholder');
    });

    it('drops data-placeholder once a value is set', () => {
      renderWithProviders(<FruitCombobox value="apple" />);
      expect(screen.getByTestId('trigger')).not.toHaveAttribute('data-placeholder');
    });

    it('does not leak material onto the button', () => {
      renderWithProviders(<FruitCombobox triggerProps={{ material: 'translucent' }} />);
      const trigger = screen.getByTestId('trigger');
      expect(trigger).not.toHaveAttribute('material');
      expect(trigger).toHaveAttribute('data-material', 'translucent');
      expect(trigger).toHaveAttribute('data-panel-background', 'translucent');
    });
  });

  describe('Content', () => {
    it('builds responsive size classes', () => {
      renderWithProviders(<FruitCombobox defaultOpen size={{ initial: '1', md: '3' }} />);
      const html = document.body.innerHTML;
      expect(html).not.toContain('[object Object]');
      const inputRoot = document.querySelector('.rt-ComboboxInputRoot');
      expect(inputRoot).toHaveClass('rt-r-size-1', 'md:rt-r-size-3');
      expect(document.querySelector('.rt-ComboboxContent')).toHaveClass('rt-r-size-1', 'md:rt-r-size-3');
    });

    it('applies material to the surface and search field', () => {
      renderWithProviders(<FruitCombobox defaultOpen contentProps={{ material: 'solid' }} />);
      expect(document.querySelector('.rt-ComboboxContent')).toHaveAttribute('data-material', 'solid');
      expect(document.querySelector('.rt-ComboboxInputRoot')).toHaveAttribute('data-material', 'solid');
    });

    it('renders separators with base menu classes', () => {
      renderWithProviders(
        <Combobox.Root defaultOpen>
          <Combobox.Trigger aria-label="Letter">
            <Combobox.Value />
          </Combobox.Trigger>
          <Combobox.Content>
            <Combobox.List>
              <Combobox.Item value="a">A</Combobox.Item>
              <Combobox.Separator data-testid="separator" />
              <Combobox.Item value="b">B</Combobox.Item>
            </Combobox.List>
          </Combobox.Content>
        </Combobox.Root>,
      );
      expect(screen.getByTestId('separator')).toHaveClass('rt-ComboboxSeparator', 'rt-BaseMenuSeparator');
    });
  });

  describe('Value', () => {
    it('shows the placeholder from Value, then from Root', () => {
      const { unmount } = renderWithProviders(
        <Combobox.Root placeholder="Root placeholder">
          <Combobox.Trigger aria-label="Pick">
            <Combobox.Value placeholder="Value placeholder" />
          </Combobox.Trigger>
        </Combobox.Root>,
      );
      expect(screen.getByText('Value placeholder')).toBeInTheDocument();
      unmount();

      renderWithProviders(
        <Combobox.Root placeholder="Choose one">
          <Combobox.Trigger aria-label="Pick">
            <Combobox.Value />
          </Combobox.Trigger>
        </Combobox.Root>,
      );
      expect(screen.getByText('Choose one')).toBeInTheDocument();
    });

    it('shows a static or computed displayValue', () => {
      const { unmount } = renderWithProviders(<FruitCombobox value="banana" displayValue="Yellow fruit" />);
      expect(screen.getByText('Yellow fruit')).toBeInTheDocument();
      unmount();

      const displayValue = vi.fn((value: string | null) => fruits.find((f) => f.value === value)?.label);
      renderWithProviders(<FruitCombobox value="cherry" displayValue={displayValue} />);
      expect(screen.getByText('Cherry')).toBeInTheDocument();
      expect(displayValue).toHaveBeenCalledWith('cherry');
    });

    it('updates when a controlled value changes while open', () => {
      const { rerender } = renderWithProviders(<FruitCombobox open value="apple" onOpenChange={() => {}} />);
      expect(screen.getByRole('option', { name: 'Apple' })).toHaveAttribute('aria-checked', 'true');
      act(() => {
        rerender(<FruitCombobox open value="cherry" onOpenChange={() => {}} />);
      });
      expect(screen.getByRole('option', { name: 'Apple' })).toHaveAttribute('aria-checked', 'false');
      expect(screen.getByRole('option', { name: 'Cherry' })).toHaveAttribute('aria-checked', 'true');
    });
  });

  describe('Context errors', () => {
    it('throws when Trigger or Item is used outside Root', () => {
      vi.spyOn(console, 'error').mockImplementation(() => {});
      expect(() =>
        renderWithProviders(
          <Combobox.Trigger>
            <Combobox.Value />
          </Combobox.Trigger>,
        ),
      ).toThrow('Combobox.Trigger must be used within Combobox.Root');
      expect(() => renderWithProviders(<Combobox.Item value="a">A</Combobox.Item>)).toThrow('Combobox.Item must be used within Combobox.Root');
    });
  });
});
