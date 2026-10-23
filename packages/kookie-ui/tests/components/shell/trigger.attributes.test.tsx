import * as React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { renderWithProviders, screen } from '../../test-utils';
import userEvent from '@testing-library/user-event';
import { fireEvent } from '@testing-library/react';
import { Shell } from '../../../src/components/index';

function Frame({ children, inspectorId }: { children: React.ReactNode; inspectorId?: string }) {
  return (
    <Shell.Root>
      <Shell.Header>{children}</Shell.Header>
      <Shell.Rail presentation="fixed">rail</Shell.Rail>
      <Shell.Panel>panel</Shell.Panel>
      <Shell.Content>content</Shell.Content>
      <Shell.Inspector id={inspectorId} presentation="fixed">
        inspector
      </Shell.Inspector>
      <Shell.Bottom presentation="fixed">bottom</Shell.Bottom>
    </Shell.Root>
  );
}

describe('Shell.Trigger attributes', () => {
  it('is type="button", so it never submits a form it sits in', async () => {
    const onSubmit = vi.fn((event: React.FormEvent) => event.preventDefault());
    renderWithProviders(
      <form onSubmit={onSubmit}>
        <Frame>
          <Shell.Trigger target="inspector">inspector</Shell.Trigger>
        </Frame>
      </form>,
    );

    const trigger = screen.getByRole('button', { name: 'inspector' });
    expect(trigger.getAttribute('type')).toBe('button');
    await userEvent.click(trigger);
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('lets a consumer state its own type', () => {
    renderWithProviders(
      <Frame>
        <Shell.Trigger target="inspector" type="submit">
          inspector
        </Shell.Trigger>
      </Frame>,
    );
    expect(screen.getByRole('button', { name: 'inspector' }).getAttribute('type')).toBe('submit');
  });

  it('names the pane it controls with aria-controls, for every target', () => {
    renderWithProviders(
      <Frame>
        <Shell.Trigger target="rail">rail</Shell.Trigger>
        <Shell.Trigger target="panel">panel</Shell.Trigger>
        <Shell.Trigger target="inspector">inspector</Shell.Trigger>
        <Shell.Trigger target="bottom">bottom</Shell.Trigger>
      </Frame>,
    );

    const expected: Record<string, string> = {
      rail: 'kui-ShellRail',
      panel: 'kui-ShellPanel',
      inspector: 'kui-ShellInspector',
      bottom: 'kui-ShellBottom',
    };
    for (const [name, className] of Object.entries(expected)) {
      const controls = screen.getByRole('button', { name }).getAttribute('aria-controls');
      expect(controls, name).toBeTruthy();
      // The id must resolve to the pane itself, not merely be present.
      const pane = document.getElementById(controls!);
      expect(pane?.classList.contains(className), name).toBe(true);
    }
  });

  it('follows a consumer-supplied pane id', () => {
    renderWithProviders(
      <Frame inspectorId="my-inspector">
        <Shell.Trigger target="inspector">inspector</Shell.Trigger>
      </Frame>,
    );
    expect(screen.getByRole('button', { name: 'inspector' }).getAttribute('aria-controls')).toBe('my-inspector');
    expect(document.getElementById('my-inspector')?.classList.contains('kui-ShellInspector')).toBe(true);
  });

  it('points a sidebar trigger at the sidebar', () => {
    renderWithProviders(
      <Shell.Root>
        <Shell.Header>
          <Shell.Trigger target="sidebar">sidebar</Shell.Trigger>
        </Shell.Header>
        <Shell.Sidebar presentation="fixed">sidebar</Shell.Sidebar>
        <Shell.Content>content</Shell.Content>
      </Shell.Root>,
    );
    const controls = screen.getByRole('button', { name: 'sidebar' }).getAttribute('aria-controls');
    expect(document.getElementById(controls!)?.classList.contains('kui-ShellSidebar')).toBe(true);
  });

  it('reports whether its pane is open with aria-expanded', () => {
    renderWithProviders(
      <Frame>
        <Shell.Trigger target="inspector">inspector</Shell.Trigger>
      </Frame>,
    );
    const trigger = screen.getByRole('button', { name: 'inspector' });
    expect(trigger.getAttribute('aria-expanded')).toBe('false');

    fireEvent.click(trigger);
    expect(trigger.getAttribute('aria-expanded')).toBe('true');

    fireEvent.click(trigger);
    expect(trigger.getAttribute('aria-expanded')).toBe('false');
  });

  it('runs the consumer onClick first, and preventDefault there cancels it', () => {
    const onOpenChange = vi.fn();
    renderWithProviders(
      <Shell.Root>
        <Shell.Header>
          <Shell.Trigger target="inspector" onClick={(event) => event.preventDefault()}>
            inspector
          </Shell.Trigger>
        </Shell.Header>
        <Shell.Content>content</Shell.Content>
        <Shell.Inspector presentation="fixed" onOpenChange={onOpenChange}>
          inspector
        </Shell.Inspector>
      </Shell.Root>,
    );

    fireEvent.click(screen.getByRole('button', { name: 'inspector' }));

    expect(onOpenChange).not.toHaveBeenCalled();
    // Still untouched, and still showing nothing.
    const inspector = document.querySelector('.kui-ShellInspector');
    expect(inspector?.getAttribute('data-state')).toBe('auto');
    expect(inspector?.getAttribute('data-mode')).toBe('collapsed');
  });

  it('expand and collapse only ever move one way', () => {
    renderWithProviders(
      <Frame>
        <Shell.Trigger target="inspector" action="expand">
          expand
        </Shell.Trigger>
        <Shell.Trigger target="inspector" action="collapse">
          collapse
        </Shell.Trigger>
      </Frame>,
    );
    const inspector = document.querySelector('.kui-ShellInspector') as HTMLElement;

    fireEvent.click(screen.getByRole('button', { name: 'expand' }));
    fireEvent.click(screen.getByRole('button', { name: 'expand' }));
    expect(inspector.getAttribute('data-state')).toBe('open');

    fireEvent.click(screen.getByRole('button', { name: 'collapse' }));
    fireEvent.click(screen.getByRole('button', { name: 'collapse' }));
    expect(inspector.getAttribute('data-state')).toBe('closed');
  });
});
