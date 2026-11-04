import * as React from 'react';
import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import { Sheet, Theme } from '../../../src/components/index';

// A sheet is flush to one edge: the two corners on that edge are square, the two facing the
// page keep the overlay corner for the size (24px at size 2, radius="full").
function corners(side: 'start' | 'end' | 'top' | 'bottom', style?: React.CSSProperties) {
  render(
    <Theme radius="full">
      <Sheet.Root open>
        <Sheet.Content side={side} style={style} aria-describedby={undefined}>
          <Sheet.Title>Title</Sheet.Title>
        </Sheet.Content>
      </Sheet.Root>
    </Theme>,
  );
  const s = getComputedStyle(document.querySelector<HTMLElement>('.kui-SheetContent')!);
  return [
    parseFloat(s.borderTopLeftRadius),
    parseFloat(s.borderTopRightRadius),
    parseFloat(s.borderBottomRightRadius),
    parseFloat(s.borderBottomLeftRadius),
  ];
}

describe('Sheet corners', () => {
  it('start: square on the left, rounded on the right', () => {
    expect(corners('start')).toEqual([0, 24, 24, 0]);
  });
  it('end: square on the right, rounded on the left', () => {
    expect(corners('end')).toEqual([24, 0, 0, 24]);
  });
  it('top: square on top, rounded below', () => {
    expect(corners('top')).toEqual([0, 0, 24, 24]);
  });
  it('bottom: square below, rounded on top', () => {
    expect(corners('bottom')).toEqual([24, 24, 0, 0]);
  });
  it('a style radius from the caller wins', () => {
    expect(corners('start', { borderRadius: '4px' })).toEqual([4, 4, 4, 4]);
  });
});
