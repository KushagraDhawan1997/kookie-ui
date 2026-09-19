import * as React from 'react';
import { afterEach, describe, it, expect, vi } from 'vitest';
import userEvent from '@testing-library/user-event';
import { renderWithProviders, screen, waitFor, act } from '../../test-utils';
import * as DropdownMenu from '../../../src/components/dropdown-menu';
import { Button } from '../../../src/components/button';

/*
 * jsdom loads no CSS, so visibility assertions prove nothing here. These tests
 * assert what is mounted, which attributes mark the active level, and where
 * focus is. Each of them fails if push, pop or focus handling is broken.
 */

function NestedMenu(props: {
  contentProps?: Partial<DropdownMenu.ContentProps>;
  subProps?: Partial<DropdownMenu.SubProps>;
  subTriggerProps?: Partial<DropdownMenu.SubTriggerProps>;
  open?: boolean;
  onOpenChange?: (open: boolean) => void;
}) {
  return (
    <DropdownMenu.Root defaultOpen={props.open === undefined ? true : undefined} open={props.open} onOpenChange={props.onOpenChange}>
      <DropdownMenu.Trigger>
        <Button>Open</Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content submenuBehavior="drill-down" {...props.contentProps}>
        <DropdownMenu.Item>Edit</DropdownMenu.Item>
        <DropdownMenu.Sub label="Share" {...props.subProps}>
          <DropdownMenu.SubTrigger {...props.subTriggerProps}>Share</DropdownMenu.SubTrigger>
          <DropdownMenu.SubContent>
            <DropdownMenu.Item>Email</DropdownMenu.Item>
            <DropdownMenu.Item>Messages</DropdownMenu.Item>
            <DropdownMenu.Sub label="More">
              <DropdownMenu.SubTrigger>More</DropdownMenu.SubTrigger>
              <DropdownMenu.SubContent>
                <DropdownMenu.Item>Notes</DropdownMenu.Item>
              </DropdownMenu.SubContent>
            </DropdownMenu.Sub>
          </DropdownMenu.SubContent>
        </DropdownMenu.Sub>
        <DropdownMenu.Item>Delete</DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  );
}

function getRoot() {
  const root = document.querySelector('.rt-DropdownMenuDrillDownRoot');
  if (!root) throw new Error('drill-down root not rendered');
  return root;
}

function getActivePanel() {
  return document.querySelector('.rt-DropdownMenuDrillDownPanel[data-drill-down-active]');
}

async function openMenu(ui: React.ReactElement) {
  const user = userEvent.setup();
  renderWithProviders(ui);
  await screen.findByRole('menu');
  return user;
}

