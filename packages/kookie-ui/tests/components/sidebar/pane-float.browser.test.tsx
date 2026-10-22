import * as React from 'react';
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { Shell, Sidebar, Theme, Toolbar, ToolbarButton } from '../../../src/components/index';

function Rows() {
  return (
    <Sidebar.Menu>
      {Array.from({ length: 30 }, (_, i) => (
        <Sidebar.MenuItem key={i}>
          <Sidebar.MenuButton>Row {i}</Sidebar.MenuButton>
        </Sidebar.MenuItem>
      ))}
    </Sidebar.Menu>
  );
}

function renderPane(toolbarSize?: '1' | '2' | '3' | '4') {
  const row = toolbarSize ? (
    <Toolbar size={toolbarSize} backdrop aria-label="Pane">
      <ToolbarButton>Search</ToolbarButton>
    </Toolbar>
  ) : (
    <span>Title</span>
  );
  return render(
    <Theme>
      <Shell.Root size="2" height="400px">
        <Shell.Sidebar defaultState="expanded" presentation="fixed">
          <Shell.PaneHeader float>{row}</Shell.PaneHeader>
          <Shell.Scroll fade>
            <Rows />
          </Shell.Scroll>
          <Shell.PaneFooter float>{row}</Shell.PaneFooter>
        </Shell.Sidebar>
      </Shell.Root>
    </Theme>,
  );
}

describe('floating pane rows', () => {
  for (const toolbarSize of [undefined, '3', '4'] as const) {
    it(`the list runs under the rows and starts clear of them (toolbar ${toolbarSize ?? 'none'})`, () => {
      const { container } = renderPane(toolbarSize);
      const header = container.querySelector<HTMLElement>('.rt-ShellPaneHeader')!.getBoundingClientRect();
      const footer = container.querySelector<HTMLElement>('.rt-ShellPaneFooter')!.getBoundingClientRect();
      const scroll = container.querySelector<HTMLElement>('.rt-ShellScroll')!.getBoundingClientRect();
      const list = getComputedStyle(container.querySelector<HTMLElement>('.rt-ShellScroll .rt-ScrollAreaViewport > *')!);

      expect(scroll.top).toBe(header.top);
      expect(scroll.bottom).toBe(footer.bottom);
      expect(parseFloat(list.paddingTop)).toBeCloseTo(header.height, 0);
      expect(parseFloat(list.paddingBottom)).toBeCloseTo(footer.height, 0);
    });
  }

  it('the row lets clicks through between its controls', () => {
    const { container } = renderPane('3');
    const header = container.querySelector<HTMLElement>('.rt-ShellPaneHeader')!;
    expect(getComputedStyle(header).pointerEvents).toBe('none');
    expect(getComputedStyle(header.querySelector('.rt-Toolbar')!).pointerEvents).toBe('none');
    expect(getComputedStyle(header.querySelector('.rt-BaseButton')!).pointerEvents).toBe('auto');
  });

  it('a backdrop toolbar rests its buttons raised', () => {
    const { container } = renderPane('3');
    expect(container.querySelector('.rt-ShellPaneHeader .rt-BaseButton')!.className).toContain('rt-variant-raised');
  });
});
