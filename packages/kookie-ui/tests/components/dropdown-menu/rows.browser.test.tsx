import * as React from 'react';
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { Combobox, DropdownMenu, Select, Shell, Sidebar, Table, Theme, VirtualMenu } from '../../../src/components/index';
import { getMenuItemHeight } from '../../../src/components/_internal/menu-context';

// v2 §21: a row inside a panel hugs its line. Height = line height + 2 × --row-inset-N.
const sizes = ['1', '2', '3', '4'] as const;
type Size = (typeof sizes)[number];
const rowHeight: Record<Size, number> = { '1': 24, '2': 30, '3': 34, '4': 38 };
const rowInset: Record<Size, number> = { '1': 4, '2': 5, '3': 5, '4': 6 };
const panelPadding: Record<Size, number> = { '1': 8, '2': 12, '3': 16, '4': 24 };
const px: Record<Size, number> = { '1': 8, '2': 10, '3': 13, '4': 16 };
const pill: Record<Size, number> = { '1': 12, '2': 14, '3': 17, '4': 20 };
const gap: Record<Size, number> = { '1': 4, '2': 8, '3': 8, '4': 12 };
const icon: Record<Size, number> = { '1': 16, '2': 16, '3': 20, '4': 24 };
const controlHeight: Record<Size, number> = { '1': 28, '2': 32, '3': 40, '4': 48 };

function Glyph() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden>
      <rect width="16" height="16" />
    </svg>
  );
}

function Menu({ size, radius }: { size: Size; radius: 'medium' | 'full' }) {
  return (
    <Theme radius={radius}>
      <DropdownMenu.Root open modal={false}>
        <DropdownMenu.Trigger>
          <button type="button">Open</button>
        </DropdownMenu.Trigger>
        <DropdownMenu.Content size={size}>
          <DropdownMenu.Item>
            <Glyph />
            Item
          </DropdownMenu.Item>
          <DropdownMenu.Item shortcut="⌘ K">Other</DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Root>
    </Theme>
  );
}

function px2n(value: string) {
  return Number.parseFloat(value);
}

