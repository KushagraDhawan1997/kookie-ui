import * as React from 'react';
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { Tabs, Theme } from '../../../src/components/index';

describe('Tabs.Trigger sizing', () => {
  it('a trigger with element children is as wide as its content', () => {
    const { container } = render(
      <Theme>
        <Tabs.Root defaultValue="a">
          <Tabs.List>
            <Tabs.Trigger value="a">
              <span>Account settings</span>
            </Tabs.Trigger>
            <Tabs.Trigger value="b">Account settings</Tabs.Trigger>
          </Tabs.List>
        </Tabs.Root>
      </Theme>,
    );
    const [elementTab, textTab] = container.querySelectorAll<HTMLElement>('.kui-TabsTrigger');
    const inner = elementTab.querySelector<HTMLElement>('.kui-TabsTriggerInner')!;
    expect(elementTab.getBoundingClientRect().width).toBeGreaterThanOrEqual(inner.getBoundingClientRect().width);
    expect(Math.abs(elementTab.getBoundingClientRect().width - textTab.getBoundingClientRect().width)).toBeLessThan(4);
  });
});
