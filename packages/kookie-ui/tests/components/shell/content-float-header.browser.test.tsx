import * as React from 'react';
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { Shell, Theme, Toolbar, ToolbarButton } from '../../../src/components/index';

const frames = () => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => setTimeout(resolve, 100))));

/**
 * `Shell.PaneHeader float` and `Shell.Scroll` work in the content as they do in a sidebar: the
 * Scroll scrolls the page, the header stays pinned over it with the pane's inset, and the page
 * starts below the header.
 */
describe('Shell.Content with a floating header', () => {
  function Page({ nested = false }: { nested?: boolean }) {
    return (
      <Theme>
        <Shell.Root height="600px">
          <Shell.Sidebar defaultState="expanded" presentation="fixed">
            <Shell.PaneHeader float>
              <Toolbar backdrop>
                <ToolbarButton iconOnly aria-label="Sidebar control">S</ToolbarButton>
              </Toolbar>
            </Shell.PaneHeader>
            <Shell.Scroll>
              <div>Nav</div>
            </Shell.Scroll>
          </Shell.Sidebar>
          <Shell.Content>
            <Shell.PaneHeader float>
              <Toolbar backdrop>
                <ToolbarButton iconOnly aria-label="Content control">C</ToolbarButton>
              </Toolbar>
            </Shell.PaneHeader>
            <Shell.Scroll fade>
              <div data-testid="page" id="top">
                {Array.from({ length: 60 }, (_, i) => (
                  <div key={i} id={`row-${i}`} style={{ height: 40 }}>
                    Row {i}
                  </div>
                ))}
              </div>
              {nested ? (
                <Shell.Root height="200px">
                  <Shell.Sidebar defaultState="expanded" presentation="fixed">
                    <Shell.Scroll>
                      <div data-testid="nested-nav">Nested</div>
                    </Shell.Scroll>
                  </Shell.Sidebar>
                </Shell.Root>
              ) : null}
            </Shell.Scroll>
          </Shell.Content>
        </Shell.Root>
      </Theme>
    );
  }

  it('the content stops scrolling and the Scroll scrolls the page', async () => {
    const { container } = render(<Page />);
    await frames();
    const content = container.querySelector<HTMLElement>('.kui-ShellContent')!;
    const viewport = content.querySelector<HTMLElement>(':scope > .kui-ShellScroll > .kui-ScrollAreaViewport')!;
    expect(getComputedStyle(content).overflowY).toBe('hidden');
    expect(viewport.scrollHeight).toBeGreaterThan(viewport.clientHeight);
    expect(viewport.getBoundingClientRect().height).toBe(content.getBoundingClientRect().height);
  });

  it('the header sits at the same inset as the sidebar header and stays pinned while the page scrolls', async () => {
    const { container, getByLabelText } = render(<Page />);
    await frames();
    const content = container.querySelector<HTMLElement>('.kui-ShellContent')!;
    const sidebar = container.querySelector<HTMLElement>('.kui-ShellSidebar')!;
    const viewport = content.querySelector<HTMLElement>(':scope > .kui-ShellScroll > .kui-ScrollAreaViewport')!;
    const side = getByLabelText('Sidebar control').getBoundingClientRect();
    const main = getByLabelText('Content control').getBoundingClientRect();
    expect(main.top - content.getBoundingClientRect().top).toBe(side.top - sidebar.getBoundingClientRect().top);
    expect(main.left - content.getBoundingClientRect().left).toBe(side.left - sidebar.getBoundingClientRect().left);

    viewport.scrollTop = 600;
    await frames();
    expect(viewport.scrollTop).toBe(600);
    expect(getByLabelText('Content control').getBoundingClientRect().top).toBe(main.top);
  });

  it('the page starts below the header, and link targets land below it', async () => {
    const { container, getByTestId } = render(<Page />);
    await frames();
    const content = container.querySelector<HTMLElement>('.kui-ShellContent')!;
    const header = content.querySelector<HTMLElement>(':scope > .kui-ShellPaneHeader')!;
    const viewport = content.querySelector<HTMLElement>(':scope > .kui-ShellScroll > .kui-ScrollAreaViewport')!;
    const headerBottom = header.getBoundingClientRect().bottom;
    expect(getByTestId('page').getBoundingClientRect().top).toBe(headerBottom);
    expect(getComputedStyle(viewport).scrollPaddingTop).toBe(`${header.getBoundingClientRect().height}px`);

    container.querySelector('#row-30')!.scrollIntoView();
    await frames();
    expect(container.querySelector('#row-30')!.getBoundingClientRect().top).toBe(headerBottom);
  });

  it('holds a page, not a menu; a Shell nested in the page keeps its menu', async () => {
    const { container, getByTestId } = render(<Page nested />);
    await frames();
    const content = container.querySelector<HTMLElement>('.kui-ShellContent')!;
    expect(content.querySelector(':scope > .kui-ShellScroll .kui-BaseMenuContent')).toBe(getByTestId('nested-nav').closest('.kui-BaseMenuContent'));
    expect(getByTestId('page').closest('.kui-BaseMenuContent')).toBeNull();
    expect(getByTestId('page').closest('.kui-ShellScrollContent')).not.toBeNull();
    expect(getByTestId('nested-nav').closest('.kui-BaseMenuContent')).not.toBeNull();
  });
});
