import * as React from 'react';
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { Button, Shell, Sidebar, Theme } from '../../../src/components/index';

function Row() {
  return (
    <Sidebar.Menu>
      <Sidebar.MenuItem>
        <Sidebar.MenuButton>Home</Sidebar.MenuButton>
      </Sidebar.MenuItem>
    </Sidebar.Menu>
  );
}

// A row in Shell.Sidebar is as tall as a Button of the Shell's index.
describe('a Sidebar row in Shell.Sidebar sits on the control ladder', () => {
  for (const size of ['1', '2', '3'] as const) {
    it(`size ${size}`, () => {
      const { container } = render(
        <Theme>
          <Button size={size}>Button</Button>
          <Shell.Root size={size} height="400px">
            <Shell.Sidebar defaultState="expanded" presentation="fixed">
              <Shell.Scroll>
                <Row />
              </Shell.Scroll>
            </Shell.Sidebar>
          </Shell.Root>
        </Theme>,
      );
      const fromShell = container.querySelector<HTMLElement>('.kui-ShellSidebar .kui-SidebarMenuButton')!.getBoundingClientRect();
      const button = container.querySelector<HTMLElement>('.kui-Button')!.getBoundingClientRect().height;
      expect(fromShell.height).toBe(button);
      expect(fromShell.width).toBeGreaterThan(0);
    });
  }
});
