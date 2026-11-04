import * as React from 'react';
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { Tabs, Theme } from '../../../src/components/index';

describe('vertical Tabs', () => {
  it('stacks the tabs in a column beside the panel, with the active line on the inline end', () => {
    const { container } = render(
      <Theme>
        <Tabs.Root defaultValue="a" orientation="vertical">
          <Tabs.List>
            <Tabs.Trigger value="a">Overview</Tabs.Trigger>
            <Tabs.Trigger value="b">Activity</Tabs.Trigger>
          </Tabs.List>
          <Tabs.Content value="a">Panel A</Tabs.Content>
        </Tabs.Root>
      </Theme>,
    );
    const root = container.querySelector<HTMLElement>('.kui-TabsRoot')!;
    const list = container.querySelector<HTMLElement>('.kui-TabsList')!;
    const [first, second] = container.querySelectorAll<HTMLElement>('.kui-TabsTrigger');
    const panel = container.querySelector<HTMLElement>('.kui-TabsContent')!;

    expect(getComputedStyle(root).display).toBe('flex');
    expect(getComputedStyle(list).flexDirection).toBe('column');
    // The second tab sits under the first, not beside it.
    expect(second.getBoundingClientRect().top).toBeGreaterThanOrEqual(first.getBoundingClientRect().bottom);
    // The panel sits beside the list.
    expect(panel.getBoundingClientRect().left).toBeGreaterThanOrEqual(list.getBoundingClientRect().right);

    const line = getComputedStyle(first, '::before');
    const ring = parseFloat(line.width);
    expect(ring).toBeGreaterThan(0);
    expect(ring).toBeLessThan(5);
    expect(parseFloat(line.height)).toBeCloseTo(first.getBoundingClientRect().height, 0);
    expect(line.right).toBe('0px');
  });

  it('leaves a horizontal list as a row', () => {
    const { container } = render(
      <Theme>
        <Tabs.Root defaultValue="a">
          <Tabs.List>
            <Tabs.Trigger value="a">Overview</Tabs.Trigger>
          </Tabs.List>
        </Tabs.Root>
      </Theme>,
    );
    const root = container.querySelector<HTMLElement>('.kui-TabsRoot')!;
    const list = container.querySelector<HTMLElement>('.kui-TabsList')!;
    expect(getComputedStyle(root).display).toBe('block');
    expect(getComputedStyle(list).flexDirection).toBe('row');
  });
});
