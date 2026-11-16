import * as React from 'react';
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render } from '@testing-library/react';
import { Shell, Sidebar, Theme } from '../../../src/components/index';

afterEach(cleanup);

function App({ radius, size }: { radius: 'full' | 'medium'; size: '1' | '2' | '3' }) {
  return (
    <Theme radius={radius}>
      <Shell.Root size="2" height="400px">
        <Shell.Rail size={size}>
          <Shell.Scroll>
            <Sidebar.Menu>
              <Sidebar.MenuItem>
                <Sidebar.MenuButton isActive>
                  <svg viewBox="0 0 24 24" aria-hidden />
                  Shapes
                </Sidebar.MenuButton>
              </Sidebar.MenuItem>
            </Sidebar.Menu>
          </Shell.Scroll>
        </Shell.Rail>
        <Shell.Content>content</Shell.Content>
      </Shell.Root>
    </Theme>
  );
}

const tile = () => document.querySelector<HTMLElement>('.kui-SidebarMenuIconWrapper')!;

describe('Rail tile', () => {
  for (const size of ['1', '2', '3'] as const) {
    it(`size ${size}: a circle at radius full`, () => {
      render(<App radius="full" size={size} />);
      const { width, height } = tile().getBoundingClientRect();
      expect(width).toBeCloseTo(height, 0);
      expect(parseFloat(getComputedStyle(tile()).borderTopLeftRadius)).toBeGreaterThanOrEqual(width / 2);
    });
  }

  it('keeps the control corner under a smaller theme radius', () => {
    render(<App radius="medium" size="3" />);
    const { width } = tile().getBoundingClientRect();
    expect(parseFloat(getComputedStyle(tile()).borderTopLeftRadius)).toBeLessThan(width / 2);
  });
});
