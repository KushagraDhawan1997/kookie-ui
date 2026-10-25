import * as React from 'react';
import { describe, it, expect, afterEach } from 'vitest';
import { render } from '@testing-library/react';
import { cdp, page, userEvent } from 'vitest/browser';
import { Shell, Theme, Toolbar, ToolbarButton } from '../../../src/components/index';
import { PAGE_SCROLL_QUERY } from '../../../src/components/_internal/shell-page-scroll';

const frames = () => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => setTimeout(resolve, 100))));

/** A window this wide, under a touch screen's coarse pointer or a mouse's fine one. */
async function windowOf(width: number, touch: boolean) {
  await page.viewport(width, 700);
  await cdp().send('Emulation.setTouchEmulationEnabled', { enabled: touch, maxTouchPoints: touch ? 5 : 1 });
  await frames();
}

afterEach(async () => {
  window.scrollTo(0, 0);
  await windowOf(1280, false);
  await page.viewport(1280, 800);
});

const rows = (count: number) =>
  Array.from({ length: count }, (_, i) => (
    <div key={i} id={`row-${i}`} style={{ height: 40 }}>
      Row {i}
    </div>
  ));

/** The docs site's shape: a floating top bar over a Shell.Scroll in the content, and a sidebar drawer. */
function App({ header, wide, box, ...root }: Omit<React.ComponentProps<typeof Shell.Root>, 'children'> & { header?: number; wide?: boolean; box?: boolean }) {
  const shell = (
    <Shell.Root {...root}>
      {header ? <Shell.Header height={header}>Header</Shell.Header> : null}
      <Shell.Sidebar aria-label="Navigation" defaultState={{ initial: 'collapsed', sm: 'expanded' }} presentation={{ initial: 'overlay', sm: 'fixed' }}>
        <Shell.Scroll>
          <a href="#row-0">Nav</a>
        </Shell.Scroll>
      </Shell.Sidebar>
      <Shell.Content>
        <Shell.PaneHeader float>
          <Toolbar backdrop>
            <Shell.Trigger target="sidebar" asChild>
              <ToolbarButton iconOnly aria-label="Toggle navigation">
                N
              </ToolbarButton>
            </Shell.Trigger>
          </Toolbar>
        </Shell.PaneHeader>
        <Shell.Scroll fade>
          <div data-testid="page">
            {rows(80)}
            {wide ? <div style={{ width: 2000, height: 20 }}>Wide</div> : null}
          </div>
        </Shell.Scroll>
      </Shell.Content>
    </Shell.Root>
  );
  return <Theme>{box ? <div style={{ height: 400 }}>{shell}</div> : shell}</Theme>;
}

const viewportOf = (container: HTMLElement) => container.querySelector<HTMLElement>('.kui-ShellContent > .kui-ShellScroll > .kui-ScrollAreaViewport')!;
const doc = () => document.scrollingElement as HTMLElement;
const pageScrolls = () => doc().scrollHeight > window.innerHeight + 1;

