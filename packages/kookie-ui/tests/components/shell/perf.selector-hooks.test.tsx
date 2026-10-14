import * as React from 'react';
import { describe, it, expect } from 'vitest';
import { renderWithProviders, screen } from '../../test-utils';
import { fireEvent } from '@testing-library/react';
import { Shell } from '../../../src/components/index';

/**
 * Since 0.8.0 the Shell has one registry instead of eleven contexts. What
 * crosses the frame is a pane's own registry entry: a pane re-renders when
 * its own state changes, and a Trigger re-renders when the pane it names
 * changes. Nothing else does.
 *
 * Each part is wrapped in a Profiler, which renders no element, so every pane
 * is still a direct child of the Root's grid.
 */
type Renders = Record<string, number>;

function App({ renders }: { renders: Renders }) {
  const onRender = (id: string) => {
    renders[id] = (renders[id] ?? 0) + 1;
  };
  return (
    <Shell.Root>
      <Shell.Header>
        <React.Profiler id="trigger-panel" onRender={onRender}>
          <Shell.Trigger target="panel" peekOnHover>
            panel
          </Shell.Trigger>
        </React.Profiler>
        <React.Profiler id="trigger-inspector" onRender={onRender}>
          <Shell.Trigger target="inspector" peekOnHover>
            inspector
          </Shell.Trigger>
        </React.Profiler>
        <React.Profiler id="trigger-bottom" onRender={onRender}>
          <Shell.Trigger target="bottom">bottom</Shell.Trigger>
        </React.Profiler>
      </Shell.Header>
      <React.Profiler id="rail" onRender={onRender}>
        <Shell.Rail presentation="fixed">rail</Shell.Rail>
      </React.Profiler>
      <React.Profiler id="panel" onRender={onRender}>
        <Shell.Panel>panel content</Shell.Panel>
      </React.Profiler>
      <React.Profiler id="content" onRender={onRender}>
        <Shell.Content>content</Shell.Content>
      </React.Profiler>
      <React.Profiler id="inspector" onRender={onRender}>
        <Shell.Inspector presentation="fixed">inspector content</Shell.Inspector>
      </React.Profiler>
      <React.Profiler id="bottom" onRender={onRender}>
        <Shell.Bottom presentation="fixed">bottom content</Shell.Bottom>
      </React.Profiler>
    </Shell.Root>
  );
}

function snapshot(renders: Renders): Renders {
  return { ...renders };
}

function changed(before: Renders, after: Renders) {
  return Object.keys(after)
    .filter((id) => (after[id] ?? 0) !== (before[id] ?? 0))
    .sort();
}

describe('Shell registry render isolation', () => {
  it('opening the inspector re-renders the inspector and its trigger, nothing else', () => {
    const renders: Renders = {};
    renderWithProviders(<App renders={renders} />);
    const before = snapshot(renders);

    fireEvent.click(screen.getByRole('button', { name: 'inspector' }));

    expect(changed(before, renders)).toEqual(['inspector', 'trigger-inspector']);
  });

  it('opening the panel re-renders the panel and its trigger, nothing else', () => {
    const renders: Renders = {};
    renderWithProviders(<App renders={renders} />);
    const before = snapshot(renders);

    fireEvent.click(screen.getByRole('button', { name: 'panel' }));

    expect(changed(before, renders)).toEqual(['panel', 'trigger-panel']);
  });

  it('a peek re-renders only the pane being previewed', () => {
    const renders: Renders = {};
    renderWithProviders(<App renders={renders} />);
    const before = snapshot(renders);

    fireEvent.mouseEnter(screen.getByRole('button', { name: 'inspector' }));
    fireEvent.mouseLeave(screen.getByRole('button', { name: 'inspector' }));

    expect(changed(before, renders)).toEqual(['inspector']);
  });

  it('the content never re-renders for a pane change', () => {
    const renders: Renders = {};
    renderWithProviders(<App renders={renders} />);
    const before = renders.content;

    fireEvent.click(screen.getByRole('button', { name: 'inspector' }));
    fireEvent.click(screen.getByRole('button', { name: 'panel' }));
    fireEvent.click(screen.getByRole('button', { name: 'bottom' }));

    expect(renders.content).toBe(before);
  });
});
