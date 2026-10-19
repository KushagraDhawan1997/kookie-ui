import * as React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Sheet, Theme } from '../../../src/components/index';

// With motion gone nothing fades a sheet's content in, so nothing may start it at opacity 0.
describe('an open Sheet shows its content', () => {
  it('direct children of Sheet.Content are opaque', async () => {
    render(
      <Theme>
        <Sheet.Root open>
          <Sheet.Content aria-describedby={undefined}>
            <Sheet.Title>Filters</Sheet.Title>
          </Sheet.Content>
        </Sheet.Root>
      </Theme>,
    );
    const title = await screen.findByText('Filters');
    expect(getComputedStyle(title).opacity).toBe('1');
  });
});
