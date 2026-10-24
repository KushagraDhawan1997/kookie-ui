import * as React from 'react';
import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import { Sheet, Theme } from '../../../src/components/index';

describe('Sheet align', () => {
  it('does not leak align to the DOM', () => {
    render(
      <Theme>
        <Sheet.Root open>
          <Sheet.Content align="start" aria-describedby={undefined}>
            <Sheet.Title>Panel</Sheet.Title>
          </Sheet.Content>
        </Sheet.Root>
      </Theme>,
    );
    expect(document.querySelector('.kui-SheetContent')!.hasAttribute('align')).toBe(false);
  });
});
