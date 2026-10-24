import * as React from 'react';
import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Popover, Theme } from '../../../src/components/index';

// Type-only check: the toolbar parts' props are exported like every other part.
const toolbarProps: Popover.ToolbarProps = { title: 'x' };
const sectionProps: Popover.ToolbarSectionProps = { title: 'x' };
const titleProps: Popover.ToolbarTitleProps = { title: 'x' };
void [toolbarProps, sectionProps, titleProps];

describe('Popover parts', () => {
  it('Anchor renders its children', () => {
    render(
      <Theme>
        <Popover.Root>
          <Popover.Anchor>
            <span data-testid="anchored">anchor child</span>
          </Popover.Anchor>
          <Popover.Trigger>
            <button>Open</button>
          </Popover.Trigger>
        </Popover.Root>
      </Theme>,
    );
    expect(screen.getByTestId('anchored')).toBeTruthy();
  });

  it('Anchor with asChild uses its child as the anchor', () => {
    render(
      <Theme>
        <Popover.Root>
          <Popover.Anchor asChild>
            <input data-testid="field" />
          </Popover.Anchor>
        </Popover.Root>
      </Theme>,
    );
    expect(screen.getByTestId('field').tagName).toBe('INPUT');
  });

  it("keeps the caller's aria-labelledby when there is no toolbar title", () => {
    render(
      <Theme>
        <span id="mine">Filters</span>
        <Popover.Root open>
          <Popover.Content aria-labelledby="mine">Body</Popover.Content>
        </Popover.Root>
      </Theme>,
    );
    expect(screen.getByRole('dialog').getAttribute('aria-labelledby')).toBe('mine');
  });

  it('a toolbar title names the panel', () => {
    render(
      <Theme>
        <Popover.Root open>
          <Popover.Content aria-labelledby="mine">
            <Popover.Toolbar>
              <Popover.Toolbar.Title id="toolbar-title">Share</Popover.Toolbar.Title>
            </Popover.Toolbar>
          </Popover.Content>
        </Popover.Root>
      </Theme>,
    );
    expect(screen.getByRole('dialog').getAttribute('aria-labelledby')).toBe('toolbar-title');
  });

  it('Toolbar has a display name', () => {
    expect(Popover.Toolbar.displayName).toBe('Popover.Toolbar');
  });
});
