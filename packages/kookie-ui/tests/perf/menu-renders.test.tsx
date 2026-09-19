import * as React from 'react';
import { render, screen, act } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, test } from 'vitest';

import { Theme } from '../../src/components/theme.js';
import * as DropdownMenu from '../../src/components/dropdown-menu.js';

/**
 * Drill-down menus mount only the levels on the navigation stack, and a
 * navigation step re-renders only the parts whose level changed.
 */
function makeCountedItem() {
  const renders = new Map<string, number>();
  function CountedItem({ label }: { label: string }) {
    renders.set(label, (renders.get(label) ?? 0) + 1);
    return <DropdownMenu.Item>{label}</DropdownMenu.Item>;
  }
  return { CountedItem, renders };
}

function makeMenu(CountedItem: React.FC<{ label: string }>, submenus: number, itemsPerSubmenu: number) {
  return (
    <Theme>
      <DropdownMenu.Root defaultOpen>
        <DropdownMenu.Trigger>
          <button type="button">Open</button>
        </DropdownMenu.Trigger>
        <DropdownMenu.Content submenuBehavior="drill-down">
          <CountedItem label="root-a" />
          <CountedItem label="root-b" />
          {Array.from({ length: submenus }, (_, s) => (
            <DropdownMenu.Sub key={s} label={`Sub ${s}`}>
              <DropdownMenu.SubTrigger>{`Sub ${s}`}</DropdownMenu.SubTrigger>
              <DropdownMenu.SubContent>
                {Array.from({ length: itemsPerSubmenu }, (_, i) => (
                  <CountedItem key={i} label={`sub-${s}-${i}`} />
                ))}
              </DropdownMenu.SubContent>
            </DropdownMenu.Sub>
          ))}
        </DropdownMenu.Content>
      </DropdownMenu.Root>
    </Theme>
  );
}

describe('drill-down render counts', () => {
  test('opening mounts only the root level', async () => {
    const { CountedItem, renders } = makeCountedItem();
    render(makeMenu(CountedItem, 6, 30));
    await screen.findByRole('menu');

    // Two root items, none of the 180 submenu items.
    expect([...renders.keys()].sort()).toEqual(['root-a', 'root-b']);
    expect(document.querySelectorAll('[role="menuitem"]')).toHaveLength(2 + 6);
  });

  test('a navigation step renders only the opened panel', async () => {
    const user = userEvent.setup();
    const { CountedItem, renders } = makeCountedItem();
    render(makeMenu(CountedItem, 6, 30));
    await screen.findByRole('menu');

    const before = new Map(renders);
    await user.click(screen.getByRole('menuitem', { name: 'Sub 2' }));

    // Root items were not re-rendered (their inner menu item unmounts via context).
    expect(renders.get('root-a')).toBe(before.get('root-a'));
    // Only the opened submenu's items rendered, once each.
    const rendered = [...renders.keys()].filter((key) => key.startsWith('sub-'));
    expect(rendered).toHaveLength(30);
    expect(rendered.every((key) => key.startsWith('sub-2-') && renders.get(key) === 1)).toBe(true);
    // The DOM holds the back row plus the panel's items only.
    expect(document.querySelectorAll('[role="menuitem"]')).toHaveLength(1 + 30);
  });

  test('going back does not re-render the closed panel items', async () => {
    const user = userEvent.setup();
    const { CountedItem, renders } = makeCountedItem();
    render(makeMenu(CountedItem, 3, 10));
    await screen.findByRole('menu');

    await user.click(screen.getByRole('menuitem', { name: 'Sub 0' }));
    const afterPush = renders.get('sub-0-0');
    await act(async () => {
      await user.keyboard('{Escape}');
    });

    expect(renders.get('sub-0-0')).toBe(afterPush);
    expect(document.querySelectorAll('[role="menuitem"]')).toHaveLength(2 + 3);
  });
});
