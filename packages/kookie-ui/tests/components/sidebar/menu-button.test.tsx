import * as React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { fireEvent, renderWithProviders, screen } from '../../test-utils';
import { Shell, Sidebar } from '../../../src/components/index';

// A forwardRef icon whose name has no "Icon" in it, the way Lucide names its icons.
const House = React.forwardRef<SVGSVGElement, React.ComponentPropsWithoutRef<'svg'>>((props, ref) => <svg {...props} ref={ref} />);
House.displayName = 'House';

const NamedIcon = React.forwardRef<SVGSVGElement, React.ComponentPropsWithoutRef<'svg'>>((props, ref) => <svg {...props} ref={ref} />);
NamedIcon.displayName = 'HomeIcon';

function InRail({ children }: { children: React.ReactNode }) {
  return (
    <Shell.Root>
      <Shell.Rail defaultOpen>
        <Shell.Scroll>
          <Sidebar.Menu>
            <Sidebar.MenuItem>{children}</Sidebar.MenuItem>
          </Sidebar.Menu>
        </Shell.Scroll>
      </Shell.Rail>
    </Shell.Root>
  );
}

describe('Sidebar.MenuButton in a Rail puts the icon in its tile', () => {
  it('a forwardRef icon named *Icon', () => {
    const { container } = renderWithProviders(
      <InRail>
        <Sidebar.MenuButton isActive>
          <NamedIcon />
          Home
        </Sidebar.MenuButton>
      </InRail>,
    );
    expect(container.querySelector('.kui-SidebarMenuIconWrapper > svg')).not.toBeNull();
  });

  it('an icon of any name, ahead of the label', () => {
    const { container } = renderWithProviders(
      <InRail>
        <Sidebar.MenuButton isActive>
          <House />
          Home
        </Sidebar.MenuButton>
      </InRail>,
    );
    expect(container.querySelector('.kui-SidebarMenuIconWrapper > svg')).not.toBeNull();
    expect(container.querySelector('.kui-SidebarMenuLabel')).toHaveTextContent('Home');
  });

  it('a link rendered with asChild', () => {
    const { container } = renderWithProviders(
      <InRail>
        <Sidebar.MenuButton asChild isActive>
          <a href="/home">
            <House />
            Home
          </a>
        </Sidebar.MenuButton>
      </InRail>,
    );
    const link = screen.getByRole('link', { name: 'Home' });
    expect(link.querySelector('.kui-SidebarMenuIconWrapper > svg')).not.toBeNull();
    expect(container.querySelector('a > .kui-SidebarMenuLabel')).toHaveTextContent('Home');
  });
});

describe('Sidebar.MenuButton', () => {
  it('is type="button", so it does not submit a form', () => {
    renderWithProviders(
      <form>
        <Sidebar.MenuButton>Home</Sidebar.MenuButton>
      </form>,
    );
    expect(screen.getByRole('button', { name: 'Home' })).toHaveAttribute('type', 'button');
  });

  it('keeps a type the caller states', () => {
    renderWithProviders(<Sidebar.MenuButton type="submit">Save</Sidebar.MenuButton>);
    expect(screen.getByRole('button', { name: 'Save' })).toHaveAttribute('type', 'submit');
  });

  it('sets no type on an asChild link', () => {
    renderWithProviders(
      <Sidebar.MenuButton asChild>
        <a href="/x">Docs</a>
      </Sidebar.MenuButton>,
    );
    expect(screen.getByRole('link', { name: 'Docs' })).not.toHaveAttribute('type');
  });

  it('sizes its badge and shortcut by the Shell in an Inspector', () => {
    const { container } = renderWithProviders(
      <Shell.Root size="3">
        <Shell.Inspector defaultOpen>
          <Sidebar.MenuButton badge="New" shortcut="K">
            Item
          </Sidebar.MenuButton>
        </Shell.Inspector>
      </Shell.Root>,
    );
    expect(container.querySelector('.kui-Chip')).toHaveClass('kui-r-size-3');
    expect(container.querySelector('.kui-Kbd')).toHaveClass('kui-r-size-3');
  });

  it('wraps its own text in a label, and leaves text inside the caller’s elements alone', () => {
    const { container } = renderWithProviders(
      <Sidebar.MenuButton>
        Home
        <span className="custom">
          <span>Inner</span>
        </span>
      </Sidebar.MenuButton>,
    );
    const labels = Array.from(container.querySelectorAll('.kui-SidebarMenuLabel')).map((el) => el.textContent);
    expect(labels).toEqual(['Home']);
    expect(container.querySelector('.custom .kui-SidebarMenuLabel')).toBeNull();
  });

  it('runs the caller’s onKeyDown first, and preventDefault keeps the arrow keys', () => {
    const onKeyDown = vi.fn((event: React.KeyboardEvent) => event.preventDefault());
    renderWithProviders(
      <Shell.Root>
        <Shell.Sidebar defaultState="expanded" presentation="fixed">
          <Shell.Scroll>
            <Sidebar.Menu>
              <Sidebar.MenuItem>
                <Sidebar.MenuButton onKeyDown={onKeyDown}>One</Sidebar.MenuButton>
              </Sidebar.MenuItem>
              <Sidebar.MenuItem>
                <Sidebar.MenuButton>Two</Sidebar.MenuButton>
              </Sidebar.MenuItem>
            </Sidebar.Menu>
          </Shell.Scroll>
        </Shell.Sidebar>
      </Shell.Root>,
    );
    const one = screen.getByRole('button', { name: 'One' });
    one.focus();
    fireEvent.keyDown(one, { key: 'ArrowDown' });
    expect(onKeyDown).toHaveBeenCalledTimes(1);
    expect(document.activeElement).toBe(one);
  });
});

describe('Sidebar.Group', () => {
  it('is a group named by its label', () => {
    renderWithProviders(
      <Sidebar.Group>
        <Sidebar.GroupLabel>Projects</Sidebar.GroupLabel>
        <Sidebar.GroupContent>
          <Sidebar.MenuButton>Atlas</Sidebar.MenuButton>
        </Sidebar.GroupContent>
      </Sidebar.Group>,
    );
    expect(screen.getByRole('group', { name: 'Projects' })).toHaveClass('kui-SidebarGroup');
  });

  it('uses a label id the caller states', () => {
    renderWithProviders(
      <Sidebar.Group>
        <Sidebar.GroupLabel id="mine">Teams</Sidebar.GroupLabel>
      </Sidebar.Group>,
    );
    expect(screen.getByRole('group', { name: 'Teams' })).toHaveAttribute('aria-labelledby', 'mine');
  });

  it('is no group without a label', () => {
    const { container } = renderWithProviders(
      <Sidebar.Group>
        <Sidebar.MenuButton>Atlas</Sidebar.MenuButton>
      </Sidebar.Group>,
    );
    expect(screen.queryByRole('group')).toBeNull();
    expect(container.querySelector('.kui-SidebarGroup')).not.toHaveAttribute('role');
  });
});
