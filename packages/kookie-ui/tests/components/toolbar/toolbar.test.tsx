import * as React from 'react';
import { describe, expect, it } from 'vitest';
import { renderWithProviders } from '../../test-utils';
import { Shell, Toolbar, ToolbarButton } from '../../../src/components/index';

function Band({ size }: { size?: '1' | '2' | '3' | '4' }) {
  return (
    <Toolbar size={size} aria-label="Row">
      <ToolbarButton>Go</ToolbarButton>
    </Toolbar>
  );
}

describe('Toolbar size in a Shell', () => {
  for (const [shell, band] of [['1', '2'], ['2', '3'], ['3', '4']] as const) {
    it(`in Shell.Content of a size ${shell} Shell it rests at ${band}, like a pane header`, () => {
      const { container } = renderWithProviders(
        <Shell.Root size={shell}>
          <Shell.Sidebar>
            <Shell.PaneHeader>
              <Band />
            </Shell.PaneHeader>
          </Shell.Sidebar>
          <Shell.Content>
            <Band />
          </Shell.Content>
        </Shell.Root>,
      );
      expect(container.querySelector('.kui-ShellContent .kui-Toolbar')).toHaveClass(`kui-r-size-${band}`);
      expect(container.querySelector('.kui-ShellContent .kui-BaseButton')).toHaveClass(`kui-r-size-${band}`);
      expect(container.querySelector('.kui-ShellPaneHeader .kui-Toolbar')).toHaveClass(`kui-r-size-${band}`);
    });
  }

  it('keeps a size it states, and takes the Theme size outside a Shell', () => {
    const { container } = renderWithProviders(
      <>
        <Shell.Root size="2">
          <Shell.Content>
            <Band size="1" />
          </Shell.Content>
        </Shell.Root>
        <Band />
      </>,
    );
    const toolbars = container.querySelectorAll('.kui-Toolbar');
    expect(toolbars[0]).toHaveClass('kui-r-size-1');
    expect(toolbars[1]).toHaveClass('kui-r-size-2');
  });
});

describe('Toolbar layout props', () => {
  it('extracts padding, position and inset props into classes, not attributes', () => {
    const { getByRole } = renderWithProviders(
      <Toolbar aria-label="Row" px="4" py="2" position="absolute" inset="0">
        <ToolbarButton>Go</ToolbarButton>
      </Toolbar>,
    );
    const toolbar = getByRole('toolbar');
    expect(toolbar).toHaveClass('kui-r-px-4', 'kui-r-py-2', 'kui-r-position-absolute', 'kui-r-inset-0');
    for (const name of ['px', 'py', 'position', 'inset']) expect(toolbar.hasAttribute(name)).toBe(false);
  });

  it('turns no margin prop into a margin class', () => {
    const props = { m: '2', mt: '3' } as Record<string, string>;
    const { getByRole } = renderWithProviders(
      <Toolbar aria-label="Row" {...props}>
        <ToolbarButton>Go</ToolbarButton>
      </Toolbar>,
    );
    expect(getByRole('toolbar').className.split(' ').filter((name) => /^kui-r-m[xytrbl]?-/.test(name))).toEqual([]);
  });
});