describe('menu rows hug their line inside a panel', () => {
  for (const size of sizes) {
    it(`size ${size}: ${rowHeight[size]}px rows, ${panelPadding[size]}px panel, ${px[size]}px / ${pill[size]}px at full`, () => {
      const { unmount } = render(<Menu size={size} radius="medium" />);
      const content = document.querySelector<HTMLElement>('.rt-DropdownMenuContent')!;
      const viewport = content.querySelector<HTMLElement>('.rt-BaseMenuViewport')!;
      const item = content.querySelector<HTMLElement>('.rt-BaseMenuItem')!;
      const style = getComputedStyle(item);

      expect(item.getBoundingClientRect().height).toBe(rowHeight[size]);
      expect(px2n(getComputedStyle(viewport).paddingTop)).toBe(panelPadding[size]);
      expect(px2n(style.paddingTop)).toBe(rowInset[size]);
      expect(px2n(style.paddingLeft)).toBe(px[size]);
      expect(px2n(style.paddingRight)).toBe(px[size]);
      expect(px2n(style.columnGap)).toBe(gap[size]);
      expect(item.querySelector('svg')!.getBoundingClientRect().width).toBe(icon[size]);
      unmount();

      render(<Menu size={size} radius="full" />);
      const fullItem = document.querySelector<HTMLElement>('.rt-DropdownMenuContent .rt-BaseMenuItem')!;
      const fullStyle = getComputedStyle(fullItem);
      expect(px2n(fullStyle.paddingLeft)).toBe(pill[size]);
      expect(px2n(fullStyle.paddingRight)).toBe(pill[size]);
      // The row's capsule is half its own height.
      expect(px2n(fullStyle.borderTopLeftRadius)).toBe(rowHeight[size] / 2);
    });
  }

  for (const size of sizes) {
    for (const radius of ['medium', 'full'] as const) {
      it(`size ${size}, radius ${radius}: a shortcut row keeps the row height and sits the row inset from the far edge`, () => {
        render(<Menu size={size} radius={radius} />);
        const item = document.querySelectorAll<HTMLElement>('.rt-DropdownMenuContent .rt-BaseMenuItem')[1];
        const shortcut = item.querySelector<HTMLElement>('.rt-BaseMenuShortcut')!;
        expect(item.getBoundingClientRect().height).toBe(rowHeight[size]);
        expect(item.getBoundingClientRect().right - shortcut.getBoundingClientRect().right).toBe(rowInset[size]);
      });
    }
  }

  for (const size of sizes) {
    it(`size ${size}: VirtualMenu rows are as tall as the rows CSS draws`, () => {
      render(
        <Theme>
          <DropdownMenu.Root open modal={false}>
            <DropdownMenu.Trigger>
              <button type="button">Open</button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Content size={size} virtualized>
              <VirtualMenu items={['a', 'b', 'c']} itemLabel={(item: string) => item} aria-label="Letters" />
            </DropdownMenu.Content>
          </DropdownMenu.Root>
        </Theme>,
      );
      const row = document.querySelector<HTMLElement>('.rt-DropdownMenuContent .rt-VirtualMenuItem')!;
      expect(row.getBoundingClientRect().height).toBe(getMenuItemHeight(size));
      // Without the virtualizer's inline height, the CSS row is the same height.
      row.style.height = '';
      expect(row.getBoundingClientRect().height).toBe(getMenuItemHeight(size));
    });
  }

  it('a checkable menu reserves the mark box: plain padding, icon box and gap', () => {
    render(
      <Theme>
        <DropdownMenu.Root open modal={false}>
          <DropdownMenu.Trigger>
            <button type="button">Open</button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Content size="2">
            <DropdownMenu.CheckboxItem checked>Checked</DropdownMenu.CheckboxItem>
          </DropdownMenu.Content>
        </DropdownMenu.Root>
      </Theme>,
    );
    const item = document.querySelector<HTMLElement>('.rt-DropdownMenuContent .rt-BaseMenuItem')!;
    expect(px2n(getComputedStyle(item).paddingLeft)).toBe(px['2'] + icon['2'] + gap['2']);
    expect(item.getBoundingClientRect().height).toBe(rowHeight['2']);
  });

  it('at radius full a checkable row keeps the mark at the plain padding and pills the far side', () => {
    render(
      <Theme radius="full">
        <DropdownMenu.Root open modal={false}>
          <DropdownMenu.Trigger>
            <button type="button">Open</button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Content size="2">
            <DropdownMenu.CheckboxItem checked>Checked</DropdownMenu.CheckboxItem>
          </DropdownMenu.Content>
        </DropdownMenu.Root>
      </Theme>,
    );
    const item = document.querySelector<HTMLElement>('.rt-DropdownMenuContent .rt-BaseMenuItem')!;
    const mark = item.querySelector<HTMLElement>('.rt-BaseMenuItemIndicator')!;
    expect(mark.getBoundingClientRect().left - item.getBoundingClientRect().left).toBe(px['2']);
    expect(mark.getBoundingClientRect().width).toBe(icon['2']);
    expect(px2n(getComputedStyle(item).paddingLeft)).toBe(px['2'] + icon['2'] + gap['2']);
    expect(px2n(getComputedStyle(item).paddingRight)).toBe(pill['2']);
  });

  it('a separator keeps the panel padding above and below inside its own box', () => {
    render(
      <Theme>
        <DropdownMenu.Root open modal={false}>
          <DropdownMenu.Trigger>
            <button type="button">Open</button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Content size="2">
            <DropdownMenu.Item>One</DropdownMenu.Item>
            <DropdownMenu.Separator />
            <DropdownMenu.Item>Two</DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Root>
      </Theme>,
    );
    const separator = document.querySelector<HTMLElement>('.rt-DropdownMenuContent .rt-BaseMenuSeparator')!;
    const style = getComputedStyle(separator);
    // The rhythm is the separator's own padding: a part never sets the space around itself.
    expect(px2n(style.marginTop)).toBe(0);
    expect(px2n(style.marginBottom)).toBe(0);
    expect(px2n(style.paddingTop)).toBe(panelPadding['2']);
    expect(px2n(style.paddingBottom)).toBe(panelPadding['2']);
    // Only the content box paints, so the line stays one hairline tall.
    expect(style.backgroundClip).toBe('content-box');
    expect(separator.getBoundingClientRect().height).toBe(panelPadding['2'] * 2 + 1);
  });
});

describe('select rows are menu rows', () => {
  for (const size of sizes) {
    it(`size ${size}`, () => {
      render(
        <Theme radius="medium">
          <Select.Root size={size} defaultValue="a" open>
            <Select.Trigger aria-label="Select" />
            <Select.Content position="popper">
              <Select.Item value="a">A</Select.Item>
              <Select.Item value="b">B</Select.Item>
            </Select.Content>
          </Select.Root>
        </Theme>,
      );
      const content = document.querySelector<HTMLElement>('.rt-SelectContent')!;
      const viewport = content.querySelector<HTMLElement>('.rt-SelectViewport')!;
      const item = content.querySelector<HTMLElement>('.rt-SelectItem')!;
      expect(item.getBoundingClientRect().height).toBe(rowHeight[size]);
      expect(px2n(getComputedStyle(viewport).paddingTop)).toBe(panelPadding[size]);
      expect(px2n(getComputedStyle(item).paddingLeft)).toBe(px[size] + icon[size] + gap[size]);
      expect(px2n(getComputedStyle(item).paddingRight)).toBe(px[size]);
    });
  }

  it('at radius full the far side takes the pill padding', () => {
    render(
      <Theme radius="full">
        <Select.Root size="2" defaultValue="a" open>
          <Select.Trigger aria-label="Select" />
          <Select.Content position="popper">
            <Select.Item value="a">A</Select.Item>
          </Select.Content>
        </Select.Root>
      </Theme>,
    );
    const item = document.querySelector<HTMLElement>('.rt-SelectContent .rt-SelectItem')!;
    expect(item.getBoundingClientRect().height).toBe(rowHeight['2']);
    expect(px2n(getComputedStyle(item).paddingRight)).toBe(pill['2']);
    expect(px2n(getComputedStyle(item).borderTopLeftRadius)).toBe(rowHeight['2'] / 2);
  });
});

