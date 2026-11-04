import * as React from 'react';
import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import { userEvent } from 'vitest/browser';
import { Button, TextField, Theme } from '../../src/components/index';

// TextFieldRoot has `contain: paint`, which clips at its border box. A focused button in a slot
// must draw its whole ring inside that box at every size.
describe('a Button hosted in a TextField slot', () => {
  for (const size of ['1', '2', '3', '4'] as const) {
    it(`keeps its focus ring inside the field at size ${size}`, async () => {
      const { container } = render(
        <Theme>
          <TextField.Root size={size} aria-label="query">
            <TextField.Slot side="right">
              <Button iconOnly variant="ghost" aria-label="Clear">
                x
              </Button>
            </TextField.Slot>
          </TextField.Root>
        </Theme>,
      );
      const root = container.querySelector<HTMLElement>('.kui-TextFieldRoot')!;
      const button = root.querySelector<HTMLElement>('button')!;
      await userEvent.tab();
      await userEvent.tab();
      expect(document.activeElement).toBe(button);
      expect(button.matches(':focus-visible')).toBe(true);

      const style = getComputedStyle(button);
      const width = parseFloat(style.outlineWidth);
      expect(width).toBeGreaterThan(0);
      const reach = parseFloat(style.outlineOffset) + width;
      const r = root.getBoundingClientRect();
      const b = button.getBoundingClientRect();
      expect(b.top - reach).toBeGreaterThanOrEqual(r.top);
      expect(b.bottom + reach).toBeLessThanOrEqual(r.bottom);
      expect(b.right + reach).toBeLessThanOrEqual(r.right);
    });
  }
});
