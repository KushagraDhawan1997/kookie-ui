import * as React from 'react';
import { renderToString } from 'react-dom/server';
import { afterAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { renderWithProviders, screen } from '../../test-utils';
import { fireEvent } from '@testing-library/react';
import { Shell } from '../../../src/components/index';
import { installViewport } from '../../helpers/viewport';

// Before the first render: useBreakpoint keeps the lists it creates first.
const viewport = installViewport(0);
afterAll(() => viewport.restore());
beforeEach(() => viewport.setWidth(0));

const q = (selector: string) => document.querySelector(selector) as HTMLElement;

describe('focus when an open pane crosses a breakpoint', () => {
  it('an open overlay that becomes fixed keeps focus where the user is typing', () => {
    renderWithProviders(
      <Shell.Root>
        <Shell.Header>
          <Shell.Trigger target="inspector">inspector</Shell.Trigger>
        </Shell.Header>
        <Shell.Content>content</Shell.Content>
        <Shell.Inspector>
          <input aria-label="name" />
        </Shell.Inspector>
      </Shell.Root>,
    );
    fireEvent.click(screen.getByRole('button', { name: 'inspector' }));
    const input = screen.getByRole('textbox', { name: 'name' });
    input.focus();

    viewport.setWidth(1100);

    expect(q('.rt-ShellInspector').getAttribute('data-presentation')).toBe('fixed');
    expect(q('.rt-ShellInspector').getAttribute('data-state')).toBe('open');
    expect(document.activeElement).toBe(input);
  });

  it('a pane that became an overlay under focus returns focus to its Trigger when it closes', () => {
    viewport.setWidth(1100);
    renderWithProviders(
      <Shell.Root>
        <Shell.Header>
          <Shell.Trigger target="inspector">inspector</Shell.Trigger>
        </Shell.Header>
        <Shell.Content>content</Shell.Content>
        <Shell.Inspector defaultOpen>
          <input aria-label="name" />
        </Shell.Inspector>
      </Shell.Root>,
    );
    const input = screen.getByRole('textbox', { name: 'name' });
    input.focus();

    viewport.setWidth(500);
    expect(q('.rt-ShellRoot').hasAttribute('data-overlay-live')).toBe(true);
    fireEvent.keyDown(input, { key: 'Escape' });

    expect(q('.rt-ShellInspector').getAttribute('data-state')).toBe('closed');
    expect(document.activeElement).toBe(screen.getByRole('button', { name: 'inspector' }));
  });
});

/**
 * A responsive controlled `open` is deprecated. It is resolved the way a
 * responsive default is: the stylesheet answers it at each breakpoint, and
 * crossing one is not a change the app made.
 */
describe('a responsive controlled open', () => {
  it('fires no callback on a breakpoint crossing', () => {
    const onExpand = vi.fn();
    const onCollapse = vi.fn();
    renderWithProviders(
      <Shell.Root>
        <Shell.Content>content</Shell.Content>
        <Shell.Inspector presentation="fixed" open={{ initial: false, lg: true }} onExpand={onExpand} onCollapse={onCollapse}>
          inspector
        </Shell.Inspector>
      </Shell.Root>,
    );
    const inspector = q('.rt-ShellInspector');

    for (const width of [1400, 600, 1400, 0]) viewport.setWidth(width);
    viewport.setWidth(1400);

    expect(inspector.getAttribute('data-mode')).toBe('expanded');
    expect(onExpand).not.toHaveBeenCalled();
    expect(onCollapse).not.toHaveBeenCalled();
  });

  it('is in the server HTML at every breakpoint', () => {
    const html = renderToString(
      <Shell.Root>
        <Shell.Content>content</Shell.Content>
        <Shell.Inspector presentation="fixed" open={{ initial: false, lg: true }}>
          inspector
        </Shell.Inspector>
      </Shell.Root>,
    );
    expect(html).toContain('data-auto-md="closed"');
    expect(html).toContain('data-auto-lg="open"');
  });
});

describe('a single-mode Sidebar toggles back to the default at the current breakpoint', () => {
  it('after it is touched, with one presentation at every width', () => {
    viewport.setWidth(1100);
    const onStateChange = vi.fn();
    renderWithProviders(
      <Shell.Root>
        <Shell.Header>
          <Shell.Trigger target="sidebar">sidebar</Shell.Trigger>
        </Shell.Header>
        <Shell.Sidebar presentation="fixed" toggleModes="single" defaultState={{ initial: 'collapsed', md: 'thin' }} onStateChange={onStateChange}>
          sidebar
        </Shell.Sidebar>
        <Shell.Content>content</Shell.Content>
      </Shell.Root>,
    );
    const trigger = screen.getByRole('button', { name: 'sidebar' });

    fireEvent.click(trigger);
    expect(onStateChange).toHaveBeenLastCalledWith('collapsed', { reason: 'toggle' });
    fireEvent.click(trigger);
    expect(onStateChange).toHaveBeenLastCalledWith('thin', { reason: 'toggle' });
  });
});
