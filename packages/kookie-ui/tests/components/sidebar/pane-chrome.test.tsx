import * as React from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { renderWithProviders, screen } from '../../test-utils';
import { Shell, Sidebar, Toolbar, ToolbarButton } from '../../../src/components/index';

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

describe('pane chrome in a pane with no Sidebar scope', () => {
  it('takes the Shell index in an Inspector and a Bottom', () => {
    const { container } = renderWithProviders(
      <Shell.Root size="3">
        <Shell.Inspector>
          <Shell.PaneHeader>Inspector</Shell.PaneHeader>
        </Shell.Inspector>
        <Shell.Bottom>
          <Shell.PaneFooter>Bottom</Shell.PaneFooter>
        </Shell.Bottom>
      </Shell.Root>,
    );
    expect(container.querySelector('.rt-ShellInspector .rt-ShellPaneHeader')).toHaveClass('rt-r-size-3');
    expect(container.querySelector('.rt-ShellBottom .rt-ShellPaneFooter')).toHaveClass('rt-r-size-3');
  });
});

// A Toolbar in a pane's header or footer rests one step above the Shell's index (v2 BAND_STEP).
describe('a Toolbar in pane chrome', () => {
  function Band({ size }: { size?: '1' | '2' | '3' | '4' }) {
    return (
      <Toolbar size={size} aria-label="Pane">
        <ToolbarButton>Go</ToolbarButton>
      </Toolbar>
    );
  }

  for (const [shell, band] of [['1', '2'], ['2', '3'], ['3', '4']] as const) {
    it(`rests at ${band} in a Shell of size ${shell}`, () => {
      const { container } = renderWithProviders(
        <Shell.Root size={shell}>
          <Shell.Sidebar>
            <Shell.PaneHeader>
              <Band />
            </Shell.PaneHeader>
            <Shell.PaneFooter>
              <Band />
            </Shell.PaneFooter>
          </Shell.Sidebar>
        </Shell.Root>,
      );
      for (const selector of ['.rt-ShellPaneHeader .rt-Toolbar', '.rt-ShellPaneFooter .rt-Toolbar']) {
        expect(container.querySelector(selector), selector).toHaveClass(`rt-r-size-${band}`);
      }
      expect(container.querySelector('.rt-ShellPaneHeader .rt-BaseButton')).toHaveClass(`rt-r-size-${band}`);
    });
  }

  it('keeps a size it states', () => {
    const { container } = renderWithProviders(
      <Shell.Root size="2">
        <Shell.Sidebar>
          <Shell.PaneHeader>
            <Band size="1" />
          </Shell.PaneHeader>
        </Shell.Sidebar>
      </Shell.Root>,
    );
    expect(container.querySelector('.rt-Toolbar')).toHaveClass('rt-r-size-1');
  });

  it('takes the step in an Inspector too, and not in the scrolling list or outside a pane', () => {
    const { container } = renderWithProviders(
      <>
        <Shell.Root size="2">
          <Shell.Inspector>
            <Shell.PaneHeader>
              <Band />
            </Shell.PaneHeader>
          </Shell.Inspector>
          <Shell.Sidebar>
            <Shell.Scroll>
              <Band />
            </Shell.Scroll>
          </Shell.Sidebar>
        </Shell.Root>
        <Band />
      </>,
    );
    const toolbars = container.querySelectorAll('.rt-Toolbar');
    expect(container.querySelector('.rt-ShellInspector .rt-Toolbar')).toHaveClass('rt-r-size-3');
    expect(container.querySelector('.rt-ShellScroll .rt-Toolbar')).toHaveClass('rt-r-size-2');
    expect(toolbars[toolbars.length - 1]).toHaveClass('rt-r-size-2');
  });
});