describe('DropdownMenu drill-down', () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  describe('rendering', () => {
    it('mounts only the root level on open', async () => {
      await openMenu(<NestedMenu />);

      expect(screen.getByRole('menuitem', { name: 'Edit' })).toBeInTheDocument();
      expect(screen.getByRole('menuitem', { name: 'Share' })).toBeInTheDocument();
      // Submenu items are not mounted until their panel is on the stack.
      expect(screen.queryByText('Email')).toBeNull();
      expect(screen.queryByText('Notes')).toBeNull();
      expect(document.querySelector('.rt-DropdownMenuDrillDownPanel')).toBeNull();
      expect(getRoot()).not.toHaveAttribute('data-drill-down-active');
      expect(getRoot()).toHaveAttribute('data-submenu-behavior', 'drill-down');
    });

    it('replaces the root items with the panel on click', async () => {
      const user = await openMenu(<NestedMenu />);

      await user.click(screen.getByRole('menuitem', { name: 'Share' }));

      expect(getRoot()).toHaveAttribute('data-drill-down-active');
      expect(getRoot()).toHaveAttribute('data-animation-direction', 'forward');
      const panel = getActivePanel();
      expect(panel).not.toBeNull();
      expect(panel).toHaveAttribute('data-animation-direction', 'forward');
      expect(panel).toHaveAttribute('role', 'group');
      expect(panel).toHaveAttribute('aria-label', 'Share');
      // Only the active level's items are in the menu.
      const names = screen.getAllByRole('menuitem').map((item) => item.textContent);
      expect(names).toEqual(['Share', 'Email', 'Messages', 'More']);
      expect(screen.queryByText('Edit')).toBeNull();
      expect(screen.queryByText('Delete')).toBeNull();
    });

    it('goes back to the root with the back row', async () => {
      const user = await openMenu(<NestedMenu />);

      await user.click(screen.getByRole('menuitem', { name: 'Share' }));
      await user.click(screen.getByRole('menuitem', { name: 'Back from Share' }));

      expect(getActivePanel()).toBeNull();
      expect(getRoot()).not.toHaveAttribute('data-drill-down-active');
      expect(getRoot()).toHaveAttribute('data-animation-direction', 'backward');
      expect(screen.getByRole('menuitem', { name: 'Edit' })).toBeInTheDocument();
      expect(screen.queryByText('Email')).toBeNull();
    });

    it('navigates three levels and back one at a time', async () => {
      const user = await openMenu(<NestedMenu />);

      await user.click(screen.getByRole('menuitem', { name: 'Share' }));
      await user.click(screen.getByRole('menuitem', { name: 'More' }));

      expect(getActivePanel()).toHaveAttribute('aria-label', 'More');
      expect(screen.getAllByRole('menuitem').map((item) => item.textContent)).toEqual(['More', 'Notes']);

      await user.click(screen.getByRole('menuitem', { name: 'Back from More' }));
      expect(getActivePanel()).toHaveAttribute('aria-label', 'Share');
      expect(screen.getByRole('menuitem', { name: 'Email' })).toBeInTheDocument();
      expect(screen.queryByText('Notes')).toBeNull();
    });

    it('keeps sibling submenus independent', async () => {
      const user = await openMenu(
        <DropdownMenu.Root defaultOpen>
          <DropdownMenu.Trigger>
            <Button>Open</Button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Content submenuBehavior="drill-down">
            <DropdownMenu.Sub label="A">
              <DropdownMenu.SubTrigger>Go to A</DropdownMenu.SubTrigger>
              <DropdownMenu.SubContent>
                <DropdownMenu.Item>Item in A</DropdownMenu.Item>
              </DropdownMenu.SubContent>
            </DropdownMenu.Sub>
            <DropdownMenu.Sub label="B">
              <DropdownMenu.SubTrigger>Go to B</DropdownMenu.SubTrigger>
              <DropdownMenu.SubContent>
                <DropdownMenu.Item>Item in B</DropdownMenu.Item>
              </DropdownMenu.SubContent>
            </DropdownMenu.Sub>
          </DropdownMenu.Content>
        </DropdownMenu.Root>,
      );

      await user.click(screen.getByRole('menuitem', { name: 'Go to B' }));
      expect(screen.getByText('Item in B')).toBeInTheDocument();
      expect(screen.queryByText('Item in A')).toBeNull();
    });

    it('shows panels nested inside groups and radio groups', async () => {
      const user = await openMenu(
        <DropdownMenu.Root defaultOpen>
          <DropdownMenu.Trigger>
            <Button>Open</Button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Content submenuBehavior="drill-down">
            <DropdownMenu.Group>
              <DropdownMenu.RadioGroup value="a">
                <DropdownMenu.RadioItem value="a">Alpha</DropdownMenu.RadioItem>
                <DropdownMenu.Sub>
                  <DropdownMenu.SubTrigger>Deep</DropdownMenu.SubTrigger>
                  <DropdownMenu.SubContent>
                    <DropdownMenu.Item>Deep item</DropdownMenu.Item>
                  </DropdownMenu.SubContent>
                </DropdownMenu.Sub>
              </DropdownMenu.RadioGroup>
            </DropdownMenu.Group>
          </DropdownMenu.Content>
        </DropdownMenu.Root>,
      );

      await user.click(screen.getByRole('menuitem', { name: 'Deep' }));
      expect(screen.getByRole('menuitem', { name: 'Deep item' })).toBeInTheDocument();
      expect(screen.queryByText('Alpha')).toBeNull();
    });
  });

  describe('keyboard', () => {
    it('reaches the sub trigger with arrow keys and opens it with Enter', async () => {
      const user = await openMenu(<NestedMenu />);

      await user.keyboard('{ArrowDown}');
      expect(screen.getByRole('menuitem', { name: 'Edit' })).toHaveFocus();
      await user.keyboard('{ArrowDown}');
      const trigger = screen.getByRole('menuitem', { name: 'Share' });
      expect(trigger).toHaveFocus();
      expect(trigger).toHaveAttribute('aria-haspopup', 'menu');

      await user.keyboard('{Enter}');

      // Focus moves into the new panel, onto its first option.
      expect(screen.getByRole('menuitem', { name: 'Email' })).toHaveFocus();
      // The back row is one ArrowUp away.
      await user.keyboard('{ArrowUp}');
      expect(screen.getByRole('menuitem', { name: 'Back from Share' })).toHaveFocus();
    });

    it('opens with ArrowRight and goes back with ArrowLeft, returning focus to the trigger', async () => {
      const user = await openMenu(<NestedMenu />);

      await user.keyboard('{ArrowDown}{ArrowDown}');
      await user.keyboard('{ArrowRight}');
      expect(screen.getByRole('menuitem', { name: 'Email' })).toHaveFocus();

      await user.keyboard('{ArrowLeft}');
      expect(getActivePanel()).toBeNull();
      expect(screen.getByRole('menuitem', { name: 'Share' })).toHaveFocus();
    });

    it('goes back one level on Escape instead of closing', async () => {
      const onOpenChange = vi.fn();
      const user = await openMenu(<NestedMenu open onOpenChange={onOpenChange} />);

      await user.keyboard('{ArrowDown}{ArrowDown}{Enter}');
      await user.keyboard('{ArrowDown}{ArrowDown}{Enter}');
      expect(getActivePanel()).toHaveAttribute('aria-label', 'More');

      await user.keyboard('{Escape}');
      expect(getActivePanel()).toHaveAttribute('aria-label', 'Share');
      expect(screen.getByRole('menuitem', { name: 'More' })).toHaveFocus();

      await user.keyboard('{Escape}');
      expect(getActivePanel()).toBeNull();
      expect(screen.getByRole('menuitem', { name: 'Share' })).toHaveFocus();
      expect(onOpenChange).not.toHaveBeenCalled();

      // At the root, Escape closes the menu as usual.
      await user.keyboard('{Escape}');
      expect(onOpenChange).toHaveBeenCalledWith(false);
    });

    it('selects the back row with Enter', async () => {
      const user = await openMenu(<NestedMenu />);

      await user.keyboard('{ArrowDown}{ArrowDown}{Enter}{ArrowUp}{Enter}');
      expect(getActivePanel()).toBeNull();
      expect(screen.getByRole('menuitem', { name: 'Share' })).toHaveFocus();
    });

    it('typeahead only matches items of the active level', async () => {
      const user = await openMenu(<NestedMenu />);

      await user.keyboard('{ArrowDown}{ArrowDown}{Enter}');
      // "Edit" and "Delete" are root items; "e" must land on "Email".
      await user.keyboard('{ArrowDown}');
      await user.keyboard('e');
      await waitFor(() => expect(screen.getByRole('menuitem', { name: 'Email' })).toHaveFocus());
    });

    it('moves focus to the menu, not an item, after a pointer click', async () => {
      const user = await openMenu(<NestedMenu />);

      await user.click(screen.getByRole('menuitem', { name: 'Share' }));
      expect(screen.getByRole('menu')).toHaveFocus();
    });
  });

  describe('props', () => {
    it('does not open a disabled sub trigger', async () => {
      const user = await openMenu(<NestedMenu subTriggerProps={{ disabled: true }} />);

      const trigger = screen.getByRole('menuitem', { name: 'Share' });
      expect(trigger).toHaveAttribute('aria-disabled', 'true');
      expect(trigger).toHaveAttribute('data-disabled');
      await user.click(trigger);
      trigger.focus();
      await user.keyboard('{ArrowRight}');
      expect(getActivePanel()).toBeNull();
    });

    it('forwards sub trigger props and composes onKeyDown', async () => {
      const onKeyDown = vi.fn();
      const user = await openMenu(
        <NestedMenu subTriggerProps={{ id: 'share-trigger', 'data-testid': 'share', onKeyDown } as never} />,
      );

      const trigger = screen.getByTestId('share');
      expect(trigger).toHaveAttribute('id', 'share-trigger');
      trigger.focus();
      await user.keyboard('{ArrowRight}');
      expect(onKeyDown).toHaveBeenCalled();
      expect(getActivePanel()).not.toBeNull();
    });

    it('forwards sub content DOM props and drops positioning props', async () => {
      const user = await openMenu(
        <DropdownMenu.Root defaultOpen>
          <DropdownMenu.Trigger>
            <Button>Open</Button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Content submenuBehavior="drill-down">
            <DropdownMenu.Sub>
              <DropdownMenu.SubTrigger>Share</DropdownMenu.SubTrigger>
              <DropdownMenu.SubContent data-testid="panel" sideOffset={8} color="red" virtualized>
                <DropdownMenu.Item>Email</DropdownMenu.Item>
              </DropdownMenu.SubContent>
            </DropdownMenu.Sub>
          </DropdownMenu.Content>
        </DropdownMenu.Root>,
      );

      await user.click(screen.getByRole('menuitem', { name: 'Share' }));
      const panel = screen.getByTestId('panel');
      expect(panel).not.toHaveAttribute('sideoffset');
      expect(panel).not.toHaveAttribute('color');
      expect(panel).not.toHaveAttribute('virtualized');
    });

    it('opens the panel from a controlled Sub open prop and reports changes', async () => {
      const onOpenChange = vi.fn();
      function Controlled() {
        const [open, setOpen] = React.useState(false);
        return (
          <>
            <button type="button" onClick={() => setOpen(true)}>
              external
            </button>
            <NestedMenu
              subProps={{
                open,
                onOpenChange: (next) => {
                  onOpenChange(next);
                  setOpen(next);
                },
              }}
            />
          </>
        );
      }
      renderWithProviders(<Controlled />);
      await screen.findByRole('menu');
      expect(getActivePanel()).toBeNull();

      act(() => {
        screen.getByText('external').click();
      });
      await waitFor(() => expect(getActivePanel()).toHaveAttribute('aria-label', 'Share'));
      expect(onOpenChange).toHaveBeenLastCalledWith(true);

      const user = userEvent.setup();
      await user.click(screen.getByRole('menuitem', { name: 'Back from Share' }));
      expect(getActivePanel()).toBeNull();
      expect(onOpenChange).toHaveBeenLastCalledWith(false);
    });

    it('opens a Sub with defaultOpen on mount', async () => {
      await openMenu(<NestedMenu subProps={{ defaultOpen: true }} />);
      expect(getActivePanel()).toHaveAttribute('aria-label', 'Share');
      expect(screen.getByRole('menuitem', { name: 'Email' })).toBeInTheDocument();
    });

    it('starts at the root again when a force-mounted menu reopens', async () => {
      function Reopen() {
        const [open, setOpen] = React.useState(true);
        return (
          <>
            <button type="button" onClick={() => setOpen((o) => !o)}>
              toggle
            </button>
            <NestedMenu open={open} onOpenChange={setOpen} contentProps={{ forceMount: true }} />
          </>
        );
      }
      const user = userEvent.setup();
      renderWithProviders(<Reopen />);
      await user.click(screen.getByRole('menuitem', { name: 'Share' }));
      expect(getActivePanel()).not.toBeNull();

      act(() => screen.getByText('toggle').click());
      act(() => screen.getByText('toggle').click());
      expect(getActivePanel()).toBeNull();
      expect(screen.getByText('Edit')).toBeInTheDocument();
    });
  });

  describe('behavior switching', () => {
    const viewport = { width: 1024, listeners: new Set<() => void>() };

    function installViewport(width: number) {
      viewport.width = width;
      viewport.listeners.clear();
      vi.stubGlobal('matchMedia', (query: string) => {
        const min = Number(/min-width:\s*(\d+)px/.exec(query)?.[1] ?? 0);
        return {
          media: query,
          get matches() {
            return viewport.width >= min;
          },
          addEventListener: (_: string, cb: () => void) => viewport.listeners.add(cb),
          removeEventListener: (_: string, cb: () => void) => viewport.listeners.delete(cb),
          addListener: (cb: () => void) => viewport.listeners.add(cb),
          removeListener: (cb: () => void) => viewport.listeners.delete(cb),
          dispatchEvent: () => false,
          onchange: null,
        } as unknown as MediaQueryList;
      });
    }

    function resize(width: number) {
      viewport.width = width;
      act(() => viewport.listeners.forEach((cb) => cb()));
    }

    /** The breakpoint hook caches its media queries per module, so each test loads fresh modules. */
    async function renderResponsive() {
      vi.resetModules();
      const Fresh = await import('../../../src/components/dropdown-menu');
      const { Theme } = await import('../../../src/components/theme');
      const { render } = await import('@testing-library/react');
      render(
        <Theme>
          <Fresh.Root defaultOpen>
            <Fresh.Trigger>
              <button type="button">Open</button>
            </Fresh.Trigger>
            <Fresh.Content submenuBehavior={{ initial: 'drill-down', md: 'cascade' }}>
              <Fresh.Item>Edit</Fresh.Item>
              <Fresh.Sub>
                <Fresh.SubTrigger>Share</Fresh.SubTrigger>
                <Fresh.SubContent>
                  <Fresh.Item>Email</Fresh.Item>
                </Fresh.SubContent>
              </Fresh.Sub>
            </Fresh.Content>
          </Fresh.Root>
        </Theme>,
      );
      await screen.findByRole('menu');
      return userEvent.setup();
    }

    it('resolves a responsive submenuBehavior to drill-down on a narrow viewport', async () => {
      installViewport(400);
      const user = await renderResponsive();

      expect(getRoot()).toHaveAttribute('data-submenu-behavior', 'drill-down');
      await user.click(screen.getByRole('menuitem', { name: 'Share' }));
      expect(getActivePanel()).not.toBeNull();
    });

    it('resolves a responsive submenuBehavior to cascade on a wide viewport', async () => {
      installViewport(1200);
      await renderResponsive();

      expect(getRoot()).toHaveAttribute('data-submenu-behavior', 'cascade');
      // Radix cascade sub triggers expose their expanded state.
      expect(screen.getByRole('menuitem', { name: 'Share' })).toHaveAttribute('aria-expanded', 'false');
    });

    it('does not remount root items when the behavior switches', async () => {
      installViewport(1200);
      await renderResponsive();

      const edit = screen.getByRole('menuitem', { name: 'Edit' });
      resize(400);

      expect(getRoot()).toHaveAttribute('data-submenu-behavior', 'drill-down');
      expect(screen.getByRole('menuitem', { name: 'Edit' })).toBe(edit);
    });

    it('drops back to the root when switching to cascade mid-navigation', async () => {
      installViewport(400);
      const user = await renderResponsive();

      await user.click(screen.getByRole('menuitem', { name: 'Share' }));
      expect(getActivePanel()).not.toBeNull();
      resize(1200);

      expect(getRoot()).toHaveAttribute('data-submenu-behavior', 'cascade');
      expect(getActivePanel()).toBeNull();
      expect(screen.getByRole('menuitem', { name: 'Edit' })).toBeInTheDocument();
      resize(400);
      expect(getActivePanel()).toBeNull();
    });
  });
});
