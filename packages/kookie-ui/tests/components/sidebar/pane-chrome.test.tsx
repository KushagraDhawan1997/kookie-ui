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

  it('a Sidebar.Root inside the pane still sets its own index', () => {
    const { container } = renderWithProviders(
      <Shell.Root size="3">
        <Shell.Sidebar>
          <Sidebar.Root size="1">
            <Sidebar.Content>
              <Nav />
            </Sidebar.Content>
          </Sidebar.Root>
        </Shell.Sidebar>
      </Shell.Root>,
    );
    expect(container.querySelector('.rt-SidebarContent')).toHaveClass('rt-r-size-1');
  });
});

// Each warning is logged once per session, so these tests load fresh modules.
async function fresh() {
  vi.resetModules();
  return import('../../../src/components/index');
}

describe('the old Sidebar frame is deprecated', () => {
  it('Root, Content, Header, Footer, menuVariant and thin each warn', async () => {
    const { Sidebar } = await fresh();
    renderWithProviders(
      <Sidebar.Root presentation="thin" menuVariant="solid">
        <Sidebar.Header>Logo</Sidebar.Header>
        <Sidebar.Content>Rows</Sidebar.Content>
        <Sidebar.Footer>Settings</Sidebar.Footer>
      </Sidebar.Root>,
    );
    const messages = warnings().join('\n');
    for (const pattern of [/Sidebar\.Root is deprecated/, /Sidebar\.Content is deprecated/, /Sidebar\.Header is deprecated/, /Sidebar\.Footer is deprecated/, /menuVariant/, /thin mode/]) {
      expect(messages).toMatch(pattern);
    }
  });

  it("Shell.Sidebar's thinSize warns", async () => {
    const { Shell } = await fresh();
    renderWithProviders(
      <Shell.Root>
        <Shell.Sidebar thinSize={64}>x</Shell.Sidebar>
      </Shell.Root>,
    );
    expect(warnings().join('\n')).toMatch(/Shell\.Sidebar's thin mode is deprecated/);
  });
});
