import * as React from 'react';
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { Button, Select, Tabs, TextField, Theme } from '../../../src/components/index';

// Size N is one height on every control that offers it.
describe('one control height per size', () => {
  for (const size of ['1', '2', '3', '4'] as const) {
    it(`size ${size}`, () => {
      const { container } = render(
        <Theme>
          <Button size={size}>Button</Button>
          <TextField.Root size={size} aria-label="Field" />
          <Select.Root size={size} defaultValue="a">
            <Select.Trigger aria-label="Select" />
            <Select.Content>
              <Select.Item value="a">A</Select.Item>
            </Select.Content>
          </Select.Root>
          <Tabs.Root defaultValue="a">
            <Tabs.List size={size}>
              <Tabs.Trigger value="a">Tab</Tabs.Trigger>
            </Tabs.List>
          </Tabs.Root>
        </Theme>,
      );
      const heights = ['.rt-Button', '.rt-TextFieldRoot', '.rt-SelectTrigger', '.rt-BaseTabListTrigger'].map(
        (selector) => container.querySelector<HTMLElement>(selector)!.getBoundingClientRect().height,
      );
      expect(new Set(heights).size, `heights ${heights.join(', ')}`).toBe(1);
    });
  }
});
