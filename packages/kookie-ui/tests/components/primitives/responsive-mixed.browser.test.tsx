import * as React from 'react';
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { Box, Theme } from '../../../src/components/index';

// A responsive value that starts as a custom length and switches to a token at a breakpoint must switch.
describe('a mixed responsive layout value follows its breakpoints', () => {
  it('padding and margin take the token from xs up', () => {
    expect(window.innerWidth).toBeGreaterThanOrEqual(520);
    const { container } = render(
      <Theme>
        <Box data-testid="b" p={{ initial: '13px', xs: '6' }} m={{ initial: '13px', xs: '6' }} />
      </Theme>,
    );
    const box = container.querySelector<HTMLElement>('[data-testid="b"]')!;
    expect(getComputedStyle(box).paddingTop).not.toBe('13px');
    expect(getComputedStyle(box).marginTop).not.toBe('13px');
  });
});
