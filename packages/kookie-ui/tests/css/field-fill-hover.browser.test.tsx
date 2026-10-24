import * as React from 'react';
import { describe, expect, it } from 'vitest';
import { userEvent } from 'vitest/browser';
import { render } from '@testing-library/react';
import { Theme, TextField, TextArea, Select } from '../../src/components/index';

const bg = (el: Element) => getComputedStyle(el).backgroundColor;

// A raised field's hover moves its fill one step. In dark, --color-surface is neutral 2,
// so a hover fill of neutral 2 showed no change at all.
describe.each(['light', 'dark'] as const)('a raised field in %s', (appearance) => {
  it('changes its fill on hover', async () => {
    const { container } = render(
      <Theme appearance={appearance}>
        <div style={{ padding: 40, display: 'grid', gap: 16 }}>
          <TextField.Root placeholder="Name" />
          <TextArea placeholder="Notes" />
          <Select.Root defaultValue="a">
            <Select.Trigger aria-label="Pick" />
            <Select.Content>
              <Select.Item value="a">A</Select.Item>
            </Select.Content>
          </Select.Root>
        </div>
      </Theme>,
    );
    const fields = [
      container.querySelector('.kui-TextFieldRoot')!,
      container.querySelector('.kui-TextAreaRoot')!,
      container.querySelector('.kui-SelectTrigger')!,
    ];
    for (const field of fields) {
      const rest = bg(field);
      await userEvent.hover(field);
      expect(bg(field)).not.toBe(rest);
      await userEvent.unhover(field);
    }
  });
});