describe('combobox rows are menu rows', () => {
  for (const size of ['1', '2', '3'] as const) {
    it(`size ${size}`, () => {
      render(
        <Theme>
          <Combobox.Root open>
            <Combobox.Trigger aria-label="Combobox" />
            <Combobox.Content size={size}>
              <Combobox.List>
                <Combobox.Item value="a">A</Combobox.Item>
              </Combobox.List>
            </Combobox.Content>
          </Combobox.Root>
        </Theme>,
      );
      const item = document.querySelector<HTMLElement>('.rt-ComboboxContent .rt-ComboboxItem')!;
      expect(item.getBoundingClientRect().height).toBe(rowHeight[size]);
      expect(px2n(getComputedStyle(item).paddingLeft)).toBe(px[size] + icon[size] + gap[size]);
    });
  }
});

describe('a sidebar row stands level with a button, on the pill padding and gap ladder', () => {
  for (const size of ['1', '2', '3'] as const) {
    it(`size ${size}`, () => {
      const { container } = render(
        <Theme radius="full">
          <Shell.Root size={size} height="400px">
            <Shell.Sidebar defaultState="expanded" presentation="fixed">
              <Shell.Scroll>
                <Sidebar.Menu>
                  <Sidebar.MenuItem>
                    <Sidebar.MenuButton>
                      <Glyph />
                      Home
                    </Sidebar.MenuButton>
                  </Sidebar.MenuItem>
                </Sidebar.Menu>
              </Shell.Scroll>
            </Shell.Sidebar>
          </Shell.Root>
        </Theme>,
      );
      const row = container.querySelector<HTMLElement>('.rt-ShellSidebar .rt-SidebarMenuButton')!;
      const style = getComputedStyle(row);
      expect(row.getBoundingClientRect().height).toBe(controlHeight[size]);
      expect(px2n(style.paddingLeft)).toBe(pill[size]);
      expect(px2n(style.columnGap)).toBe(gap[size]);
      expect(px2n(style.borderTopLeftRadius)).toBe(controlHeight[size] / 2);
    });

    it(`size ${size}: a row with a shortcut or a badge stays at control height`, () => {
      const { container } = render(
        <Theme>
          <Shell.Root size={size} height="400px">
            <Shell.Sidebar defaultState="expanded" presentation="fixed">
              <Shell.Scroll>
                <Sidebar.Menu>
                  <Sidebar.MenuItem>
                    <Sidebar.MenuButton shortcut="⌘ K">Search</Sidebar.MenuButton>
                  </Sidebar.MenuItem>
                  <Sidebar.MenuItem>
                    <Sidebar.MenuButton badge="3">Inbox</Sidebar.MenuButton>
                  </Sidebar.MenuItem>
                </Sidebar.Menu>
              </Shell.Scroll>
            </Shell.Sidebar>
          </Shell.Root>
        </Theme>,
      );
      for (const row of container.querySelectorAll<HTMLElement>('.rt-ShellSidebar .rt-SidebarMenuButton')) {
        expect(row.getBoundingClientRect().height).toBe(controlHeight[size]);
      }
    });
  }
});

describe('table cells pad on the layout ladder', () => {
  const py: Record<Size, number> = { '1': 4, '2': 8, '3': 12, '4': 16 };
  const cellPx: Record<Size, number> = { '1': 8, '2': 12, '3': 16, '4': 24 };
  const line: Record<Size, number> = { '1': 16, '2': 20, '3': 24, '4': 26 };
  for (const size of sizes) {
    it(`size ${size}: ${py[size]}px block, ${cellPx[size]}px inline`, () => {
      const { container } = render(
        <Theme>
          <Table.Root size={size}>
            <Table.Body>
              <Table.Row>
                <Table.Cell>Cell</Table.Cell>
              </Table.Row>
            </Table.Body>
          </Table.Root>
        </Theme>,
      );
      const cell = container.querySelector<HTMLElement>('.rt-TableCell')!;
      const style = getComputedStyle(cell);
      expect(px2n(style.paddingTop)).toBe(py[size]);
      expect(px2n(style.paddingLeft)).toBe(cellPx[size]);
      expect(cell.getBoundingClientRect().height).toBe(line[size] + 2 * py[size]);
    });
  }
});
