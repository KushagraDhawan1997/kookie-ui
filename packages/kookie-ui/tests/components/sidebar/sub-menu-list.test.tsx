import * as React from 'react';
import { describe, expect, it } from 'vitest';
import { renderWithProviders } from '../../test-utils';
import { Sidebar } from '../../../src/components/index';

describe('Sidebar sub-menu list', () => {
  it('nests its rows in a list, so no list item sits directly in another', () => {
    const { container } = renderWithProviders(
      <Sidebar.Menu>
        <Sidebar.MenuItem>
          <Sidebar.MenuSub defaultOpen>
            <Sidebar.MenuSubTrigger>Projects</Sidebar.MenuSubTrigger>
            <Sidebar.MenuSubContent>
              <Sidebar.MenuItem>
                <Sidebar.MenuButton>Atlas</Sidebar.MenuButton>
              </Sidebar.MenuItem>
            </Sidebar.MenuSubContent>
          </Sidebar.MenuSub>
        </Sidebar.MenuItem>
      </Sidebar.Menu>,
    );
    const inner = container.querySelectorAll('li li');
    expect(inner.length).toBeGreaterThan(0);
    for (const li of inner) expect(li.parentElement?.tagName).toMatch(/^(UL|OL)$/);
  });

  it('gives a bare MenuButton its own list item, so the list holds only list items', () => {
    const { container } = renderWithProviders(
      <Sidebar.Menu>
        <Sidebar.MenuItem>
          <Sidebar.MenuSub defaultOpen>
            <Sidebar.MenuSubTrigger>Projects</Sidebar.MenuSubTrigger>
            <Sidebar.MenuSubContent>
              <Sidebar.MenuButton asChild>
                <a href="#atlas">Atlas</a>
              </Sidebar.MenuButton>
              <Sidebar.MenuButton>Borealis</Sidebar.MenuButton>
            </Sidebar.MenuSubContent>
          </Sidebar.MenuSub>
        </Sidebar.MenuItem>
      </Sidebar.Menu>,
    );
    const list = container.querySelector('.kui-SidebarMenuSubList')!;
    expect(list.children).toHaveLength(2);
    for (const child of Array.from(list.children)) {
      expect(child.tagName).toBe('LI');
      expect(child).toHaveClass('kui-SidebarMenuItem');
    }
    expect(list.querySelector('li > a.kui-SidebarMenuButton')).not.toBeNull();
  });
});
