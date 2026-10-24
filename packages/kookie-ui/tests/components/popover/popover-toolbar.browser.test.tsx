import * as React from 'react';
import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import { Popover, Theme } from '../../../src/components/index';

const frame = () => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));

describe('Popover toolbar', () => {
  it('stays at the top of the panel while the content scrolls', async () => {
    render(
      <Theme>
        <Popover.Root open>
          <Popover.Trigger>
            <button>Open</button>
          </Popover.Trigger>
          <Popover.Content maxHeight="200px">
            <Popover.Toolbar>
              <Popover.Toolbar.Left>
                <Popover.Toolbar.Title>Share</Popover.Toolbar.Title>
              </Popover.Toolbar.Left>
            </Popover.Toolbar>
            <div data-testid="body" style={{ height: 1000 }}>
              Body
            </div>
          </Popover.Content>
        </Popover.Root>
      </Theme>,
    );
    await frame();
    const content = document.querySelector<HTMLElement>('.kui-PopoverContent')!;
    const toolbar = document.querySelector<HTMLElement>('.kui-PopoverToolbar')!;
    const body = document.querySelector<HTMLElement>('[data-testid="body"]')!;
    const offset = () => toolbar.getBoundingClientRect().top - content.getBoundingClientRect().top;

    // Pinned to the panel's top edge and spanning its full width.
    expect(offset()).toBe(0);
    expect(toolbar.getBoundingClientRect().width).toBeCloseTo(content.clientWidth, 0);
    // The content starts right below the toolbar.
    expect(body.getBoundingClientRect().top).toBeCloseTo(toolbar.getBoundingClientRect().bottom, 1);

    content.scrollTop = 300;
    await frame();
    expect(content.scrollTop).toBe(300);
    expect(offset()).toBe(0);
  });
});
