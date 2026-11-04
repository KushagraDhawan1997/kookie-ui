import * as React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import { userEvent } from 'vitest/browser';
import { Shell, Sidebar, Theme } from '../../../src/components/index';

const isTransparent = (color: string) => color === 'transparent' || /\/\s*0\)$|,\s*0\)$/.test(color);

const House = React.forwardRef<SVGSVGElement, React.ComponentPropsWithoutRef<'svg'>>((props, ref) => (
  <svg viewBox="0 0 16 16" width="16" height="16" aria-hidden {...props} ref={ref}>
    <circle cx="8" cy="8" r="4" fill="currentColor" />
  </svg>
));
House.displayName = 'House';

function Rail({ children }: { children: React.ReactNode }) {
  return (
    <Theme>
      <Shell.Root height="400px">
        <Shell.Rail defaultOpen presentation="fixed">
          <Shell.Scroll>
            <Sidebar.Menu>{children}</Sidebar.Menu>
          </Shell.Scroll>
        </Shell.Rail>
        <Shell.Content>content</Shell.Content>
      </Shell.Root>
    </Theme>
  );
}

describe('a Rail row', () => {
  it('an active link with a forwardRef icon paints its tile', () => {
    render(
      <Rail>
        <Sidebar.MenuItem>
          <Sidebar.MenuButton asChild isActive>
            <a href="#home">
              <House />
              Home
            </a>
          </Sidebar.MenuButton>
        </Sidebar.MenuItem>
      </Rail>,
    );
    const tile = screen.getByRole('link', { name: 'Home' }).querySelector<HTMLElement>('.kui-SidebarMenuIconWrapper');
    expect(tile).not.toBeNull();
    expect(isTransparent(getComputedStyle(tile!).backgroundColor)).toBe(false);
  });
});

describe('a Rail sub-menu', () => {
  it('opens with plain MenuButton rows, and a row runs its onClick', async () => {
    const onClick = vi.fn();
    render(
      <Rail>
        <Sidebar.MenuItem>
          <Sidebar.MenuSub>
            <Sidebar.MenuSubTrigger>Projects</Sidebar.MenuSubTrigger>
            <Sidebar.MenuSubContent>
              <Sidebar.MenuItem>
                <Sidebar.MenuButton onClick={onClick}>Atlas</Sidebar.MenuButton>
              </Sidebar.MenuItem>
              <Sidebar.MenuItem>
                <Sidebar.MenuButton asChild>
                  <a href="#borealis">Borealis</a>
                </Sidebar.MenuButton>
              </Sidebar.MenuItem>
            </Sidebar.MenuSubContent>
          </Sidebar.MenuSub>
        </Sidebar.MenuItem>
      </Rail>,
    );
    screen.getByRole('button', { name: 'Projects' }).focus();
    await userEvent.keyboard('{Enter}');
    const menu = await screen.findByRole('menu');
    expect(menu.querySelectorAll('[role="menuitem"]')).toHaveLength(2);
    expect(screen.getByRole('menuitem', { name: 'Borealis' }).tagName).toBe('A');
    await userEvent.click(screen.getByRole('menuitem', { name: 'Atlas' }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });
});

describe('sidebar.css', () => {
  it('has no rules for classes no component renders', () => {
    const selectors: string[] = [];
    const walk = (rules: CSSRuleList) => {
      for (const rule of Array.from(rules)) {
        if (rule instanceof CSSStyleRule) selectors.push(rule.selectorText);
        if ('cssRules' in rule && (rule as CSSGroupingRule).cssRules) walk((rule as CSSGroupingRule).cssRules);
      }
    };
    for (const sheet of Array.from(document.styleSheets)) walk(sheet.cssRules);
    const dead = selectors.filter((s) => /kui-Sidebar(Header|Footer):where\(\.kui-(flex|items|justify|gap)-|kui-BaseMenuSubList|kui-ShellRailContent \.kui-SidebarMenuSub(List|Content)/.test(s));
    expect(dead).toEqual([]);
  });
});
