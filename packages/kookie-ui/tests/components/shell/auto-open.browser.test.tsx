import * as React from 'react';
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { Shell, Theme } from '../../../src/components/index';

// An untouched pane whose default is open at this width is shown by the stylesheet, with no script.
describe('an untouched pane follows its responsive default', () => {
  it('a Sidebar open from sm up is displayed on a wide window', () => {
    const { container } = render(
      <Theme>
        <Shell.Root height="400px">
          <Shell.Sidebar presentation="fixed" defaultState={{ initial: 'collapsed', sm: 'expanded' }}>
            nav
          </Shell.Sidebar>
          <Shell.Content>page</Shell.Content>
        </Shell.Root>
      </Theme>,
    );
    const sidebar = container.querySelector<HTMLElement>('.kui-ShellSidebar')!;
    expect(sidebar.dataset.state).toBe('auto');
    expect(getComputedStyle(sidebar).display).not.toBe('none');
    expect(sidebar.getBoundingClientRect().width).toBeGreaterThan(200);
  });
});
