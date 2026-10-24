import * as React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from 'vitest/browser';
import { ContextMenu, DropdownMenu, Theme, VirtualMenu } from '../../../src/components/index';

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
