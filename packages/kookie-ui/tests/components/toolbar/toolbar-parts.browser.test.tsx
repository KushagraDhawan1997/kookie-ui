import * as React from 'react';
import { createPortal } from 'react-dom';
import { describe, it, expect, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { userEvent } from 'vitest/browser';
import {
  Theme,
  Toolbar,
  ToolbarButton,
  ToolbarFill,
  ToolbarGroup,
  ToolbarOverflow,
  ToolbarSlot,
  useToolbarOverflow,
} from '../../../src/components/index';

function Glyph() {
  return (
    <svg viewBox="0 0 16 16" aria-hidden width="16" height="16">
      <circle cx="8" cy="8" r="4" fill="currentColor" />
    </svg>
  );
}

describe('ToolbarButton asChild', () => {
  it('renders a link that keeps the button look, sets no type, and joins the arrow-key row', async () => {
    render(
      <Theme>
        <Toolbar aria-label="Row">
          <ToolbarButton>Bold</ToolbarButton>
          <ToolbarButton asChild>
            <a href="#docs">Docs</a>
          </ToolbarButton>
          <ToolbarButton>Share</ToolbarButton>
        </Toolbar>
      </Theme>,
    );
    const link = screen.getByRole('link', { name: 'Docs' });
    expect(link.tagName).toBe('A');
    expect(link.hasAttribute('type')).toBe(false);
    expect(link.classList.contains('kui-Button')).toBe(true);

    screen.getByRole('button', { name: 'Bold' }).focus();
    await userEvent.keyboard('{ArrowRight}');
    expect(document.activeElement).toBe(link);
    await userEvent.keyboard('{ArrowRight}');
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'Share' }));
  });

  it('a <button> child stays a Toolbar.Button with type="button"', () => {
    render(
      <Theme>
        <Toolbar aria-label="Row">
          <ToolbarButton asChild>
            <button>Own</button>
          </ToolbarButton>
        </Toolbar>
      </Theme>,
    );
    expect(screen.getByRole('button', { name: 'Own' }).getAttribute('type')).toBe('button');
  });
});

function Cluster({ width }: { width: number }) {
  return (
    <Theme>
      <div style={{ width }}>
        <Toolbar aria-label="Row">
          <ToolbarButton>Start</ToolbarButton>
          <ToolbarOverflow>
            <ToolbarButton>Alpha</ToolbarButton>
            <ToolbarButton>Bravo</ToolbarButton>
            <ToolbarButton>Charlie</ToolbarButton>
            <ToolbarButton iconOnly aria-label="Delta">
              <Glyph />
            </ToolbarButton>
          </ToolbarOverflow>
        </Toolbar>
      </div>
    </Theme>
  );
}

describe('ToolbarOverflow', () => {
  it('shows every control when they fit, with no More button', async () => {
    render(<Cluster width={900} />);
    await waitFor(() => expect(screen.getByRole('button', { name: 'Delta' })).toBeTruthy());
    expect(screen.queryByRole('button', { name: 'More' })).toBeNull();
  });

  it('moves controls from the end into a More menu as the row narrows, and back as it widens', async () => {
    const view = render(<Cluster width={260} />);
    const more = await screen.findByRole('button', { name: 'More' });
    expect(screen.queryByRole('button', { name: 'Delta' })).toBeNull();
    expect(screen.getByRole('button', { name: 'Alpha' })).toBeTruthy();
    // The row never spills past its box.
    const row = screen.getByRole('toolbar').getBoundingClientRect();
    expect(more.getBoundingClientRect().right).toBeLessThanOrEqual(row.right + 0.5);

    await userEvent.click(more);
    const menu = await screen.findByRole('menu');
    const names = Array.from(menu.querySelectorAll('[role="menuitem"]')).map((item) => item.textContent);
    // An icon-only control says its aria-label in the menu.
    expect(names).toContain('Delta');
    expect(names).not.toContain('Alpha');
    await userEvent.keyboard('{Escape}');

    view.rerender(<Cluster width={900} />);
    await waitFor(() => expect(screen.getByRole('button', { name: 'Delta' })).toBeTruthy());
    expect(screen.queryByRole('button', { name: 'More' })).toBeNull();
  });

  it('collapses again when a control grows after mount, with the row width unchanged', async () => {
    function Growing({ wide }: { wide: boolean }) {
      return (
        <Theme>
          <div style={{ width: 240 }}>
            <Toolbar aria-label="Row">
              <ToolbarOverflow>
                <ToolbarButton>Alpha</ToolbarButton>
                <span>{wide ? <ToolbarButton>A much longer label here</ToolbarButton> : null}</span>
                <ToolbarButton>Bravo</ToolbarButton>
              </ToolbarOverflow>
            </Toolbar>
          </div>
        </Theme>
      );
    }
    const view = render(<Growing wide={false} />);
    await waitFor(() => expect(screen.getByRole('button', { name: 'Bravo' })).toBeTruthy());
    expect(screen.queryByRole('button', { name: 'More' })).toBeNull();
    view.rerender(<Growing wide />);
    await screen.findByRole('button', { name: 'More' });
    const row = screen.getByRole('toolbar').getBoundingClientRect();
    const more = screen.getByRole('button', { name: 'More' }).getBoundingClientRect();
    expect(more.right).toBeLessThanOrEqual(row.right + 0.5);
  });

  it('a menu item runs the control’s onClick', async () => {
    const onClick = vi.fn();
    render(
      <Theme>
        <div style={{ width: 160 }}>
          <Toolbar aria-label="Row">
            <ToolbarOverflow>
              <ToolbarButton>Alpha</ToolbarButton>
              <ToolbarButton>Bravo</ToolbarButton>
              <ToolbarButton onClick={onClick}>Archive</ToolbarButton>
            </ToolbarOverflow>
          </Toolbar>
        </div>
      </Theme>,
    );
    await userEvent.click(await screen.findByRole('button', { name: 'More' }));
    await userEvent.click(await screen.findByRole('menuitem', { name: 'Archive' }));
    expect(onClick).toHaveBeenCalledTimes(1);
  });

  it('useToolbarOverflow tells a custom control where it is drawn', async () => {
    function Zoom() {
      return useToolbarOverflow() ? <span data-testid="zoom-menu">Zoom in menu</span> : <ToolbarButton>Zoom</ToolbarButton>;
    }
    render(
      <Theme>
        <div style={{ width: 150 }}>
          <Toolbar aria-label="Row">
            <ToolbarOverflow>
              <ToolbarButton>Alpha</ToolbarButton>
              <ToolbarGroup aria-label="Tools">
                <ToolbarButton>Bravo</ToolbarButton>
              </ToolbarGroup>
              <Zoom />
            </ToolbarOverflow>
          </Toolbar>
        </div>
      </Theme>,
    );
    await userEvent.click(await screen.findByRole('button', { name: 'More' }));
    expect(await screen.findByTestId('zoom-menu')).toBeTruthy();
    expect(screen.queryByRole('button', { name: 'Zoom' })).toBeNull();
  });
});

