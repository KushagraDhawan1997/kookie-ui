/**
 * Page, mounted (ported from v2, 2026-11-03).
 *
 * A page states its title once, as the document's h1; it starts below a floating band; and the
 * band's mirroring Toolbar.Title shows the page's title once the page's own has passed behind it.
 */
import * as React from 'react';
import { describe, expect, it } from 'vitest';
import { render, waitFor } from '@testing-library/react';
import { Card, Navigator, NavigatorLink, NavigatorScreen, Page, Popover, Shell, Theme, Toolbar, ToolbarTitle } from '../../../src/components/index';

function Frame({ float }: { float?: boolean }) {
  return (
    <Theme>
      <Shell.Root height="600px">
        <Shell.Content>
          <Shell.PaneHeader float={float}>
            <Toolbar>
              <ToolbarTitle />
            </Toolbar>
          </Shell.PaneHeader>
          <Shell.Scroll>
            <Page title="Dialog" description="Dialog shows a panel over a dimmed app.">
              <div style={{ blockSize: 2000 }} />
            </Page>
          </Shell.Scroll>
        </Shell.Content>
      </Shell.Root>
    </Theme>
  );
}

const opacity = (el: Element) => getComputedStyle(el).opacity;

describe('a page states its title once', () => {
  it("renders the document's one h1, and the description as a paragraph under it", () => {
    const { container } = render(<Frame />);
    expect(container.querySelectorAll('h1')).toHaveLength(1);
    expect(container.querySelector('h1')!.textContent).toBe('Dialog');
    expect(container.querySelector('.kui-PageHeader p')!.textContent).toContain('dimmed app');
  });

  it('starts below a floating band, with air between them', () => {
    const { container } = render(<Frame float />);
    const band = container.querySelector('.kui-ShellPaneHeader')!.getBoundingClientRect();
    const title = container.querySelector('h1')!.getBoundingClientRect();
    expect(band.height).toBeGreaterThan(0);
    expect(title.top - band.bottom).toBeGreaterThan(16);
  });
});

describe('the band says the title again once the page’s own has gone', () => {
  for (const float of [true, false]) {
    it(`is silent while the large title shows, and arrives when it scrolls away (${float ? 'floating' : 'pinned'} band)`, async () => {
      const { container } = render(<Frame float={float} />);
      const mirror = await waitFor(() => {
        const el = container.querySelector('.kui-ToolbarTitle');
        expect(el?.textContent).toBe('Dialog');
        return el!;
      });
      // Paint, not room: the box is there either way.
      expect(opacity(mirror)).toBe('0');
      expect(mirror.getBoundingClientRect().width).toBeGreaterThan(0);
      const viewport = container.querySelector('.kui-ShellScroll .kui-ScrollAreaViewport')!;
      viewport.scrollTop = 400;
      await waitFor(() => expect(opacity(mirror)).toBe('1'));
      viewport.scrollTop = 0;
      await waitFor(() => expect(opacity(mirror)).toBe('0'));
    });
  }

  it('collapses when the title passes the floating band, not the viewport', async () => {
    const { container } = render(<Frame float />);
    const mirror = await waitFor(() => container.querySelector('.kui-ToolbarTitle')!);
    const viewport = container.querySelector('.kui-ShellScroll .kui-ScrollAreaViewport')!;
    const band = container.querySelector('.kui-ShellPaneHeader')!.getBoundingClientRect();
    const header = container.querySelector('.kui-PageHeader')!.getBoundingClientRect();
    // The title block's end sits under the band but still inside the viewport.
    viewport.scrollTop = header.bottom - band.bottom + 4;
    await waitFor(() => expect(mirror.hasAttribute('data-collapsed')).toBe(true));
  });

  it('a page in no pane claims nothing, and a title with no words renders nothing', () => {
    const { container } = render(
      <Theme>
        <Card>
          <Toolbar>
            <ToolbarTitle />
          </Toolbar>
          <Page title="Dialog" />
        </Card>
      </Theme>,
    );
    expect(container.querySelector('.kui-ToolbarTitle')).toBeNull();
  });

  it("a page in a popover opened from a pane does not take the pane's band", async () => {
    const { container } = render(
      <Theme>
        <Shell.Root height="600px">
          <Shell.Content>
            <Shell.PaneHeader>
              <Toolbar>
                <ToolbarTitle />
              </Toolbar>
            </Shell.PaneHeader>
            <Shell.Scroll>
              <Popover.Root defaultOpen>
                <Popover.Trigger>
                  <button type="button">Open</button>
                </Popover.Trigger>
                <Popover.Content>
                  <Page title="Inside" />
                </Popover.Content>
              </Popover.Root>
            </Shell.Scroll>
          </Shell.Content>
        </Shell.Root>
      </Theme>,
    );
    await waitFor(() => expect(document.querySelector('.kui-PopoverContent h1')?.textContent).toBe('Inside'));
    expect(container.querySelector('.kui-ToolbarTitle')).toBeNull();
  });
});

describe('a Navigator in Shell.Content makes each screen a Page', () => {
  it('shows the top screen as the large title, and Back with the mirrored title in the band', async () => {
    const screen = (title: string) => <NavigatorScreen title={title}>{title === 'Settings' ? <NavigatorLink value="Email">Email</NavigatorLink> : null}</NavigatorScreen>;
    const { container } = render(
      <Theme>
        <Shell.Root height="600px">
          <Shell.Content>
            <Navigator root={screen('Settings')} screen={screen} />
          </Shell.Content>
        </Shell.Root>
      </Theme>,
    );
    const visibleH1 = () => [...container.querySelectorAll('h1')].filter((h) => h.offsetParent !== null).map((h) => h.textContent);
    expect(visibleH1()).toEqual(['Settings']);
    container.querySelector<HTMLButtonElement>('.kui-NavigatorLink')!.click();
    await waitFor(() => expect(visibleH1()).toEqual(['Email']));
    expect(container.querySelector("[aria-label='Back to Settings']")).not.toBeNull();
    await waitFor(() => expect(container.querySelector('.kui-ToolbarTitle')?.textContent).toBe('Email'));
    expect(opacity(container.querySelector('.kui-ToolbarTitle')!)).toBe('0');
  });
});
