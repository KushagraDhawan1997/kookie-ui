import * as React from 'react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { act, renderWithProviders, screen } from '../../test-utils';
import { fireEvent } from '@testing-library/react';
import { Shell } from '../../../src/components/index';

const q = (selector: string) => document.querySelector(selector) as HTMLElement;

afterEach(() => {
  vi.restoreAllMocks();
});

describe('Shell.useSidebarMode', () => {
  function Probe({ onReady }: { onReady: (api: ReturnType<typeof Shell.useSidebarMode>) => void }) {
    const api = Shell.useSidebarMode();
    onReady(api);
    return <span data-testid="mode">{api.sidebarMode}</span>;
  }

  it('reads the Sidebar, including an untouched one the window decides', () => {
    renderWithProviders(
      <Shell.Root>
        <Shell.Sidebar>
          <Probe onReady={() => {}} />
        </Shell.Sidebar>
        <Shell.Content>content</Shell.Content>
      </Shell.Root>,
    );
    // jsdom's width is an overlay breakpoint, where an untouched Sidebar rests closed.
    expect(screen.getByTestId('mode').textContent).toBe('collapsed');
  });

  it('sets the Sidebar as a user would, through onStateChange', () => {
    let api!: ReturnType<typeof Shell.useSidebarMode>;
    const onStateChange = vi.fn();
    renderWithProviders(
      <Shell.Root>
        <Shell.Content>
          <Probe onReady={(value) => (api = value)} />
        </Shell.Content>
        <Shell.Sidebar presentation="fixed" defaultState="expanded" onStateChange={onStateChange}>
          sidebar
        </Shell.Sidebar>
      </Shell.Root>,
    );

    act(() => api.setSidebarMode('thin'));

    expect(onStateChange).toHaveBeenLastCalledWith('thin', { reason: 'toggle' });
    expect(screen.getByTestId('mode').textContent).toBe('thin');
  });

  it('does not move a controlled Sidebar until the app passes the new state', () => {
    let api!: ReturnType<typeof Shell.useSidebarMode>;
    const onStateChange = vi.fn();
    renderWithProviders(
      <Shell.Root>
        <Shell.Content>
          <Probe onReady={(value) => (api = value)} />
        </Shell.Content>
        <Shell.Sidebar presentation="fixed" state="expanded" onStateChange={onStateChange}>
          sidebar
        </Shell.Sidebar>
      </Shell.Root>,
    );

    act(() => api.setSidebarMode('collapsed'));

    expect(onStateChange).toHaveBeenLastCalledWith('collapsed', { reason: 'toggle' });
    expect(screen.getByTestId('mode').textContent).toBe('expanded');
  });
});

describe('Shell.useShell (deprecated)', () => {
  it('keeps 0.7’s setters and flags, acting as a user would', () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    let shell!: ReturnType<typeof Shell.useShell>;
    function Probe() {
      shell = Shell.useShell();
      return null;
    }
    const onOpenChange = vi.fn();
    renderWithProviders(
      <Shell.Root>
        <Shell.Content>
          <Probe />
        </Shell.Content>
        <Shell.Inspector presentation="fixed" onOpenChange={onOpenChange}>
          inspector
        </Shell.Inspector>
        <Shell.Sidebar presentation="fixed">sidebar</Shell.Sidebar>
      </Shell.Root>,
    );

    expect(shell.hasSidebar).toBe(true);
    expect(shell.hasLeft).toBe(false);
    act(() => shell.setInspectorMode('expanded'));
    expect(onOpenChange).toHaveBeenLastCalledWith(true, { reason: 'toggle' });
    expect(shell.inspectorMode).toBe('expanded');
    act(() => shell.setSidebarMode('thin'));
    expect(shell.sidebarMode).toBe('thin');
    expect(typeof shell.setHasLeft).toBe('function');
    expect(typeof shell.setPeekTarget).toBe('function');
  });
});

describe('peek (deprecated)', () => {
  it('previews a closed pane in the frame while its Trigger is hovered, and only then', () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {});
    renderWithProviders(
      <Shell.Root>
        <Shell.Header>
          <Shell.Trigger target="inspector" peekOnHover>
            inspector
          </Shell.Trigger>
          <Shell.Trigger target="sidebar" peekOnHover>
            sidebar
          </Shell.Trigger>
        </Shell.Header>
        <Shell.Content>content</Shell.Content>
        <Shell.Inspector presentation="fixed">inspector</Shell.Inspector>
        {/* An overlay is never previewed: it is summoned. */}
        <Shell.Sidebar presentation="overlay">sidebar</Shell.Sidebar>
      </Shell.Root>,
    );
    const inspector = q('.rt-ShellInspector');
    const trigger = screen.getByRole('button', { name: 'inspector' });

    fireEvent.mouseEnter(trigger);
    expect(inspector.hasAttribute('data-peek')).toBe(true);
    fireEvent.mouseLeave(trigger);
    expect(inspector.hasAttribute('data-peek')).toBe(false);

    fireEvent.mouseEnter(screen.getByRole('button', { name: 'sidebar' }));
    expect(q('.rt-ShellSidebar').hasAttribute('data-peek')).toBe(false);

    // Once open, there is nothing to preview.
    fireEvent.click(trigger);
    fireEvent.mouseEnter(trigger);
    expect(inspector.hasAttribute('data-peek')).toBe(false);
  });
});
