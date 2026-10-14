import * as React from 'react';
import { describe, it, expect } from 'vitest';
import { renderWithProviders, screen } from '../../test-utils';
import { Shell } from '../../../src/components/index';

describe('Shell inset prop', () => {
  describe('Shell.Content', () => {
    it('does not have data-inset when inset is not provided', () => {
      renderWithProviders(
        <Shell.Root>
          <Shell.Content>content</Shell.Content>
        </Shell.Root>,
      );
      const content = screen.getByText('content').closest('.rt-ShellContent') as HTMLElement;
      expect(content.hasAttribute('data-inset')).toBe(false);
    });

    it('has data-inset when inset is true', () => {
      renderWithProviders(
        <Shell.Root>
          <Shell.Content inset>content</Shell.Content>
        </Shell.Root>,
      );
      const content = screen.getByText('content').closest('.rt-ShellContent') as HTMLElement;
      expect(content.hasAttribute('data-inset')).toBe(true);
    });
  });

  describe('Shell.Sidebar', () => {
    it('does not have data-inset when inset is not provided', () => {
      renderWithProviders(
        <Shell.Root>
          <Shell.Sidebar presentation="fixed" defaultState="expanded">
            sidebar
          </Shell.Sidebar>
          <Shell.Content>content</Shell.Content>
        </Shell.Root>,
      );
      const sidebar = screen.getByText('sidebar').closest('.rt-ShellSidebar') as HTMLElement;
      expect(sidebar.hasAttribute('data-inset')).toBe(false);
    });

    it('has data-inset when inset is true', () => {
      renderWithProviders(
        <Shell.Root>
          <Shell.Sidebar presentation="fixed" defaultState="expanded" inset>
            sidebar
          </Shell.Sidebar>
          <Shell.Content>content</Shell.Content>
        </Shell.Root>,
      );
      const sidebar = screen.getByText('sidebar').closest('.rt-ShellSidebar') as HTMLElement;
      expect(sidebar.hasAttribute('data-inset')).toBe(true);
    });
  });

  describe('Shell.Inspector', () => {
    it('does not have data-inset when inset is not provided', () => {
      renderWithProviders(
        <Shell.Root>
          <Shell.Content>content</Shell.Content>
          <Shell.Inspector presentation="fixed" defaultOpen>
            inspector
          </Shell.Inspector>
        </Shell.Root>,
      );
      const inspector = screen.getByText('inspector').closest('.rt-ShellInspector') as HTMLElement;
      expect(inspector.hasAttribute('data-inset')).toBe(false);
    });

    it('has data-inset when inset is true', () => {
      renderWithProviders(
        <Shell.Root>
          <Shell.Content>content</Shell.Content>
          <Shell.Inspector presentation="fixed" defaultOpen inset>
            inspector
          </Shell.Inspector>
        </Shell.Root>,
      );
      const inspector = screen.getByText('inspector').closest('.rt-ShellInspector') as HTMLElement;
      expect(inspector.hasAttribute('data-inset')).toBe(true);
    });
  });

  describe('Shell.Bottom', () => {
    it('does not have data-inset when inset is not provided', () => {
      renderWithProviders(
        <Shell.Root>
          <Shell.Content>content</Shell.Content>
          <Shell.Bottom presentation="fixed" defaultOpen>
            bottom
          </Shell.Bottom>
        </Shell.Root>,
      );
      const bottom = screen.getByText('bottom').closest('.rt-ShellBottom') as HTMLElement;
      expect(bottom.hasAttribute('data-inset')).toBe(false);
    });

    it('has data-inset when inset is true', () => {
      renderWithProviders(
        <Shell.Root>
          <Shell.Content>content</Shell.Content>
          <Shell.Bottom presentation="fixed" defaultOpen inset>
            bottom
          </Shell.Bottom>
        </Shell.Root>,
      );
      const bottom = screen.getByText('bottom').closest('.rt-ShellBottom') as HTMLElement;
      expect(bottom.hasAttribute('data-inset')).toBe(true);
    });
  });

  // 0.8.0: Rail and Panel are separate panes, each with its own data-inset.
  describe('Shell.Rail and Shell.Panel', () => {
    it('does not have data-inset when inset is not provided', () => {
      renderWithProviders(
        <Shell.Root>
          <Shell.Rail />
          <Shell.Panel>panel</Shell.Panel>
          <Shell.Content>content</Shell.Content>
        </Shell.Root>,
      );
      expect((document.querySelector('.rt-ShellRail') as HTMLElement).hasAttribute('data-inset')).toBe(false);
      expect((document.querySelector('.rt-ShellPanel') as HTMLElement).hasAttribute('data-inset')).toBe(false);
    });

    it('has data-inset on the Rail when Rail has inset', () => {
      renderWithProviders(
        <Shell.Root>
          <Shell.Rail inset />
          <Shell.Panel>panel</Shell.Panel>
          <Shell.Content>content</Shell.Content>
        </Shell.Root>,
      );
      expect((document.querySelector('.rt-ShellRail') as HTMLElement).hasAttribute('data-inset')).toBe(true);
      expect((document.querySelector('.rt-ShellPanel') as HTMLElement).hasAttribute('data-inset')).toBe(false);
    });

    it('has data-inset on the Panel when Panel has inset', () => {
      renderWithProviders(
        <Shell.Root>
          <Shell.Rail />
          <Shell.Panel inset>panel</Shell.Panel>
          <Shell.Content>content</Shell.Content>
        </Shell.Root>,
      );
      expect((document.querySelector('.rt-ShellPanel') as HTMLElement).hasAttribute('data-inset')).toBe(true);
    });
  });

  // 0.8.0: the Root is the grid; there is no Body element, so the flag is on the Root.
  describe('data-has-inset on Shell.Root', () => {
    it('does not have data-has-inset when no panes have inset', () => {
      renderWithProviders(
        <Shell.Root>
          <Shell.Content>content</Shell.Content>
        </Shell.Root>,
      );
      const body = document.querySelector('.rt-ShellRoot') as HTMLElement;
      expect(body.hasAttribute('data-has-inset')).toBe(false);
    });

    it('has data-has-inset when Content has inset', () => {
      renderWithProviders(
        <Shell.Root>
          <Shell.Content inset>content</Shell.Content>
        </Shell.Root>,
      );
      const body = document.querySelector('.rt-ShellRoot') as HTMLElement;
      expect(body.hasAttribute('data-has-inset')).toBe(true);
    });

    it('has data-has-inset when Sidebar has inset', () => {
      renderWithProviders(
        <Shell.Root>
          <Shell.Sidebar presentation="fixed" defaultState="expanded" inset>
            sidebar
          </Shell.Sidebar>
          <Shell.Content>content</Shell.Content>
        </Shell.Root>,
      );
      const body = document.querySelector('.rt-ShellRoot') as HTMLElement;
      expect(body.hasAttribute('data-has-inset')).toBe(true);
    });

    it('has data-has-inset when Inspector has inset', () => {
      renderWithProviders(
        <Shell.Root>
          <Shell.Content>content</Shell.Content>
          <Shell.Inspector presentation="fixed" defaultOpen inset>
            inspector
          </Shell.Inspector>
        </Shell.Root>,
      );
      const body = document.querySelector('.rt-ShellRoot') as HTMLElement;
      expect(body.hasAttribute('data-has-inset')).toBe(true);
    });

    it('has data-has-inset when Rail has inset', () => {
      renderWithProviders(
        <Shell.Root>
          <Shell.Rail inset />
          <Shell.Panel>panel</Shell.Panel>
          <Shell.Content>content</Shell.Content>
        </Shell.Root>,
      );
      const body = document.querySelector('.rt-ShellRoot') as HTMLElement;
      expect(body.hasAttribute('data-has-inset')).toBe(true);
    });

    it('has data-has-inset when multiple panes have inset', () => {
      renderWithProviders(
        <Shell.Root>
          <Shell.Sidebar presentation="fixed" defaultState="expanded" inset>
            sidebar
          </Shell.Sidebar>
          <Shell.Content inset>content</Shell.Content>
          <Shell.Inspector presentation="fixed" defaultOpen inset>
            inspector
          </Shell.Inspector>
        </Shell.Root>,
      );
      const body = document.querySelector('.rt-ShellRoot') as HTMLElement;
      expect(body.hasAttribute('data-has-inset')).toBe(true);
    });
  });

  describe('a floating Panel beside an inset Rail', () => {
    it('starts after the Rail card and its margins, not on top of them', () => {
      renderWithProviders(
        <Shell.Root>
          <Shell.Rail presentation="fixed" defaultOpen inset expandedSize={64} />
          <Shell.Panel presentation="stacked" defaultOpen>
            panel
          </Shell.Panel>
          <Shell.Content>content</Shell.Content>
        </Shell.Root>,
      );
      const offset = (document.querySelector('.rt-ShellRoot') as HTMLElement).style.getPropertyValue('--shell-rail-offset');
      expect(offset).toBe('calc(64px + 2 * var(--shell-inset-gap))');
    });
  });
});
