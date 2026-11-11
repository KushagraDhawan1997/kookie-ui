import * as React from 'react';
import { describe, it, expect } from 'vitest';
import { renderWithProviders, screen } from '../../test-utils';
import userEvent from '@testing-library/user-event';
import { Shell } from '../../../src/components/index';

function ToggleSidebar() {
  return (
    <Shell.Trigger target="sidebar" aria-label="toggle sidebar">
      toggle sidebar
    </Shell.Trigger>
  );
}

function App({ defaultState }: { defaultState?: 'collapsed' | 'thin' | 'expanded' }) {
  return (
    <Shell.Root>
      <Shell.Header>
        <ToggleSidebar />
      </Shell.Header>
      <Shell.Sidebar presentation="fixed" defaultState={defaultState}>
        sidebar
      </Shell.Sidebar>
      <Shell.Content>content</Shell.Content>
    </Shell.Root>
  );
}

describe('Sidebar defaultState (uncontrolled)', () => {
  it('is expanded by default when defaultState not provided (legacy defaultMode)', () => {
    renderWithProviders(<App />);
    const el = screen.getByText('sidebar').closest('.kui-ShellSidebar') as HTMLElement;
    expect(el).toHaveAttribute('data-mode', 'expanded');
  });

  it('is open on mount when defaultState is expanded', () => {
    renderWithProviders(<App defaultState="expanded" />);
    const el = screen.getByText('sidebar').closest('.kui-ShellSidebar') as HTMLElement;
    expect(el).toHaveAttribute('data-mode', 'expanded');
  });

  it('toggles internally', async () => {
    renderWithProviders(<App />);
    const el = () => screen.getByText('sidebar').closest('.kui-ShellSidebar') as HTMLElement;
    expect(el()).toHaveAttribute('data-mode', 'expanded');
    await userEvent.click(screen.getByRole('button', { name: /toggle sidebar/i }));
    expect(el()).toHaveAttribute('data-mode', 'collapsed');
  });
});
