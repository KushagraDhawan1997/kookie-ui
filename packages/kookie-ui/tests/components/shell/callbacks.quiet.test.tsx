import * as React from 'react';
import { afterAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { renderWithProviders, screen } from '../../test-utils';
import { fireEvent } from '@testing-library/react';
import { Shell } from '../../../src/components/index';
import { installViewport } from '../../helpers/viewport';

// Before the first render: useBreakpoint keeps the lists it creates first.
const viewport = installViewport(0);
afterAll(() => viewport.restore());
beforeEach(() => viewport.setWidth(0));

/** Every width the Shell's breakpoints separate, up and back down. */
const SWEEP = [600, 900, 1100, 1400, 1700, 1100, 700, 300, 0];

function spies() {
  return {
    rail: vi.fn(),
    railExpand: vi.fn(),
    railCollapse: vi.fn(),
    panel: vi.fn(),
    sidebar: vi.fn(),
    sidebarExpand: vi.fn(),
    inspector: vi.fn(),
    inspectorExpand: vi.fn(),
    inspectorCollapse: vi.fn(),
    bottom: vi.fn(),
  };
}

function Frame({ on }: { on: ReturnType<typeof spies> }) {
  return (
    <Shell.Root>
      <Shell.Header>
        <Shell.Trigger target="rail">rail</Shell.Trigger>
        <Shell.Trigger target="inspector">inspector</Shell.Trigger>
      </Shell.Header>
      <Shell.Rail presentation={{ initial: 'overlay', md: 'fixed' }} onOpenChange={on.rail} onExpand={on.railExpand} onCollapse={on.railCollapse}>
        rail
      </Shell.Rail>
      <Shell.Panel defaultOpen={{ initial: false, lg: true }} onOpenChange={on.panel}>
        panel
      </Shell.Panel>
      <Shell.Content>content</Shell.Content>
      <Shell.Inspector defaultOpen={{ initial: false, lg: true }} onOpenChange={on.inspector} onExpand={on.inspectorExpand} onCollapse={on.inspectorCollapse}>
        inspector
      </Shell.Inspector>
      <Shell.Bottom presentation={{ initial: 'overlay', sm: 'fixed' }} defaultOpen={{ initial: false, md: true }} onOpenChange={on.bottom}>
        bottom
      </Shell.Bottom>
    </Shell.Root>
  );
}

function SidebarFrame({ on }: { on: ReturnType<typeof spies> }) {
  return (
    <Shell.Root>
      <Shell.Sidebar defaultState={{ initial: 'collapsed', md: 'thin', lg: 'expanded' }} onStateChange={on.sidebar} onExpand={on.sidebarExpand}>
        sidebar
      </Shell.Sidebar>
      <Shell.Content>content</Shell.Content>
    </Shell.Root>
  );
}

const calls = (on: ReturnType<typeof spies>) => Object.fromEntries(Object.entries(on).filter(([, spy]) => spy.mock.calls.length > 0));

/**
 * Since 0.8.0 a pane's callbacks report what a user did. A pane the user has
 * not touched follows the window, and following the window is not a change
 * the app made or asked for, so nothing is reported on mount or on a resize.
 */
describe('Shell callbacks are quiet until a user acts', () => {
  it('reports nothing on mount', () => {
    const on = spies();
    renderWithProviders(<Frame on={on} />);
    renderWithProviders(<SidebarFrame on={on} />);
    expect(calls(on)).toEqual({});
  });

  // On a narrow window every untouched pane starts closed, so a pane that
  // reported its resolved state on mount would report nothing there. On a
  // wide window the Rail, the Sidebar and every responsive default start
  // open, which is where 0.7's reason 'init' fired.
  it('reports nothing on mount on a wide window', () => {
    viewport.setWidth(1700);
    const on = spies();
    renderWithProviders(<Frame on={on} />);
    renderWithProviders(<SidebarFrame on={on} />);
    expect(document.querySelector('.kui-ShellRail')?.getAttribute('data-mode')).toBe('expanded');
    expect(document.querySelector('.kui-ShellSidebar')?.getAttribute('data-mode')).toBe('expanded');
    expect(calls(on)).toEqual({});
  });

  it('reports nothing while the window crosses every breakpoint', () => {
    const on = spies();
    renderWithProviders(<Frame on={on} />);
    renderWithProviders(<SidebarFrame on={on} />);

    for (const width of SWEEP) viewport.setWidth(width);

    expect(calls(on)).toEqual({});
  });

  it('still follows the window while it stays quiet', () => {
    const on = spies();
    renderWithProviders(<Frame on={on} />);
    const rail = document.querySelector('.kui-ShellRail') as HTMLElement;
    const inspector = document.querySelector('.kui-ShellInspector') as HTMLElement;
    const railTrigger = screen.getByRole('button', { name: 'rail' });

    // Narrow: the Rail is an overlay, and an untouched overlay rests closed.
    expect(rail.getAttribute('data-presentation')).toBe('overlay');
    expect(rail.getAttribute('data-mode')).toBe('collapsed');
    expect(railTrigger.getAttribute('aria-expanded')).toBe('false');

    viewport.setWidth(1400);
    expect(rail.getAttribute('data-presentation')).toBe('fixed');
    expect(rail.getAttribute('data-mode')).toBe('expanded');
    expect(railTrigger.getAttribute('aria-expanded')).toBe('true');
    expect(inspector.getAttribute('data-mode')).toBe('expanded');

    // Still untouched: the stylesheet decides, so the state stays `auto`.
    expect(rail.getAttribute('data-state')).toBe('auto');
    expect(calls(on)).toEqual({});
  });

  it('reports a user toggle once, with reason toggle', () => {
    const on = spies();
    renderWithProviders(<Frame on={on} />);

    fireEvent.click(screen.getByRole('button', { name: 'inspector' }));

    expect(on.inspector).toHaveBeenCalledTimes(1);
    expect(on.inspector).toHaveBeenLastCalledWith(true, { reason: 'toggle' });
    expect(on.inspectorExpand).toHaveBeenCalledTimes(1);
    expect(on.inspectorCollapse).not.toHaveBeenCalled();
  });

  it('a pane the user has set stays set across a resize, and reports nothing for it', () => {
    const on = spies();
    renderWithProviders(<Frame on={on} />);
    const inspector = document.querySelector('.kui-ShellInspector') as HTMLElement;

    fireEvent.click(screen.getByRole('button', { name: 'inspector' }));
    on.inspector.mockClear();
    on.inspectorExpand.mockClear();

    for (const width of SWEEP) viewport.setWidth(width);

    expect(inspector.getAttribute('data-state')).toBe('open');
    expect(on.inspector).not.toHaveBeenCalled();
    expect(on.inspectorExpand).not.toHaveBeenCalled();
    expect(on.inspectorCollapse).not.toHaveBeenCalled();
  });
});
