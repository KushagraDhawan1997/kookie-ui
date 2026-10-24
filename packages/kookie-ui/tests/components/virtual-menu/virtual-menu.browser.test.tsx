import * as React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from 'vitest/browser';
import { ContextMenu, DropdownMenu, Theme, VirtualMenu, type VirtualMenuRenderItemProps } from '../../../src/components/index';

const letters = ['Alpha', 'Bravo', 'Charlie'];

function Dropdown({
  onSelect,
  listRef,
  contentStyle,
}: {
  onSelect?: (item: string) => void;
  listRef?: React.Ref<HTMLDivElement>;
  contentStyle?: React.CSSProperties;
}) {
  return (
    <Theme>
      <DropdownMenu.Root>
        <DropdownMenu.Trigger>
          <button type="button">Open</button>
        </DropdownMenu.Trigger>
        <DropdownMenu.Content virtualized style={contentStyle}>
          <VirtualMenu
            ref={listRef}
            items={letters}
            itemLabel={(item: string) => item}
            onSelect={onSelect}
            aria-label="Letters"
            style={{ height: 200, width: 200 }}
          />
        </DropdownMenu.Content>
      </DropdownMenu.Root>
    </Theme>
  );
}

describe('VirtualMenu inside DropdownMenu', () => {
  it('takes focus when the menu opens from the keyboard, so arrows and Enter reach the rows', async () => {
    const onSelect = vi.fn();
    render(<Dropdown onSelect={onSelect} />);
    screen.getByRole('button', { name: 'Open' }).focus();
    await userEvent.keyboard('{Enter}');

    const list = await screen.findByRole('group', { name: 'Letters' });
    await waitFor(() => expect(document.activeElement).toBe(list));
    await waitFor(() => expect(list.getAttribute('aria-activedescendant')).toBeTruthy());
    await userEvent.keyboard('{ArrowDown}');
    await userEvent.keyboard('{Enter}');

    expect(onSelect).toHaveBeenCalledWith('Bravo', 1);
  });

  it('closes the menu when a row is chosen', async () => {
    const onSelect = vi.fn();
    render(<Dropdown onSelect={onSelect} />);
    await userEvent.click(screen.getByRole('button', { name: 'Open' }));
    await userEvent.click(await screen.findByRole('menuitem', { name: 'Charlie' }));

    expect(onSelect).toHaveBeenCalledWith('Charlie', 2);
    await waitFor(() => expect(screen.queryByRole('menu')).toBeNull());
  });

  it('forwards its ref to the list element', async () => {
    const ref = React.createRef<HTMLDivElement>();
    render(<Dropdown listRef={ref} />);
    await userEvent.click(screen.getByRole('button', { name: 'Open' }));
    const list = await screen.findByRole('group', { name: 'Letters' });
    expect(ref.current).toBe(list);
  });

  it('sizes rows from the CSS row height when the theme scale is not 100%', async () => {
    render(<Dropdown contentStyle={{ '--scale': 1.25 } as React.CSSProperties} />);
    await userEvent.click(screen.getByRole('button', { name: 'Open' }));
    const row = await screen.findByRole('menuitem', { name: 'Alpha' });
    await waitFor(() => expect(row.getBoundingClientRect().height).not.toBe(30));
    const drawn = row.getBoundingClientRect().height;
    row.style.height = '';
    expect(row.getBoundingClientRect().height).toBe(drawn);
  });
});

describe('VirtualMenu inside ContextMenu', () => {
  it('takes focus on open and closes the menu when a row is chosen with the keyboard', async () => {
    const onSelect = vi.fn();
    render(
      <Theme>
        <ContextMenu.Root>
          <ContextMenu.Trigger>
            <div data-testid="area" style={{ width: 200, height: 100 }}>
              Area
            </div>
          </ContextMenu.Trigger>
          <ContextMenu.Content virtualized>
            <VirtualMenu items={letters} itemLabel={(item: string) => item} onSelect={onSelect} aria-label="Letters" style={{ height: 200, width: 200 }} />
          </ContextMenu.Content>
        </ContextMenu.Root>
      </Theme>,
    );
    await userEvent.click(screen.getByTestId('area'), { button: 'right' });
    const list = await screen.findByRole('group', { name: 'Letters' });
    await waitFor(() => expect(document.activeElement).toBe(list));
    await userEvent.keyboard('{Enter}');

    expect(onSelect).toHaveBeenCalledWith('Alpha', 0);
    await waitFor(() => expect(screen.queryByRole('menu')).toBeNull());
  });
});

function Standalone(props: { before?: boolean; size?: '1' | '2' | '3' | '4' }) {
  return (
    <Theme>
      <button type="button">Before</button>
      <VirtualMenu items={letters} itemLabel={(item: string) => item} aria-label="Letters" size={props.size} style={{ height: 200, width: 200 }} />
      <button type="button">After</button>
    </Theme>
  );
}

