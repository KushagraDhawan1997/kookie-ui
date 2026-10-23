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

function renderPane(toolbarSize?: '1' | '2' | '3' | '4' | 'band', shellSize: '1' | '2' | '3' = '2') {
  const row = toolbarSize ? (
    <Toolbar size={toolbarSize === 'band' ? undefined : toolbarSize} backdrop aria-label="Pane">
      <ToolbarButton>Search</ToolbarButton>
    </Toolbar>
  ) : (
    <span>Title</span>
  );
  return render(
    <Theme>
      <Shell.Root size={shellSize} height="400px">
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
  for (const toolbarSize of [undefined, 'band', '1', '3', '4'] as const) {
    it(`the list runs under the rows and starts clear of them (toolbar ${toolbarSize ?? 'none'})`, () => {
      const { container } = renderPane(toolbarSize);
      const header = container.querySelector<HTMLElement>('.kui-ShellPaneHeader')!.getBoundingClientRect();
      const footer = container.querySelector<HTMLElement>('.kui-ShellPaneFooter')!.getBoundingClientRect();
      const scroll = container.querySelector<HTMLElement>('.kui-ShellScroll')!.getBoundingClientRect();
      const list = getComputedStyle(container.querySelector<HTMLElement>('.kui-ShellScroll .kui-ScrollAreaViewport > *')!);

      expect(scroll.top).toBe(header.top);
      expect(scroll.bottom).toBe(footer.bottom);
      expect(parseFloat(list.paddingTop)).toBeCloseTo(header.height, 0);
      expect(parseFloat(list.paddingBottom)).toBeCloseTo(footer.height, 0);
    });
  }

  it('the row lets clicks through between its controls', () => {
    const { container } = renderPane('3');
    const header = container.querySelector<HTMLElement>('.kui-ShellPaneHeader')!;
    expect(getComputedStyle(header).pointerEvents).toBe('none');
    expect(getComputedStyle(header.querySelector('.kui-Toolbar')!).pointerEvents).toBe('none');
    expect(getComputedStyle(header.querySelector('.kui-BaseButton')!).pointerEvents).toBe('auto');
  });

  it('a backdrop toolbar rests its buttons raised', () => {
    const { container } = renderPane('3');
    expect(container.querySelector('.kui-ShellPaneHeader .kui-BaseButton')!.className).toContain('kui-variant-raised');
  });

  // The pane pads by --surface-p-N at the Shell's index: 16, 24, 32.
  for (const [shellSize, pad, band] of [['1', 16, 32], ['2', 24, 40], ['3', 32, 48]] as const) {
    it(`a floating row pads by the surface padding, and a band toolbar is one step up (size ${shellSize})`, () => {
      const { container } = renderPane('band', shellSize);
      const header = container.querySelector<HTMLElement>('.kui-ShellPaneHeader')!;
      const style = getComputedStyle(header);
      expect(parseFloat(style.paddingTop)).toBe(pad);
      expect(parseFloat(style.paddingInlineStart)).toBe(pad);
      const toolbar = header.querySelector<HTMLElement>('.kui-Toolbar')!.getBoundingClientRect();
      expect(toolbar.height).toBe(band);
      expect(header.getBoundingClientRect().height).toBe(band + 2 * pad);
    });
  }
});

describe('pane chrome pads as a surface', () => {
  for (const [shellSize, pad] of [['1', 16], ['2', 24], ['3', 32]] as const) {
    it(`rows start on the header's inset (size ${shellSize})`, () => {
      const { container } = render(
        <Theme>
          <Shell.Root size={shellSize} height="400px">
            <Shell.Sidebar defaultState="expanded" presentation="fixed">
              <Shell.PaneHeader>
                <Toolbar aria-label="Pane">
                  <ToolbarButton>Search</ToolbarButton>
                </Toolbar>
              </Shell.PaneHeader>
              <Shell.Scroll>
                <Rows />
              </Shell.Scroll>
              <Shell.PaneFooter>
                <span>Footer</span>
              </Shell.PaneFooter>
            </Shell.Sidebar>
          </Shell.Root>
        </Theme>,
      );
      const pane = container.querySelector<HTMLElement>('.kui-ShellSidebar')!.getBoundingClientRect();
      const control = container.querySelector<HTMLElement>('.kui-ShellPaneHeader .kui-BaseButton')!.getBoundingClientRect();
      const row = container.querySelector<HTMLElement>('.kui-ShellScroll .kui-SidebarMenuButton')!.getBoundingClientRect();
      const footer = getComputedStyle(container.querySelector<HTMLElement>('.kui-ShellPaneFooter')!);
      expect(control.left - pane.left).toBe(pad);
      expect(row.left).toBe(control.left);
      expect(parseFloat(footer.paddingInlineStart)).toBe(pad);
    });
  }

  it('a Rail keeps its tight tiles', () => {
    const { container } = render(
      <Theme>
        <Shell.Root size="2" height="400px">
          <Shell.Rail defaultOpen>
            <Shell.PaneHeader>
              <span>Logo</span>
            </Shell.PaneHeader>
            <Shell.Scroll>
              <Rows />
            </Shell.Scroll>
          </Shell.Rail>
        </Shell.Root>
      </Theme>,
    );
    expect(parseFloat(getComputedStyle(container.querySelector<HTMLElement>('.kui-ShellRail .kui-ShellPaneHeader')!).paddingTop)).toBe(8);
    expect(parseFloat(getComputedStyle(container.querySelector<HTMLElement>('.kui-ShellRail .kui-BaseMenuViewport')!).paddingTop)).toBe(8);
  });
});
