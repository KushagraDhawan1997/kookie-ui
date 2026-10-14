import * as React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { renderWithProviders, screen } from '../../test-utils';
import userEvent from '@testing-library/user-event';
import { Shell } from '../../../src/components/index';
import { useShell } from '../../../src/components/shell.context';

function ToggleBottom() {
  const shell = useShell();
  return (
    <button aria-label="toggle bottom" onClick={() => shell.togglePane('bottom')}>
      toggle bottom
    </button>
  );
}

describe('Bottom onOpenChange (uncontrolled notify only)', () => {
  it('does not fire on mount, whatever the default (0.8.0: only a user action is reported)', () => {
    const spy = vi.fn();
    renderWithProviders(
      <Shell.Root>
        <Shell.Content>content</Shell.Content>
        <Shell.Bottom presentation={{ initial: 'fixed' }} defaultOpen onOpenChange={spy}>
          bottom
        </Shell.Bottom>
      </Shell.Root>,
    );
    expect(spy).not.toHaveBeenCalled();
  });

  it('fires with reason=toggle on internal toggle', async () => {
    const spy = vi.fn();
    renderWithProviders(
      <Shell.Root>
        <Shell.Header>
          <ToggleBottom />
        </Shell.Header>
        <Shell.Content>content</Shell.Content>
        <Shell.Bottom presentation={{ initial: 'fixed' }} onOpenChange={spy}>
          bottom
        </Shell.Bottom>
      </Shell.Root>,
    );
    await userEvent.click(screen.getByRole('button', { name: /toggle bottom/i }));
    expect(spy).toHaveBeenCalledWith(true, { reason: 'toggle' });
  });
});