describe('VirtualMenu on its own', () => {
  it('lets Tab move focus past the list', async () => {
    render(<Standalone />);
    screen.getByRole('button', { name: 'Before' }).focus();
    await userEvent.keyboard('{Tab}');
    const list = screen.getByRole('menu', { name: 'Letters' });
    expect(document.activeElement).toBe(list);
    await userEvent.keyboard('{ArrowDown}');
    await userEvent.keyboard('{Tab}');
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'After' }));
  });

  it('draws menu rows and a visible highlight outside a menu', async () => {
    render(<Standalone />);
    screen.getByRole('menu', { name: 'Letters' }).focus();
    const row = await screen.findByRole('menuitem', { name: 'Alpha' });
    await waitFor(() => expect(row).toHaveAttribute('data-highlighted'));
    const style = getComputedStyle(row);
    expect(style.backgroundColor).not.toBe('rgba(0, 0, 0, 0)');
    expect(Number.parseFloat(style.paddingInlineStart)).toBeGreaterThan(0);
    expect(Number.parseFloat(style.minHeight)).toBe(30);
    expect(row.getBoundingClientRect().height).toBe(30);
  });

  it('follows its own size outside a menu', async () => {
    render(<Standalone size="4" />);
    const row = await screen.findByRole('menuitem', { name: 'Alpha' });
    expect(Number.parseFloat(getComputedStyle(row).minHeight)).toBe(38);
  });

  it('passes list attributes such as aria-labelledby and id through', async () => {
    render(
      <Theme>
        <span id="letters-label">Letters</span>
        <VirtualMenu id="letters" data-testid="list" aria-labelledby="letters-label" items={letters} itemLabel={(item: string) => item} style={{ height: 200 }} />
      </Theme>,
    );
    const list = screen.getByRole('menu', { name: 'Letters' });
    expect(list.id).toBe('letters');
    expect(list).toHaveAttribute('data-testid', 'list');
  });

  it('tells assistive tech the full list size and each row position', async () => {
    const many = Array.from({ length: 500 }, (_, index) => `Item ${index}`);
    render(
      <Theme>
        <VirtualMenu items={many} itemLabel={(item: string) => item} aria-label="Many" style={{ height: 200 }} />
      </Theme>,
    );
    const row = await screen.findByRole('menuitem', { name: 'Item 1' });
    expect(row).toHaveAttribute('aria-setsize', '500');
    expect(row).toHaveAttribute('aria-posinset', '2');
    expect(screen.getAllByRole('menuitem').length).toBeLessThan(500);
  });
});

const CheckedContext = React.createContext(false);

const CheckRow = React.memo(function CheckRow({ item, index: _index, isHighlighted: _isHighlighted, ...props }: VirtualMenuRenderItemProps<string>) {
  const checked = React.useContext(CheckedContext);
  return (
    <VirtualMenu.Item {...props} aria-checked={checked}>
      {item}
    </VirtualMenu.Item>
  );
});

describe('VirtualMenu.Item', () => {
  it('updates attributes other than the positioning ones on rerender', async () => {
    function Checked({ checked }: { checked: boolean }) {
      return (
        <Theme>
          <CheckedContext.Provider value={checked}>
            <VirtualMenu items={letters} renderItem={CheckRow} aria-label="Letters" style={{ height: 200 }} />
          </CheckedContext.Provider>
        </Theme>
      );
    }
    const { rerender } = render(<Checked checked={false} />);
    expect(await screen.findByRole('menuitem', { name: 'Alpha' })).toHaveAttribute('aria-checked', 'false');
    rerender(<Checked checked />);
    await waitFor(() => expect(screen.getByRole('menuitem', { name: 'Alpha' })).toHaveAttribute('aria-checked', 'true'));
  });
});

describe('VirtualMenu beside menu items', () => {
  function Mixed() {
    return (
      <Theme>
        <DropdownMenu.Root>
          <DropdownMenu.Trigger>
            <button type="button">Open</button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Content virtualized>
            <DropdownMenu.Item>Clear</DropdownMenu.Item>
            <VirtualMenu items={['Alpha', 'Bravo', 'Charlie']} itemLabel={(item: string) => item} aria-label="Letters" style={{ height: 200, width: 200 }} />
          </DropdownMenu.Content>
        </DropdownMenu.Root>
      </Theme>
    );
  }

  it('drops the row highlight when the pointer leaves it', async () => {
    render(<Mixed />);
    await userEvent.click(screen.getByRole('button', { name: 'Open' }));
    await userEvent.hover(await screen.findByRole('menuitem', { name: 'Bravo' }));
    expect(screen.getByRole('menuitem', { name: 'Bravo' })).toHaveAttribute('data-highlighted');
    await userEvent.hover(screen.getByRole('menuitem', { name: 'Clear' }));
    await waitFor(() =>
      expect(Array.from(document.querySelectorAll('[data-highlighted]')).map((el) => el.textContent)).toEqual(['Clear']),
    );
  });

  it('keeps focus on the list when a letter is typed', async () => {
    render(<Mixed />);
    screen.getByRole('button', { name: 'Open' }).focus();
    await userEvent.keyboard('{Enter}');
    const list = await screen.findByRole('group', { name: 'Letters' });
    list.focus();
    expect(document.activeElement).toBe(list);
    await userEvent.keyboard('c');
    expect(document.activeElement).toBe(list);
  });
});
