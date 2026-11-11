import * as React from 'react';
import { describe, it, expect } from 'vitest';
import { renderWithProviders, screen } from '../../test-utils';
import userEvent from '@testing-library/user-event';
import { Shell } from '../../../src/components/index';

function ToggleLeft() {
  return (
    <Shell.Trigger target="rail" aria-label="toggle left">
      toggle left
    </Shell.Trigger>
  );
}

function App({ defaultOpen }: { defaultOpen?: boolean }) {
  return (
    <Shell.Root>
      <Shell.Header>
        <ToggleLeft />
      </Shell.Header>
      <Shell.Rail presentation="fixed" expandedSize={64} {...(defaultOpen ? { defaultOpen: true } : {})} />
      <Shell.Panel>panel</Shell.Panel>
      <Shell.Content>content</Shell.Content>
    </Shell.Root>
  );
}

describe('Rail defaultOpen (uncontrolled)', () => {
  it('is open by default when defaultOpen not provided', () => {
    renderWithProviders(<App />);
    const left = document.querySelector('.kui-ShellRail') as HTMLElement;
    expect(left).toHaveAttribute('data-mode', 'expanded');
  });

  it('is open on mount when defaultOpen is true', () => {
    renderWithProviders(<App defaultOpen />);
    const left = document.querySelector('.kui-ShellRail') as HTMLElement;
    expect(left).toHaveAttribute('data-mode', 'expanded');
  });

  it('toggles internally via shell.togglePane("left") without props', async () => {
    renderWithProviders(<App />);
    const btn = screen.getByRole('button', { name: /toggle left/i });
    const left = () => document.querySelector('.kui-ShellRail') as HTMLElement;
    // Rail defaults to open
    expect(left()).toHaveAttribute('data-mode', 'expanded');
    await userEvent.click(btn);
    expect(left()).toHaveAttribute('data-mode', 'collapsed');
  });
});
