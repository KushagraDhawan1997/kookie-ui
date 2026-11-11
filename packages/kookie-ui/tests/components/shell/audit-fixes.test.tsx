import * as React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { fireEvent, renderWithProviders, screen } from '../../test-utils';
import { Shell } from '../../../src/components/index';

describe('Shell.Scroll', () => {
  it('forwards its ref and events to the element that scrolls', () => {
    const ref = React.createRef<HTMLDivElement>();
    const onScroll = vi.fn();
    const { container } = renderWithProviders(
      <Shell.Root>
        <Shell.Sidebar defaultState="expanded" presentation="fixed">
          <Shell.Scroll ref={ref} onScroll={onScroll} className="mine">
            rows
          </Shell.Scroll>
        </Shell.Sidebar>
      </Shell.Root>,
    );
    expect(ref.current).toBe(container.querySelector('.kui-ShellSidebar .kui-ScrollAreaViewport'));
    fireEvent.scroll(ref.current!);
    expect(onScroll).toHaveBeenCalledTimes(1);
    // className still styles the content inside.
    expect(container.querySelector('.kui-SidebarContent')).toHaveClass('mine');
  });

  it('does the same in Shell.Content', () => {
    const ref = React.createRef<HTMLDivElement>();
    const { container } = renderWithProviders(
      <Shell.Root>
        <Shell.Content>
          <Shell.Scroll ref={ref} className="page">
            page
          </Shell.Scroll>
        </Shell.Content>
      </Shell.Root>,
    );
    expect(ref.current).toBe(container.querySelector('.kui-ShellContent .kui-ScrollAreaViewport'));
    expect(container.querySelector('.kui-ShellScrollContent')).toHaveClass('page');
  });
});

describe('Shell panes are landmarks', () => {
  it('Rail, Panel and Sidebar are navigation; Inspector is complementary', () => {
    renderWithProviders(
      <Shell.Root>
        <Shell.Rail defaultOpen presentation="fixed" aria-label="Apps" />
        <Shell.Panel defaultOpen presentation="fixed" aria-label="Sections" />
        <Shell.Sidebar defaultState="expanded" presentation="fixed" aria-label="Pages" />
        <Shell.Content>content</Shell.Content>
        <Shell.Inspector defaultOpen presentation="fixed" aria-label="Details" />
      </Shell.Root>,
    );
    expect(screen.getByRole('navigation', { name: 'Apps' })).toHaveClass('kui-ShellRail');
    expect(screen.getByRole('navigation', { name: 'Sections' })).toHaveClass('kui-ShellPanel');
    expect(screen.getByRole('navigation', { name: 'Pages' })).toHaveClass('kui-ShellSidebar');
    expect(screen.getByRole('complementary', { name: 'Details' })).toHaveClass('kui-ShellInspector');
  });

  it('a role the caller states wins', () => {
    const { container } = renderWithProviders(
      <Shell.Root>
        <Shell.Sidebar defaultState="expanded" presentation="fixed" role="region" aria-label="Chats" />
      </Shell.Root>,
    );
    expect(container.querySelector('.kui-ShellSidebar')).toHaveAttribute('role', 'region');
  });
});

describe('the resize handle', () => {
  it('Enter collapses a collapsible pane, as a double-click does', () => {
    const onOpenChange = vi.fn();
    renderWithProviders(
      <Shell.Root>
        <Shell.Rail defaultOpen presentation="fixed" />
        <Shell.Panel defaultOpen presentation="fixed" resizable onOpenChange={onOpenChange} />
        <Shell.Content>content</Shell.Content>
      </Shell.Root>,
    );
    fireEvent.keyDown(screen.getByRole('separator'), { key: 'Enter' });
    expect(onOpenChange).toHaveBeenCalledTimes(1);
    expect(onOpenChange.mock.calls[0][0]).toBe(false);
  });

  it('Enter does nothing on a pane that cannot collapse', () => {
    const onOpenChange = vi.fn();
    renderWithProviders(
      <Shell.Root>
        <Shell.Rail defaultOpen presentation="fixed" />
        <Shell.Panel defaultOpen presentation="fixed" resizable collapsible={false} onOpenChange={onOpenChange} />
        <Shell.Content>content</Shell.Content>
      </Shell.Root>,
    );
    fireEvent.keyDown(screen.getByRole('separator'), { key: 'Enter' });
    expect(onOpenChange).not.toHaveBeenCalled();
  });
});
