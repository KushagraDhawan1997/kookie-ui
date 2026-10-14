import * as React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { renderWithProviders, screen, waitFor } from '../../test-utils';
import userEvent from '@testing-library/user-event';
import { Shell } from '../../../src/components/index';

// The panel took onExpand/onCollapse and dropped them, so it was the one pane
// where they never fired. These hold it to the other panes' terms: any change
// to whether the panel is shown, never the start-up itself.
describe('Panel onExpand/onCollapse callbacks', () => {
  it('does not fire on initial mount, open or closed', () => {
    const onExpand = vi.fn();
    const onCollapse = vi.fn();

    renderWithProviders(
      <Shell.Root>
        <Shell.Rail presentation="fixed" />
        <Shell.Panel defaultOpen onExpand={onExpand} onCollapse={onCollapse}>
          panel
        </Shell.Panel>
        <Shell.Content>content</Shell.Content>
      </Shell.Root>,
    );

    expect(onExpand).not.toHaveBeenCalled();
    expect(onCollapse).not.toHaveBeenCalled();
  });

  it('fires onExpand then onCollapse as controlled open changes', async () => {
    const onExpand = vi.fn();
    const onCollapse = vi.fn();

    function ControlledFixture() {
      const [open, setOpen] = React.useState(false);
      return (
        <Shell.Root>
          <Shell.Header>
            <button onClick={() => setOpen((o) => !o)}>toggle</button>
          </Shell.Header>
          <Shell.Rail presentation="fixed" />
          <Shell.Panel open={open} onOpenChange={setOpen} onExpand={onExpand} onCollapse={onCollapse}>
            panel
          </Shell.Panel>
          <Shell.Content>content</Shell.Content>
        </Shell.Root>
      );
    }

    renderWithProviders(<ControlledFixture />);
    expect(onExpand).not.toHaveBeenCalled();
    expect(onCollapse).not.toHaveBeenCalled();

    await userEvent.click(screen.getByRole('button', { name: 'toggle' }));
    await waitFor(() => expect(onExpand).toHaveBeenCalledTimes(1));
    expect(onCollapse).not.toHaveBeenCalled();

    await userEvent.click(screen.getByRole('button', { name: 'toggle' }));
    await waitFor(() => expect(onCollapse).toHaveBeenCalledTimes(1));
    expect(onExpand).toHaveBeenCalledTimes(1);
  });

  it('fires when a Trigger toggles an uncontrolled panel', async () => {
    const onExpand = vi.fn();
    const onCollapse = vi.fn();

    renderWithProviders(
      <Shell.Root>
        <Shell.Header>
          <Shell.Trigger target="panel">panel</Shell.Trigger>
        </Shell.Header>
        <Shell.Rail presentation="fixed" />
        <Shell.Panel onExpand={onExpand} onCollapse={onCollapse}>
          panel content
        </Shell.Panel>
        <Shell.Content>content</Shell.Content>
      </Shell.Root>,
    );

    await userEvent.click(screen.getByRole('button', { name: 'panel' }));
    await waitFor(() => expect(onExpand).toHaveBeenCalledTimes(1));

    await userEvent.click(screen.getByRole('button', { name: 'panel' }));
    await waitFor(() => expect(onCollapse).toHaveBeenCalledTimes(1));
  });
});