describe('ToolbarSlot and ToolbarFill', () => {
  function Page({ onPublish }: { onPublish: () => void }) {
    return (
      <ToolbarFill name="page-actions">
        <ToolbarButton onClick={onPublish}>Publish</ToolbarButton>
      </ToolbarFill>
    );
  }

  it('renders a page’s controls in the toolbar’s row, where the arrow keys reach them', async () => {
    const onPublish = vi.fn();
    const view = render(
      <Theme>
        <Toolbar aria-label="Header" size="3">
          <ToolbarButton>Back</ToolbarButton>
          <ToolbarSlot name="page-actions" />
        </Toolbar>
        <main>
          <Page onPublish={onPublish} />
        </main>
      </Theme>,
    );
    const toolbar = screen.getByRole('toolbar');
    const publish = await screen.findByRole('button', { name: 'Publish' });
    expect(toolbar.contains(publish)).toBe(true);
    expect(publish.className).toContain('kui-r-size-3');

    screen.getByRole('button', { name: 'Back' }).focus();
    await userEvent.keyboard('{ArrowRight}');
    expect(document.activeElement).toBe(publish);
    await userEvent.keyboard('{Enter}');
    expect(onPublish).toHaveBeenCalledTimes(1);

    view.rerender(
      <Theme>
        <Toolbar aria-label="Header" size="3">
          <ToolbarButton>Back</ToolbarButton>
          <ToolbarSlot name="page-actions" />
        </Toolbar>
        <main />
      </Theme>,
    );
    expect(screen.queryByRole('button', { name: 'Publish' })).toBeNull();
  });

  it('a ToolbarButton or ToolbarGroup portalled into the toolbar from outside it does not throw', async () => {
    function Page({ target }: { target: HTMLElement | null }) {
      return target
        ? createPortal(
            <ToolbarGroup aria-label="Portalled">
              <ToolbarButton>Ported</ToolbarButton>
            </ToolbarGroup>,
            target,
          )
        : null;
    }
    function App({ target }: { target: HTMLElement | null }) {
      return (
        <Theme>
          <Toolbar aria-label="Header">
            <ToolbarButton>Back</ToolbarButton>
          </Toolbar>
          <Page target={target} />
        </Theme>
      );
    }
    const view = render(<App target={null} />);
    view.rerender(<App target={screen.getByRole('toolbar')} />);
    const ported = await screen.findByRole('button', { name: 'Ported' });
    expect(screen.getByRole('toolbar').contains(ported)).toBe(true);
    expect(screen.getByRole('group', { name: 'Portalled' }).classList.contains('kui-ToolbarGroup')).toBe(true);
  });
});

describe('Toolbar layout props', () => {
  it('takes padding and position props as classes, and no margin', () => {
    const props = { m: '4' } as Record<string, string>;
    render(
      <Theme>
        <Toolbar aria-label="Row" p="3" position="sticky" top="0" {...props}>
          <ToolbarButton>One</ToolbarButton>
        </Toolbar>
      </Theme>,
    );
    const toolbar = screen.getByRole('toolbar');
    expect(toolbar.classList.contains('kui-r-p-3')).toBe(true);
    expect(getComputedStyle(toolbar).position).toBe('sticky');
    expect(parseFloat(getComputedStyle(toolbar).paddingTop)).toBeGreaterThan(0);
    expect(Array.from(toolbar.classList).filter((name) => /^kui-r-m[xytrbl]?-/.test(name))).toEqual([]);
    expect(getComputedStyle(toolbar).marginTop).toBe('0px');
  });
});
