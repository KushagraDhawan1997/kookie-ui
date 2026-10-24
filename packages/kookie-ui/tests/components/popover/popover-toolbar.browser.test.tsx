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

  it('keeps each section in its own column when the others are left out', async () => {
    render(
      <Theme>
        <Popover.Root open>
          <Popover.Trigger>
            <button>Open</button>
          </Popover.Trigger>
          <Popover.Content width="300px">
            <Popover.Toolbar data-testid="right-only">
              <Popover.Toolbar.Right>
                <button data-testid="right">Done</button>
              </Popover.Toolbar.Right>
            </Popover.Toolbar>
            <Popover.Toolbar>
              <Popover.Toolbar.Center>
                <span>Title</span>
              </Popover.Toolbar.Center>
              <Popover.Toolbar.Left>
                <button data-testid="left">Back</button>
              </Popover.Toolbar.Left>
            </Popover.Toolbar>
          </Popover.Content>
        </Popover.Root>
      </Theme>,
    );
    await frame();
    const right = document.querySelector<HTMLElement>('[data-testid="right"]')!.parentElement!;
    const left = document.querySelector<HTMLElement>('[data-testid="left"]')!.parentElement!;
    // A lone Right sits in the third column, flush with the toolbar's end edge.
    expect(getComputedStyle(right).gridColumnStart).toBe('3');
    const toolbar = right.closest<HTMLElement>('.kui-PopoverToolbar')!;
    const padEnd = parseFloat(getComputedStyle(toolbar).paddingRight);
    expect(right.getBoundingClientRect().right).toBeCloseTo(toolbar.getBoundingClientRect().right - padEnd, 0);
    // Left stays in the first column even when written after Center.
    expect(getComputedStyle(left).gridColumnStart).toBe('1');
    // ...and on the same row as Center, not wrapped below it.
    const center = left.parentElement!.querySelector<HTMLElement>('.kui-PopoverToolbarCenter')!;
    const mid = (el: HTMLElement) => (el.getBoundingClientRect().top + el.getBoundingClientRect().bottom) / 2;
    expect(mid(left)).toBeCloseTo(mid(center), 0);
  });
});
