import * as React from 'react';
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { Shell, Theme, Toolbar, ToolbarButton, ToolbarGroup } from '../../../src/components/index';

const frames = () => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => setTimeout(resolve, 100))));

function Frame({ float }: { float?: boolean }) {
  return (
    <Theme>
      <Shell.Root height="400px">
        <Shell.Sidebar defaultState="expanded" defaultSize={300} presentation="fixed">
          <Shell.PaneHeader float={float}>
            <Toolbar aria-label="Pane">
              <ToolbarGroup data-testid="lead">
                <ToolbarButton>Layers</ToolbarButton>
              </ToolbarGroup>
              <ToolbarGroup data-testid="trail">
                <ToolbarButton>Search</ToolbarButton>
              </ToolbarGroup>
            </Toolbar>
          </Shell.PaneHeader>
          <Shell.Scroll>
            <button type="button" data-testid="under" style={{ width: '100%', height: 200 }}>
              Under
            </button>
          </Shell.Scroll>
        </Shell.Sidebar>
        <Shell.Content>Canvas</Shell.Content>
      </Shell.Root>
    </Theme>
  );
}

describe('a Toolbar in Shell.PaneHeader', () => {
  it('fills the header, so its two groups sit at the two ends', async () => {
    const { getByTestId, container } = render(<Frame />);
    await frames();
    const header = container.querySelector('.kui-ShellPaneHeader')!.getBoundingClientRect();
    const pad = parseFloat(getComputedStyle(container.querySelector('.kui-ShellPaneHeader')!).paddingRight);
    const lead = getByTestId('lead').getBoundingClientRect();
    const trail = getByTestId('trail').getBoundingClientRect();
    expect(trail.right).toBeCloseTo(header.right - pad, 0);
    expect(trail.left - lead.right).toBeGreaterThan(50);
  });

  it('lets a click in the empty middle of a floating bar reach the content below', async () => {
    const { getByTestId } = render(<Frame float />);
    await frames();
    const lead = getByTestId('lead').getBoundingClientRect();
    const trail = getByTestId('trail').getBoundingClientRect();
    const x = (lead.right + trail.left) / 2;
    const y = lead.top + lead.height / 2;
    const hit = document.elementFromPoint(x, y);
    // The click passes the bar and lands on the pane's scroller underneath it.
    expect(hit?.closest('.kui-ShellPaneHeader')).toBeNull();
    expect(hit?.closest('.kui-ShellSidebar')).not.toBeNull();
    const onTrail = document.elementFromPoint(trail.left + trail.width / 2, y);
    expect(getByTestId('trail').contains(onTrail)).toBe(true);
  });
});
