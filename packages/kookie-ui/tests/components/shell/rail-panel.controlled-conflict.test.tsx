import * as React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { renderWithProviders, screen, waitFor } from '../../test-utils';
import userEvent from '@testing-library/user-event';
import { Shell } from '../../../src/components/index';

type OpenChangeMeta = { reason: 'init' | 'toggle' | 'responsive' | 'panel' | 'left' };

function ControlledConflictFixture({
  initialRailOpen = true,
  initialPanelOpen = true,
  onRailOpenChange,
  onPanelOpenChange,
}: {
  initialRailOpen?: boolean;
  initialPanelOpen?: boolean;
  onRailOpenChange: (open: boolean, meta: OpenChangeMeta) => void;
  onPanelOpenChange: (open: boolean, meta: OpenChangeMeta) => void;
}) {
  const [railOpen, setRailOpen] = React.useState(initialRailOpen);
  const [panelOpen, setPanelOpen] = React.useState(initialPanelOpen);

  const handleRailOpenChange = React.useCallback(
    (open: boolean, meta: OpenChangeMeta) => {
      onRailOpenChange(open, meta);
      setRailOpen(open);
    },
    [onRailOpenChange],
  );

  const handlePanelOpenChange = React.useCallback(
    (open: boolean, meta: OpenChangeMeta) => {
      onPanelOpenChange(open, meta);
      setPanelOpen(open);
    },
    [onPanelOpenChange],
  );

  return (
    <Shell.Root>
      <Shell.Header>
        <button aria-label="close rail" onClick={() => setRailOpen(false)}>
          close rail
        </button>
        <button aria-label="open panel" onClick={() => setPanelOpen(true)}>
          open panel
        </button>
      </Shell.Header>
      <Shell.Rail presentation="fixed" open={railOpen} onOpenChange={handleRailOpenChange}>
        rail
      </Shell.Rail>
      <Shell.Panel open={panelOpen} onOpenChange={handlePanelOpenChange}>
        panel
      </Shell.Panel>
      <Shell.Content>content</Shell.Content>
    </Shell.Root>
  );
}

describe('Rail/Panel controlled conflict resolution', () => {
  it('closing rail requests panel close without re-opening rail', async () => {
    const railSpy = vi.fn();
    const panelSpy = vi.fn();
    renderWithProviders(
      <ControlledConflictFixture onRailOpenChange={railSpy} onPanelOpenChange={panelSpy} />,
    );

    await userEvent.click(screen.getByRole('button', { name: /close rail/i }));

    const panel = screen.getByText('panel').closest('.rt-ShellPanel') as HTMLElement;
    await waitFor(() => {
      expect(panel).toHaveAttribute('data-mode', 'collapsed');
    });

    expect(panelSpy).toHaveBeenCalledWith(false, expect.objectContaining({ reason: 'left' }));
    const railCalls = railSpy.mock.calls.filter(([open, meta]) => open === true && meta?.reason === 'panel');
    expect(railCalls.length).toBe(0);
  });

  it('opening panel requests rail open when rail is controlled closed', async () => {
    const railSpy = vi.fn();
    const panelSpy = vi.fn();
    renderWithProviders(
      <ControlledConflictFixture initialRailOpen={false} initialPanelOpen={false} onRailOpenChange={railSpy} onPanelOpenChange={panelSpy} />,
    );

    await userEvent.click(screen.getByRole('button', { name: /open panel/i }));

    await waitFor(() => {
      expect(railSpy).toHaveBeenCalledWith(true, expect.objectContaining({ reason: 'panel' }));
    });

    const rail = screen.getByText('rail').closest('.rt-ShellRail') as HTMLElement;
    const panel = screen.getByText('panel').closest('.rt-ShellPanel') as HTMLElement;
    await waitFor(() => {
      expect(rail).toHaveAttribute('data-mode', 'expanded');
      expect(panel).toHaveAttribute('data-mode', 'expanded');
    });
  });
});
