import * as React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { renderWithProviders, screen } from '../../test-utils';
import { Shell, Sidebar } from '../../../src/components/index';

let warn: ReturnType<typeof vi.spyOn>;

beforeEach(() => {
  warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
});

afterEach(() => {
  vi.restoreAllMocks();
});

function warnings() {
  return warn.mock.calls.map((call: unknown[]) => String(call[0]));
}

function Nav() {
  return (
    <Sidebar.Menu>
      <Sidebar.MenuItem>
        <Sidebar.MenuButton isActive>Home</Sidebar.MenuButton>
      </Sidebar.MenuItem>
    </Sidebar.Menu>
  );
}

describe('Sidebar parts inside Shell.Sidebar', () => {
  it('take the Shell index with no Sidebar.Root', () => {
    const { container } = renderWithProviders(
      <Shell.Root size="3">
        <Shell.Sidebar>
          <Shell.PaneHeader>Logo</Shell.PaneHeader>
          <Shell.Scroll role="navigation" aria-label="Main">
            <Nav />
          </Shell.Scroll>
          <Shell.PaneFooter>Settings</Shell.PaneFooter>
        </Shell.Sidebar>
      </Shell.Root>,
    );
    for (const selector of ['.rt-ShellPaneHeader', '.rt-SidebarContent', '.rt-ShellPaneFooter']) {
      expect(container.querySelector(selector), selector).toHaveClass('rt-r-size-3', 'rt-menu-variant-soft');
    }
    expect(screen.getByRole('navigation', { name: 'Main' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Home' })).toHaveAttribute('aria-current', 'page');
    expect(warnings().filter((message) => message.includes('[kookie-ui]'))).toEqual([]);
  });

  it('default to index 2, and Shell.Panel scopes them too', () => {
    const { container } = renderWithProviders(
      <Shell.Root>
        <Shell.Panel>
          <Shell.Scroll>
            <Nav />
          </Shell.Scroll>
        </Shell.Panel>
      </Shell.Root>,
    );
    expect(container.querySelector('.rt-SidebarContent')).toHaveClass('rt-r-size-2');
  });

  it('Shell.Scroll is not a landmark unless asked', () => {
    renderWithProviders(
      <Shell.Root>
        <Shell.Sidebar>
          <Shell.Scroll>
            <Nav />
          </Shell.Scroll>
        </Shell.Sidebar>
      </Shell.Root>,
    );
    expect(screen.queryByRole('navigation')).toBeNull();
  });

  it('in a Rail, rows and the footer are thin tiles', () => {
    const { container } = renderWithProviders(
      <Shell.Root>
        <Shell.Rail defaultOpen>
          <Shell.Scroll>
            <Nav />
          </Shell.Scroll>
          <Shell.PaneFooter>
            <Sidebar.MenuButton>
              <svg />
              Settings
            </Sidebar.MenuButton>
          </Shell.PaneFooter>
        </Shell.Rail>
        <Shell.Sidebar>
          <Shell.Scroll>
            <Sidebar.MenuButton>
              <svg />
              Full
            </Sidebar.MenuButton>
          </Shell.Scroll>
        </Shell.Sidebar>
      </Shell.Root>,
    );
    expect(container.querySelector('.rt-ShellRail .rt-ShellPaneFooter .rt-SidebarMenuIconWrapper')).not.toBeNull();
    expect(container.querySelector('.rt-ShellSidebar .rt-SidebarMenuIconWrapper')).toBeNull();
  });
});
