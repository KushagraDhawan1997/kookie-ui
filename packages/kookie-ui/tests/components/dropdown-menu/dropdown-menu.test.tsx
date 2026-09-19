import * as React from 'react';
import { afterEach, describe, it, expect, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import { renderWithProviders, render, screen } from '../../test-utils';
import * as DropdownMenu from '../../../src/components/dropdown-menu';
import { Button } from '../../../src/components/button';
import { Theme } from '../../../src/components/theme';
import { VirtualMenu } from '../../../src/components/virtual-menu';

/** Opens the first cascade submenu from the keyboard. */
async function openFirstSub(user: ReturnType<typeof userEvent.setup>, triggerName: string) {
  const trigger = await screen.findByRole('menuitem', { name: triggerName });
  trigger.focus();
  await user.keyboard('{ArrowRight}');
}

function renderMenu(content: React.ReactNode, contentProps: Partial<DropdownMenu.ContentProps> = {}) {
  const user = userEvent.setup();
  renderWithProviders(
    <DropdownMenu.Root defaultOpen>
      <DropdownMenu.Trigger>
        <Button>Open</Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content {...contentProps}>{content}</DropdownMenu.Content>
    </DropdownMenu.Root>,
  );
  return user;
}

describe('DropdownMenu', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('opens from the trigger and calls onSelect with the select event', async () => {
    const user = userEvent.setup();
    const onSelect = vi.fn();
    renderWithProviders(
      <DropdownMenu.Root>
        <DropdownMenu.Trigger>
          <Button>Open</Button>
        </DropdownMenu.Trigger>
        <DropdownMenu.Content>
          <DropdownMenu.Item onSelect={onSelect}>Rename</DropdownMenu.Item>
        </DropdownMenu.Content>
      </DropdownMenu.Root>,
    );

    expect(screen.queryByRole('menu')).toBeNull();
    await user.click(screen.getByRole('button', { name: 'Open' }));
    await user.click(await screen.findByRole('menuitem', { name: 'Rename' }));

    expect(onSelect).toHaveBeenCalledTimes(1);
    expect(onSelect.mock.calls[0][0]).toBeInstanceOf(Event);
    // Selecting an item closes the menu.
    expect(screen.queryByRole('menu')).toBeNull();
  });

  it('applies size, variant, material and color to the content', async () => {
    renderMenu(<DropdownMenu.Item>One</DropdownMenu.Item>, {
      size: '1',
      variant: 'soft',
      material: 'solid',
      color: 'red',
    });
    const menu = await screen.findByRole('menu');
    expect(menu).toHaveClass('rt-r-size-1', 'rt-variant-soft');
    expect(menu).toHaveAttribute('data-material', 'solid');
    expect(menu).toHaveAttribute('data-panel-background', 'solid');
    expect(menu).toHaveAttribute('data-accent-color', 'red');
    expect(menu).not.toHaveAttribute('color');
    expect(menu).not.toHaveAttribute('submenubehavior');
  });

  it('follows the nearest Theme material', async () => {
    render(
      <Theme material="translucent">
        <Theme material="solid">
          <DropdownMenu.Root defaultOpen>
            <DropdownMenu.Trigger>
              <Button>Open</Button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Content>
              <DropdownMenu.Item>One</DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Root>
        </Theme>
      </Theme>,
    );
    expect(await screen.findByRole('menu')).toHaveAttribute('data-material', 'solid');
  });

  it('renders shortcuts as hidden hints with aria-keyshortcuts', async () => {
    renderMenu(
      <>
        <DropdownMenu.Item shortcut="⌘ C">Copy</DropdownMenu.Item>
        <DropdownMenu.CheckboxItem shortcut="Ctrl+B" checked>
          Bold
        </DropdownMenu.CheckboxItem>
      </>,
    );

    const copy = await screen.findByRole('menuitem', { name: 'Copy' });
    expect(copy).toHaveAttribute('aria-keyshortcuts', 'Meta+C');
    expect(copy.querySelector('.rt-BaseMenuShortcut')).toHaveAttribute('aria-hidden', 'true');
    expect(screen.getByRole('menuitemcheckbox', { name: 'Bold' })).toHaveAttribute('aria-keyshortcuts', 'Control+B');
  });

  it('marks item colors with data-accent-color', async () => {
    renderMenu(<DropdownMenu.Item color="red">Delete</DropdownMenu.Item>);
    expect(await screen.findByRole('menuitem', { name: 'Delete' })).toHaveAttribute('data-accent-color', 'red');
  });

  it('toggles checkbox items and shows the check indicator', async () => {
    const onCheckedChange = vi.fn();
    const user = renderMenu(
      <DropdownMenu.CheckboxItem checked onCheckedChange={onCheckedChange}>
        Show grid
      </DropdownMenu.CheckboxItem>,
    );

    const item = await screen.findByRole('menuitemcheckbox', { name: 'Show grid' });
    expect(item).toHaveAttribute('aria-checked', 'true');
    expect(item.querySelector('.rt-DropdownMenuItemIndicatorIcon')).not.toBeNull();
    expect(item.querySelector('.rt-ContextMenuItemIndicatorIcon')).toBeNull();

    await user.click(item);
    expect(onCheckedChange).toHaveBeenCalledWith(false);
  });

  it('selects radio items and shows the dot indicator', async () => {
    const onValueChange = vi.fn();
    const user = renderMenu(
      <DropdownMenu.RadioGroup value="list" onValueChange={onValueChange}>
        <DropdownMenu.RadioItem value="list">List</DropdownMenu.RadioItem>
        <DropdownMenu.RadioItem value="grid">Grid</DropdownMenu.RadioItem>
      </DropdownMenu.RadioGroup>,
    );

    const list = await screen.findByRole('menuitemradio', { name: 'List' });
    expect(list).toHaveAttribute('aria-checked', 'true');
    expect(list.querySelector('.rt-BaseMenuItemIndicatorIcon')).not.toBeNull();

    await user.click(screen.getByRole('menuitemradio', { name: 'Grid' }));
    expect(onValueChange).toHaveBeenCalledWith('grid');
  });

  it('merges the TriggerIcon className', () => {
    const { container } = render(<DropdownMenu.TriggerIcon className="custom" />);
    expect(container.querySelector('svg')).toHaveClass('rt-DropdownMenuTriggerIcon', 'custom');
  });

  describe('cascade submenus', () => {
    it('opens a submenu with ArrowRight and closes it with ArrowLeft', async () => {
      const user = renderMenu(
        <>
          <DropdownMenu.Item>Edit</DropdownMenu.Item>
          <DropdownMenu.Sub>
            <DropdownMenu.SubTrigger>Share</DropdownMenu.SubTrigger>
            <DropdownMenu.SubContent>
              <DropdownMenu.Item>Email</DropdownMenu.Item>
            </DropdownMenu.SubContent>
          </DropdownMenu.Sub>
        </>,
      );

      await screen.findByRole('menu');
      await user.keyboard('{ArrowDown}{ArrowDown}');
      const trigger = screen.getByRole('menuitem', { name: 'Share' });
      expect(trigger).toHaveFocus();
      expect(trigger.querySelector('.rt-DropdownMenuSubTriggerIcon')).not.toBeNull();

      await user.keyboard('{ArrowRight}');
      expect(await screen.findByRole('menuitem', { name: 'Email' })).toBeInTheDocument();
      expect(trigger).toHaveAttribute('aria-expanded', 'true');

      await user.keyboard('{ArrowLeft}');
      expect(screen.queryByRole('menuitem', { name: 'Email' })).toBeNull();
    });

    it('lets SubContent override the parent surface without leaking props', async () => {
      const user = renderMenu(
        <DropdownMenu.Sub>
          <DropdownMenu.SubTrigger>Share</DropdownMenu.SubTrigger>
          <DropdownMenu.SubContent size="1" color="red" material="solid" data-testid="sub">
            <DropdownMenu.Item>Email</DropdownMenu.Item>
          </DropdownMenu.SubContent>
        </DropdownMenu.Sub>,
        { size: '2', color: 'blue', material: 'translucent' },
      );

      await openFirstSub(user, 'Share');
      const sub = await screen.findByTestId('sub');
      expect(sub).toHaveClass('rt-r-size-1');
      expect(sub).toHaveAttribute('data-accent-color', 'red');
      expect(sub).toHaveAttribute('data-material', 'solid');
      expect(sub).not.toHaveAttribute('color');
    });

    it('inherits the parent surface by default', async () => {
      const user = renderMenu(
        <DropdownMenu.Sub>
          <DropdownMenu.SubTrigger>Share</DropdownMenu.SubTrigger>
          <DropdownMenu.SubContent data-testid="sub">
            <DropdownMenu.Item>Email</DropdownMenu.Item>
          </DropdownMenu.SubContent>
        </DropdownMenu.Sub>,
        { size: '1', variant: 'soft', color: 'blue', material: 'solid' },
      );

      await openFirstSub(user, 'Share');
      const sub = await screen.findByTestId('sub');
      expect(sub).toHaveClass('rt-r-size-1', 'rt-variant-soft');
      expect(sub).toHaveAttribute('data-accent-color', 'blue');
      expect(sub).toHaveAttribute('data-material', 'solid');
    });

    it('never produces a NaN offset for a responsive size', async () => {
      const user = renderMenu(
        <DropdownMenu.Sub>
          <DropdownMenu.SubTrigger>Share</DropdownMenu.SubTrigger>
          <DropdownMenu.SubContent data-testid="sub">
            <DropdownMenu.Item>Email</DropdownMenu.Item>
          </DropdownMenu.SubContent>
        </DropdownMenu.Sub>,
        { size: { initial: '1', md: '2' } },
      );

      await openFirstSub(user, 'Share');
      const sub = await screen.findByTestId('sub');
      const wrapper = sub.parentElement as HTMLElement;
      expect(wrapper.getAttribute('style')).not.toContain('NaN');
    });
  });

  describe('virtualized', () => {
    it('skips the ScrollArea and lets VirtualMenu defer the menu role', async () => {
      renderMenu(<VirtualMenu items={['a', 'b']} itemLabel={(item: string) => item} aria-label="Letters" />, {
        virtualized: true,
      });

      const menu = await screen.findByRole('menu');
      expect(menu.querySelector('.rt-ScrollAreaRoot')).toBeNull();
      expect(menu.querySelector('.rt-virtualized')).not.toBeNull();
      // The nested list is a group; the content owns role="menu".
      expect(screen.getAllByRole('menu')).toHaveLength(1);
      expect(menu).not.toHaveAttribute('virtualized');
    });

    it('uses a vertical-only ScrollArea when not virtualized', async () => {
      renderMenu(<DropdownMenu.Item>One</DropdownMenu.Item>);
      const menu = await screen.findByRole('menu');
      expect(menu.querySelector('.rt-ScrollAreaRoot')).not.toBeNull();
      expect(menu.querySelector('.rt-ScrollAreaScrollbar[data-orientation="horizontal"]')).toBeNull();
    });
  });

  it('does not warn about unknown DOM props', async () => {
    const error = vi.spyOn(console, 'error').mockImplementation(() => {});
    const user = renderMenu(
      <>
        <DropdownMenu.Item shortcut="⌘ K">Search</DropdownMenu.Item>
        <DropdownMenu.Sub>
          <DropdownMenu.SubTrigger>More</DropdownMenu.SubTrigger>
          <DropdownMenu.SubContent virtualized>
            <DropdownMenu.Item>Nested</DropdownMenu.Item>
          </DropdownMenu.SubContent>
        </DropdownMenu.Sub>
      </>,
      { submenuBehavior: 'cascade', material: 'solid' },
    );
    await openFirstSub(user, 'More');
    await screen.findByRole('menuitem', { name: 'Nested' });
    const propWarnings = error.mock.calls.filter(([message]) =>
      /does not recognize|Unknown prop|non-boolean attribute|Invalid value for prop/i.test(String(message)),
    );
    expect(propWarnings).toEqual([]);
  });
});
