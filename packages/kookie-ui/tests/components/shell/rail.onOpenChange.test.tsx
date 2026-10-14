import * as React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { renderWithProviders, screen } from '../../test-utils';
import userEvent from '@testing-library/user-event';
import { Shell } from '../../../src/components/index';
import { useShell } from '../../../src/components/shell.context';

function ToggleLeft() {
  const shell = useShell();
  return (
    <button aria-label="toggle left" onClick={() => shell.togglePane('left')}>
      toggle left
    </button>
  );
}

describe('Rail onOpenChange notify', () => {
  it('does not fire on mount, whatever the default (0.8.0: only a user action is reported)', () => {
    const spy = vi.fn();
    renderWithProviders(
      <Shell.Root>
        <Shell.Rail presentation="fixed" defaultOpen onOpenChange={spy} />
        <Shell.Panel>panel</Shell.Panel>
        <Shell.Content>content</Shell.Content>
      </Shell.Root>,
    );
    expect(spy).not.toHaveBeenCalled();
  });

  it('fires with reason=toggle when toggled internally', async () => {
    const spy = vi.fn();
    renderWithProviders(
      <Shell.Root>
        <Shell.Header>
          <ToggleLeft />
        </Shell.Header>
        {/* Rail defaults to open, so toggling closes it */}
        <Shell.Rail presentation="fixed" onOpenChange={spy} />
        <Shell.Panel>panel</Shell.Panel>
        <Shell.Content>content</Shell.Content>
      </Shell.Root>,
    );
    await userEvent.click(screen.getByRole('button', { name: /toggle left/i }));
    expect(spy).toHaveBeenCalledWith(false, { reason: 'toggle' });
  });
});
