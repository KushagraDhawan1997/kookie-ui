import * as React from 'react';
import { renderToString } from 'react-dom/server';
import { hydrateRoot } from 'react-dom/client';
import { act } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';

import { Shell, Theme } from '../../src/components/index';

function App({ onSidebar, onInspector }: { onSidebar?: () => void; onInspector?: () => void }) {
  return (
    <Theme>
      <Shell.Root>
        <Shell.Header>
          <Shell.Trigger target="sidebar">sidebar</Shell.Trigger>
          <Shell.Trigger target="inspector">inspector</Shell.Trigger>
        </Shell.Header>
        <Shell.Sidebar onStateChange={onSidebar}>sidebar content</Shell.Sidebar>
        <Shell.Content>content</Shell.Content>
        <Shell.Inspector defaultOpen={{ initial: false, lg: true }} onOpenChange={onInspector}>
          inspector content
        </Shell.Inspector>
      </Shell.Root>
    </Theme>
  );
}

const parse = (html: string) => {
  const container = document.createElement('div');
  container.innerHTML = html;
  return container;
};

afterEach(() => {
  vi.restoreAllMocks();
});

/**
 * The server has no window. Since 0.8.0 it does not need one: an untouched
 * pane's answer at every breakpoint is in its attributes, and the stylesheet
 * applies the right one before any script runs. Nothing is gated on hydration.
 */
describe('Shell server markup', () => {
  it('contains every pane and its content, with nothing held back for hydration', () => {
    const html = renderToString(<App />);
    expect(html).toContain('sidebar content');
    expect(html).toContain('inspector content');
    expect(html).not.toContain('data-visible');
  });

  it('carries the default Sidebar answer at each breakpoint for the stylesheet', () => {
    const sidebar = parse(renderToString(<App />)).querySelector('.kui-ShellSidebar') as HTMLElement;

    expect(sidebar.getAttribute('data-state')).toBe('auto');
    // An overlay below 768px, resting closed; in the frame from 768px, open.
    expect(sidebar.getAttribute('data-presentation-initial')).toBe('overlay');
    expect(sidebar.getAttribute('data-presentation-sm')).toBe('fixed');
    expect(sidebar.getAttribute('data-auto-initial')).toBe('closed');
    expect(sidebar.getAttribute('data-auto-sm')).toBe('open');
    expect(sidebar.getAttribute('data-auto-xl')).toBe('open');
  });

  it('carries a responsive defaultOpen the same way', () => {
    const inspector = parse(renderToString(<App />)).querySelector('.kui-ShellInspector') as HTMLElement;
    expect(inspector.getAttribute('data-auto-md')).toBe('closed');
    expect(inspector.getAttribute('data-auto-lg')).toBe('open');
  });

  it('does not guess aria-expanded for a pane whose answer depends on the window', () => {
    const container = parse(renderToString(<App />));
    const trigger = [...container.querySelectorAll('button')].find((b) => b.textContent === 'sidebar');
    expect(trigger?.hasAttribute('aria-expanded')).toBe(false);
  });
});

describe('Shell hydration', () => {
  it('hydrates without a mismatch, and reports no state change', () => {
    const onSidebar = vi.fn();
    const onInspector = vi.fn();
    const element = <App onSidebar={onSidebar} onInspector={onInspector} />;
    const container = parse(renderToString(element));
    document.body.appendChild(container);
    const sidebarBefore = container.querySelector('.kui-ShellSidebar');

    const error = vi.spyOn(console, 'error').mockImplementation(() => {});
    let root: ReturnType<typeof hydrateRoot> | undefined;
    try {
      act(() => {
        root = hydrateRoot(container, element);
      });

      expect(error).not.toHaveBeenCalled();
      expect(onSidebar).not.toHaveBeenCalled();
      expect(onInspector).not.toHaveBeenCalled();
      // The server's element is kept, and the mirror fills in once the window is known.
      expect(container.querySelector('.kui-ShellSidebar')).toBe(sidebarBefore);
      const trigger = [...container.querySelectorAll('button')].find((b) => b.textContent === 'sidebar');
      expect(trigger?.getAttribute('aria-expanded')).toBe('false');
    } finally {
      act(() => root?.unmount());
      container.remove();
    }
  });
});
