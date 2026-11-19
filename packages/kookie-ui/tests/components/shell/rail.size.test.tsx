import * as React from 'react';
import * as ReactDOM from 'react-dom';
import { describe, it, expect } from 'vitest';
import { renderWithProviders } from '../../test-utils';
import { Shell, Sidebar } from '../../../src/components/index';

const railContent = () => document.querySelector('.kui-ShellRailContent')!;

function Row() {
  return (
    <Shell.Scroll>
      <Sidebar.Menu>
        <Sidebar.MenuItem>
          <Sidebar.MenuButton>
            <svg aria-hidden />
            Shapes
          </Sidebar.MenuButton>
        </Sidebar.MenuItem>
      </Sidebar.Menu>
    </Shell.Scroll>
  );
}

describe('Shell.Rail size', () => {
  it.each([
    ['1', '2'],
    ['2', '3'],
    ['3', '3'],
  ] as const)('a size %s Shell gives its rail size %s, one step above', (shell, rail) => {
    renderWithProviders(
      <Shell.Root size={shell}>
        <Shell.Rail>
          <Row />
        </Shell.Rail>
        <Shell.Content>content</Shell.Content>
      </Shell.Root>,
    );
    expect(railContent()).toHaveClass(`kui-r-size-${rail}`);
    expect(document.querySelector('.kui-ShellRail .kui-SidebarContent')).toHaveClass(`kui-r-size-${rail}`);
  });

  it('takes a size of its own', () => {
    renderWithProviders(
      <Shell.Root size="2">
        <Shell.Rail size="1">
          <Row />
        </Shell.Rail>
      </Shell.Root>,
    );
    expect(railContent()).toHaveClass('kui-r-size-1');
  });
});

describe('Shell.RailScope', () => {
  // Rows rendered in the content and portalled into the rail, as an app's editor rail is.
  function App({ scoped }: { scoped: boolean }) {
    const [target, setTarget] = React.useState<HTMLElement | null>(null);
    return (
      <Shell.Root size="2">
        <Shell.Rail>
          <div ref={setTarget} />
        </Shell.Rail>
        <Shell.Content>{target ? ReactDOM.createPortal(scoped ? <Shell.RailScope><Row /></Shell.RailScope> : <Row />, target) : null}</Shell.Content>
      </Shell.Root>
    );
  }

  it('gives portalled rows the rail look: an icon tile, at the rail size', () => {
    renderWithProviders(<App scoped />);
    expect(document.querySelector('.kui-SidebarMenuIconWrapper')).not.toBeNull();
    expect(document.querySelector('.kui-ShellRail .kui-SidebarContent')).toHaveClass('kui-r-size-3');
  });

  it('without it, portalled rows miss the rail look', () => {
    renderWithProviders(<App scoped={false} />);
    expect(document.querySelector('.kui-SidebarMenuIconWrapper')).toBeNull();
  });
});
