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

    act(() => api.setSidebarMode('collapsed'));

    expect(onStateChange).toHaveBeenLastCalledWith('collapsed', { reason: 'toggle' });
    expect(screen.getByTestId('mode').textContent).toBe('collapsed');
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
