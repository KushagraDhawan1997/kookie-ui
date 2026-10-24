import * as React from 'react';
import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import { Sheet, Theme } from '../../../src/components/index';

describe('Sheet padding', () => {
  for (const side of ['start', 'end', 'top', 'bottom'] as const) {
    it(`${side} sheet keeps its bottom padding and no compositing hint`, () => {
      render(
        <Theme>
          <Sheet.Root open>
            <Sheet.Content side={side} aria-describedby={undefined}>
              <Sheet.Title>Panel</Sheet.Title>
            </Sheet.Content>
          </Sheet.Root>
        </Theme>,
      );
      const style = getComputedStyle(document.querySelector('.kui-SheetContent')!);
      expect(parseFloat(style.paddingBottom)).toBeGreaterThan(0);
      expect(style.paddingBottom).toBe(style.paddingTop);
      expect(style.willChange).toBe('auto');
    });
  }
});
