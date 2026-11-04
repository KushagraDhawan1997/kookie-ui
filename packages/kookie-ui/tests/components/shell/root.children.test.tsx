import * as React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { renderWithProviders, screen } from '../../test-utils';
import { fireEvent } from '@testing-library/react';
import { Shell } from '../../../src/components/index';

const root = () => document.querySelector('.kui-ShellRoot') as HTMLElement;
const paneChildren = () => [...root().children].filter((child) => !child.classList.contains('kui-ShellScrim'));

/**
 * Since 0.8.0 the Root renders its children as given. Each pane claims its own
 * grid area, so nothing is scanned, reordered or dropped, and a pane does not
 * need to be a direct child to work.
 */
describe('Shell.Root children', () => {
  it('renders every child in JSX order, Shell parts or not', () => {
    renderWithProviders(
      <Shell.Root>
        <div data-testid="before" />
        <Shell.Header>header</Shell.Header>
        <Shell.Rail presentation="fixed">rail</Shell.Rail>
        <Shell.Panel>panel</Shell.Panel>
        <Shell.Content>content</Shell.Content>
        <Shell.Inspector presentation="fixed">inspector</Shell.Inspector>
        <span data-testid="after" />
      </Shell.Root>,
    );

    const order = paneChildren().map((child) => child.getAttribute('data-testid') ?? [...child.classList].find((c) => c.startsWith('kui-Shell') && c !== 'kui-ShellPane'));
    expect(order).toEqual(['before', 'kui-ShellHeader', 'kui-ShellRail', 'kui-ShellPanel', 'kui-ShellContent', 'kui-ShellInspector', 'after']);
  });

  it('drives a pane wrapped in a plain element', () => {
    renderWithProviders(
      <Shell.Root>
        <Shell.Header>
          <Shell.Trigger target="inspector">inspector</Shell.Trigger>
        </Shell.Header>
        <Shell.Content>content</Shell.Content>
        <div className="wrapper">
          <Shell.Inspector presentation="fixed">inspector</Shell.Inspector>
        </div>
      </Shell.Root>,
    );

    const trigger = screen.getByRole('button', { name: 'inspector' });
    const inspector = document.querySelector('.wrapper > .kui-ShellInspector') as HTMLElement;
    expect(trigger.getAttribute('aria-controls')).toBe(inspector.id);
    expect(trigger.getAttribute('aria-expanded')).toBe('false');

    fireEvent.click(trigger);
    expect(inspector.getAttribute('data-state')).toBe('open');
    expect(trigger.getAttribute('aria-expanded')).toBe('true');
  });

  it('registers a pane mounted after the Root, and honours its defaultOpen', () => {
    function App({ withInspector }: { withInspector: boolean }) {
      return (
        <Shell.Root>
          <Shell.Header>
            <Shell.Trigger target="inspector">inspector</Shell.Trigger>
          </Shell.Header>
          <Shell.Content>content</Shell.Content>
          {withInspector && (
            <Shell.Inspector presentation="fixed" defaultOpen>
              inspector
            </Shell.Inspector>
          )}
        </Shell.Root>
      );
    }

    const { rerender } = renderWithProviders(<App withInspector={false} />);
    const trigger = screen.getByRole('button', { name: 'inspector' });
    expect(trigger.hasAttribute('aria-controls')).toBe(false);

    rerender(<App withInspector />);
    const inspector = document.querySelector('.kui-ShellInspector') as HTMLElement;
    expect(inspector.getAttribute('data-state')).toBe('open');
    expect(trigger.getAttribute('aria-controls')).toBe(inspector.id);
    expect(trigger.getAttribute('aria-expanded')).toBe('true');

    fireEvent.click(trigger);
    expect(inspector.getAttribute('data-state')).toBe('closed');

    // Unmounting it leaves the Trigger pointing at nothing, not at a stale id.
    rerender(<App withInspector={false} />);
    expect(trigger.hasAttribute('aria-controls')).toBe(false);
    expect(trigger.hasAttribute('aria-expanded')).toBe(false);
  });

  it('renders a Sidebar and a Rail with a Panel in the same Root', () => {
    renderWithProviders(
      <Shell.Root>
        <Shell.Rail presentation="fixed">rail</Shell.Rail>
        <Shell.Panel>panel</Shell.Panel>
        <Shell.Sidebar presentation="fixed">sidebar</Shell.Sidebar>
        <Shell.Content>content</Shell.Content>
      </Shell.Root>,
    );

    expect(document.querySelector('.kui-ShellRail')).not.toBeNull();
    expect(document.querySelector('.kui-ShellPanel')).not.toBeNull();
    expect(document.querySelector('.kui-ShellSidebar')).not.toBeNull();
  });
});

/**
 * The Rail and the Panel no longer drive each other. An app that wants the
 * old cascade writes it in `onOpenChange`.
 */
describe('Rail and Panel are independent', () => {
  function App({ onPanel, onRail }: { onPanel?: (open: boolean) => void; onRail?: (open: boolean) => void }) {
    return (
      <Shell.Root>
        <Shell.Header>
          <Shell.Trigger target="rail">rail</Shell.Trigger>
          <Shell.Trigger target="panel">panel</Shell.Trigger>
        </Shell.Header>
        <Shell.Rail presentation="fixed" defaultOpen onOpenChange={onRail}>
          rail
        </Shell.Rail>
        <Shell.Panel defaultOpen onOpenChange={onPanel}>
          panel
        </Shell.Panel>
        <Shell.Content>content</Shell.Content>
      </Shell.Root>
    );
  }

  it('closing the Rail leaves the Panel open', () => {
    const onPanel = vi.fn();
    renderWithProviders(<App onPanel={onPanel} />);

    fireEvent.click(screen.getByRole('button', { name: 'rail' }));

    expect(document.querySelector('.kui-ShellRail')?.getAttribute('data-state')).toBe('closed');
    expect(document.querySelector('.kui-ShellPanel')?.getAttribute('data-state')).toBe('open');
    expect(onPanel).not.toHaveBeenCalled();
  });

  it('opening the Panel leaves a closed Rail closed', () => {
    const onRail = vi.fn();
    renderWithProviders(<App onRail={onRail} />);
    fireEvent.click(screen.getByRole('button', { name: 'rail' }));
    onRail.mockClear();

    // The Panel starts open: close it, then open it again with the Rail closed.
    fireEvent.click(screen.getByRole('button', { name: 'panel' }));
    fireEvent.click(screen.getByRole('button', { name: 'panel' }));

    expect(document.querySelector('.kui-ShellPanel')?.getAttribute('data-state')).toBe('open');
    expect(document.querySelector('.kui-ShellRail')?.getAttribute('data-state')).toBe('closed');
    expect(onRail).not.toHaveBeenCalled();
  });
});
