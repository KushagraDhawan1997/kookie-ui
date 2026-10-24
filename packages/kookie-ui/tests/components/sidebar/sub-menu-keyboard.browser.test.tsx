import * as React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { userEvent } from 'vitest/browser';
import { Shell, Sidebar, Theme } from '../../../src/components/index';

// Each sub-menu is a one-item Accordion. Its own arrow keys would keep focus on the trigger;
// Arrow Up and Down must move across the sidebar's rows as they do from a MenuButton.
describe('Sidebar sub-menu trigger and arrow keys', () => {
  it('moves focus past a sub-menu trigger in both directions', async () => {
    render(
      <Theme>
        <Shell.Root height="400px">
          <Shell.Sidebar defaultState="expanded" presentation="fixed">
            <Shell.Scroll>
              <Sidebar.Menu>
                <Sidebar.MenuItem>
                  <Sidebar.MenuButton>Home</Sidebar.MenuButton>
                </Sidebar.MenuItem>
                <Sidebar.MenuItem>
                  <Sidebar.MenuSub>
                    <Sidebar.MenuSubTrigger>Projects</Sidebar.MenuSubTrigger>
                    <Sidebar.MenuSubContent>
                      <Sidebar.MenuItem>
                        <Sidebar.MenuButton>Atlas</Sidebar.MenuButton>
                      </Sidebar.MenuItem>
                    </Sidebar.MenuSubContent>
                  </Sidebar.MenuSub>
                </Sidebar.MenuItem>
                <Sidebar.MenuItem>
                  <Sidebar.MenuButton>Settings</Sidebar.MenuButton>
                </Sidebar.MenuItem>
              </Sidebar.Menu>
            </Shell.Scroll>
          </Shell.Sidebar>
        </Shell.Root>
      </Theme>,
    );
    const trigger = screen.getByRole('button', { name: 'Projects' });
    trigger.focus();

    await userEvent.keyboard('{ArrowDown}');
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Settings' }));

    trigger.focus();
    await userEvent.keyboard('{ArrowUp}');
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Home' }));
  });
});