describe('Shell page scroll', () => {
  it('the stylesheet and the script ask the same question', () => {
    const conditions: string[] = [];
    for (const sheet of Array.from(document.styleSheets)) {
      for (const rule of Array.from(sheet.cssRules)) {
        if (rule instanceof CSSMediaRule && rule.cssText.includes('.kui-ShellRoot[data-window]')) conditions.push(rule.conditionText);
      }
    }
    expect(conditions).toEqual([PAGE_SCROLL_QUERY]);
  });

  it('on a narrow touch screen the page scrolls, not the content', async () => {
    await windowOf(375, true);
    const { container } = render(<App />);
    await frames();
    const viewport = viewportOf(container);
    expect(matchMedia(PAGE_SCROLL_QUERY).matches).toBe(true);
    expect(pageScrolls()).toBe(true);
    expect(viewport.scrollHeight).toBeLessThanOrEqual(viewport.clientHeight + 1);
    expect(getComputedStyle(container.querySelector('.kui-ShellContent')!).overflowY).toBe('clip');
  });

  it('with a mouse, or on a wide touch screen, the content scrolls and the page does not', async () => {
    for (const [width, touch] of [
      [375, false],
      [1000, true],
      [1280, false],
    ] as const) {
      await windowOf(width, touch);
      const { container, unmount } = render(<App />);
      await frames();
      const viewport = viewportOf(container);
      expect(pageScrolls(), `${width} ${touch}`).toBe(false);
      expect(viewport.scrollHeight).toBeGreaterThan(viewport.clientHeight);
      expect(container.querySelector<HTMLElement>('.kui-ShellRoot')!.getBoundingClientRect().height).toBe(window.innerHeight);
      unmount();
    }
  });

  it('a contained Shell fills its parent and always scrolls inside itself', async () => {
    await windowOf(375, true);
    for (const props of [{ contained: true }, { height: '400px' }]) {
      const { container, unmount } = render(<App {...props} box />);
      await frames();
      const root = container.querySelector<HTMLElement>('.kui-ShellRoot')!;
      expect(root.hasAttribute('data-contained')).toBe(true);
      expect(root.hasAttribute('data-window')).toBe(false);
      expect(root.getBoundingClientRect().height).toBe(400);
      expect(pageScrolls()).toBe(false);
      const viewport = viewportOf(container);
      expect(viewport.scrollHeight).toBeGreaterThan(viewport.clientHeight);
      unmount();
    }
  });

  it('carries the reading position when the window crosses the narrow boundary', async () => {
    await windowOf(1000, true);
    const { container } = render(<App />);
    await frames();
    viewportOf(container).scrollTop = 800;
    await frames();

    await windowOf(375, true);
    await frames();
    expect(window.scrollY).toBe(800);

    window.scrollTo(0, 1200);
    await frames();
    await windowOf(1000, true);
    await frames();
    expect(viewportOf(container).scrollTop).toBe(1200);
    expect(window.scrollY).toBe(0);
  });

  it('takes the unused content viewport out of the tab order while the page scrolls', async () => {
    await windowOf(375, true);
    const { container } = render(<App />);
    await frames();
    expect(viewportOf(container).getAttribute('tabindex')).toBe('-1');

    await windowOf(1000, true);
    await frames();
    expect(viewportOf(container).getAttribute('tabindex')).toBe('0');
  });

  it('the floating header stays pinned while the page scrolls, and the page starts below it', async () => {
    await windowOf(375, true);
    const { container, getByLabelText, getByTestId } = render(<App />);
    await frames();
    const header = container.querySelector<HTMLElement>('.kui-ShellContent > .kui-ShellPaneHeader')!;
    const top = getByLabelText('Toggle navigation').getBoundingClientRect().top;
    expect(getByTestId('page').getBoundingClientRect().top).toBe(header.getBoundingClientRect().bottom);

    window.scrollTo(0, 900);
    await frames();
    expect(window.scrollY).toBe(900);
    expect(getByLabelText('Toggle navigation').getBoundingClientRect().top).toBe(top);

    // A link target lands below the header, not under it.
    container.querySelector('#row-40')!.scrollIntoView();
    await frames();
    expect(Math.round(container.querySelector('#row-40')!.getBoundingClientRect().top)).toBe(Math.round(header.getBoundingClientRect().bottom));
  });

  it('a Shell.Header sticks to the top, and the floating header sticks beneath it', async () => {
    await windowOf(375, true);
    const { container, getByLabelText } = render(<App header={48} />);
    await frames();
    window.scrollTo(0, 900);
    await frames();
    expect(container.querySelector('.kui-ShellHeader')!.getBoundingClientRect().top).toBe(0);
    const bar = container.querySelector<HTMLElement>('.kui-ShellContent > .kui-ShellPaneHeader')!;
    expect(bar.getBoundingClientRect().top).toBe(48);
    expect(getByLabelText('Toggle navigation').getBoundingClientRect().bottom).toBeGreaterThan(48);
  });

  it('holds the page still under an open drawer, on the screen wherever the page is scrolled', async () => {
    await windowOf(375, true);
    const { container, getByLabelText } = render(<App />);
    await frames();
    window.scrollTo(0, 900);
    await frames();
    // A plain click: a driven one scrolls its target into view first.
    getByLabelText('Toggle navigation').click();
    await frames();

    const html = document.documentElement;
    expect(html.hasAttribute('data-kui-shell-lock')).toBe(true);
    expect(getComputedStyle(html).overflowY).toBe('hidden');
    // The lock is an attribute, never an inline value another scroll lock could save and restore.
    expect(html.style.overflow).toBe('');
    expect(window.scrollY).toBe(900);

    const drawer = container.querySelector<HTMLElement>('.kui-ShellSidebar')!.getBoundingClientRect();
    expect(drawer.top).toBe(0);
    expect(drawer.height).toBe(window.innerHeight);
    const scrim = container.querySelector<HTMLElement>('.kui-ShellScrim')!.getBoundingClientRect();
    expect(scrim.top).toBe(0);
    expect(scrim.height).toBe(window.innerHeight);

    await userEvent.keyboard('{Escape}');
    await frames();
    expect(html.hasAttribute('data-kui-shell-lock')).toBe(false);
    expect(getComputedStyle(html).overflowY).toBe('visible');
    expect(window.scrollY).toBe(900);
  });

  it('nothing widens the page on a phone, drawer open or closed', async () => {
    await windowOf(375, true);
    const { getByLabelText } = render(<App wide />);
    await frames();
    expect(doc().scrollWidth).toBe(window.innerWidth);
    await userEvent.click(getByLabelText('Toggle navigation'));
    await frames();
    expect(doc().scrollWidth).toBe(window.innerWidth);
  });

  it('content without a Shell.Scroll lets the page scroll too', async () => {
    await windowOf(375, true);
    const { container } = render(
      <Theme>
        <Shell.Root>
          <Shell.Content>{rows(80)}</Shell.Content>
        </Shell.Root>
      </Theme>,
    );
    await frames();
    const content = container.querySelector<HTMLElement>('.kui-ShellContent')!;
    expect(pageScrolls()).toBe(true);
    expect(content.scrollHeight).toBeLessThanOrEqual(content.clientHeight + 1);

    window.scrollTo(0, 600);
    await frames();
    await windowOf(1000, true);
    await frames();
    expect(content.scrollTop).toBe(600);
  });
});
