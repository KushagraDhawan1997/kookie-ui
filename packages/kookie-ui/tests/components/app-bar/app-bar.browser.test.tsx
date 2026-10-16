import * as React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { AppBar, Button, Theme } from '../../../src/components/index';

const rect = (el: Element) => el.getBoundingClientRect();

describe('AppBar (the band that was called Toolbar before 0.11.0)', () => {
  it('lays out Left / Center / Right with a truly centred title, and is not a role="toolbar"', () => {
    render(
      <Theme>
        <div style={{ position: 'relative', width: 600, height: 200 }}>
          <AppBar.Root data-testid="bar">
            <AppBar.Left>
              <Button>Back</Button>
            </AppBar.Left>
            <AppBar.Center>
              <AppBar.Title>Document</AppBar.Title>
            </AppBar.Center>
            <AppBar.Right>
              <Button>Share</Button>
            </AppBar.Right>
          </AppBar.Root>
        </div>
      </Theme>,
    );
    const bar = screen.getByTestId('bar');
    expect(bar.classList.contains('rt-AppBar')).toBe(true);
    expect(bar.getAttribute('data-anchor')).toBe('top');
    expect(screen.queryByRole('toolbar')).toBeNull();

    const back = rect(screen.getByRole('button', { name: 'Back' }));
    const title = rect(screen.getByText('Document'));
    const share = rect(screen.getByRole('button', { name: 'Share' }));
    expect(back.right).toBeLessThan(title.left);
    expect(title.right).toBeLessThan(share.left);
    const barBox = rect(bar);
    expect((title.left + title.right) / 2).toBeCloseTo((barBox.left + barBox.right) / 2, 0);
    expect(getComputedStyle(bar).position).toBe('absolute');
  });

  it('AppBar itself is the root, the same component as AppBar.Root', () => {
    expect(AppBar.Root).toBe(AppBar);
  });

  it('publishes its height to its parent, under the new name and the old one', async () => {
    render(
      <Theme>
        <div data-testid="parent" style={{ position: 'relative', width: 400, height: 200 }}>
          <AppBar data-testid="bar">
            <AppBar.Left>
              <Button>Back</Button>
            </AppBar.Left>
          </AppBar>
        </div>
      </Theme>,
    );
    const parent = screen.getByTestId('parent');
    const height = rect(screen.getByTestId('bar')).height;
    // offsetHeight is whole pixels, so compare within one.
    const published = (name: string) => parseFloat(parent.style.getPropertyValue(name));
    await waitFor(() => expect(Math.abs(published('--rt-app-bar-height') - height)).toBeLessThan(1));
    expect(parent.style.getPropertyValue('--rt-toolbar-height')).toBe(parent.style.getPropertyValue('--rt-app-bar-height'));
  });

  it('a side-anchored bar publishes its width instead and stacks its sections', async () => {
    render(
      <Theme>
        <div data-testid="parent" style={{ position: 'relative', width: 400, height: 300 }}>
          <AppBar anchor="left" data-testid="bar">
            <AppBar.Left>
              <Button>Top</Button>
            </AppBar.Left>
            <AppBar.Right>
              <Button>Bottom</Button>
            </AppBar.Right>
          </AppBar>
        </div>
      </Theme>,
    );
    const parent = screen.getByTestId('parent');
    const width = rect(screen.getByTestId('bar')).width;
    await waitFor(() => expect(Math.abs(parseFloat(parent.style.getPropertyValue('--rt-app-bar-width')) - width)).toBeLessThan(1));
    expect(parent.style.getPropertyValue('--rt-app-bar-height')).toBe('');
    expect(rect(screen.getByRole('button', { name: 'Bottom' })).top).toBeGreaterThan(
      rect(screen.getByRole('button', { name: 'Top' })).bottom,
    );
  });
});
