import * as React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Heading, Kbd, Text, Theme } from '../../../src/components/index';

const px = (el: Element) => parseFloat(getComputedStyle(el).fontSize);

describe('Kbd without a size', () => {
  it('follows the text around it', () => {
    render(
      <Theme>
        <Heading size="8">
          Press <Kbd data-testid="big">K</Kbd>
        </Heading>
        <Text size="2">
          Press <Kbd data-testid="body">K</Kbd>
        </Text>
      </Theme>,
    );
    const big = screen.getByTestId('big');
    expect(px(big)).toBeCloseTo(px(big.parentElement!) * 0.85, 1);
    expect(px(big)).toBeGreaterThan(30);
  });

  it('matches the size-1 box in 14px text', () => {
    render(
      <Theme>
        <Text size="2">
          Press <Kbd data-testid="unsized">K</Kbd> or <Kbd size="1" data-testid="sized">K</Kbd>
        </Text>
      </Theme>,
    );
    const unsized = screen.getByTestId('unsized').getBoundingClientRect();
    const sized = screen.getByTestId('sized').getBoundingClientRect();
    expect(Math.abs(unsized.height - sized.height)).toBeLessThan(0.5);
    expect(Math.abs(unsized.width - sized.width)).toBeLessThan(0.5);
  });
});
