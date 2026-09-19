import * as React from 'react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { act, fireEvent, renderWithProviders, screen } from '../../test-utils';

/**
 * Render-count tests. cmdk's Item is wrapped in a counting component: every
 * render of Combobox.Item renders it exactly once, so its count is the number
 * of Combobox.Item renders.
 */
const counter = { items: 0 };

vi.mock('cmdk', async (importOriginal) => {
  const actual = await importOriginal<typeof import('cmdk')>();
  const ActualItem = actual.Command.Item;
  const CountingItem = React.forwardRef<HTMLDivElement, React.ComponentPropsWithoutRef<typeof ActualItem>>((props, ref) => {
    counter.items++;
    return <ActualItem {...props} ref={ref} />;
  });
  return {
    ...actual,
    Command: Object.assign({ ...actual.Command }, { Item: CountingItem }),
  };
});

// Imported after the mock is declared (vi.mock is hoisted).
import * as Combobox from '../../../src/components/combobox';

const N = 200;
const fruits = Array.from({ length: N }, (_, i) => ({ value: `item-${i}`, label: `Item ${i}` }));

// Memoized list, the way a consumer keeps its items from re-rendering.
const Items = React.memo(function Items() {
  return (
    <>
      {fruits.map((f) => (
        <Combobox.Item key={f.value} value={f.value}>
          {f.label}
        </Combobox.Item>
      ))}
    </>
  );
});

function Controlled({ onReady }: { onReady?: () => void }) {
  const [search, setSearch] = React.useState('');
  const [value, setValue] = React.useState<string | null>(null);
  React.useEffect(() => onReady?.(), [onReady]);
  return (
    <Combobox.Root defaultOpen value={value} onValueChange={setValue} searchValue={search} onSearchValueChange={setSearch} shouldFilter={false}>
      <Combobox.Trigger aria-label="Item">
        <Combobox.Value />
      </Combobox.Trigger>
      <Combobox.Content>
        <Combobox.Input />
        <Combobox.List>
          <Items />
        </Combobox.List>
      </Combobox.Content>
    </Combobox.Root>
  );
}

describe('Combobox render counts', () => {
  beforeEach(() => {
    counter.items = 0;
  });

  it('mounts each item a bounded number of times', () => {
    renderWithProviders(<Controlled />);
    // Mount plus at most one follow-up render per item.
    expect(counter.items).toBeLessThanOrEqual(N * 2);
  });

  it('does not re-render every item on a keystroke with controlled searchValue', () => {
    renderWithProviders(<Controlled />);
    const searchInput = document.querySelector('[cmdk-input]') as HTMLInputElement;
    counter.items = 0;
    act(() => {
      fireEvent.change(searchInput, { target: { value: 'i' } });
    });
    expect(searchInput.value).toBe('i');
    // Before the fix: 200 (every item, on every keystroke).
    expect(counter.items).toBe(0);
  });

  it('re-renders only the old and new selected items on select', () => {
    renderWithProviders(<Controlled />);
    counter.items = 0;
    const option = screen.getByRole('option', { name: 'Item 5' });
    act(() => {
      fireEvent.click(option);
    });
    // Content closes; the unmount must not be preceded by an N-item re-render.
    // Before the fix: 200.
    expect(counter.items).toBeLessThanOrEqual(2);
  });

  it('does not re-render items when hovering', () => {
    renderWithProviders(<Controlled />);
    counter.items = 0;
    const options = screen.getAllByRole('option');
    act(() => {
      fireEvent.pointerMove(options[3]);
    });
    act(() => {
      fireEvent.pointerMove(options[4]);
    });
    // cmdk re-renders its own item internals; Combobox.Item does not re-render.
    expect(counter.items).toBe(0);
  });

  it('re-renders only the old and new selected items when a controlled value changes while open', () => {
    function OpenControlled({ value }: { value: string }) {
      return (
        <Combobox.Root open onOpenChange={() => {}} value={value}>
          <Combobox.Trigger aria-label="Item">
            <Combobox.Value />
          </Combobox.Trigger>
          <Combobox.Content>
            <Combobox.List>
              <Items />
            </Combobox.List>
          </Combobox.Content>
        </Combobox.Root>
      );
    }
    const { rerender } = renderWithProviders(<OpenControlled value="item-1" />);
    counter.items = 0;
    act(() => {
      rerender(<OpenControlled value="item-7" />);
    });
    expect(screen.getByRole('option', { name: 'Item 7' })).toHaveAttribute('aria-checked', 'true');
    expect(counter.items).toBe(2);
  });
});
