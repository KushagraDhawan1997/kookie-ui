import * as React from 'react';
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { Avatar, Chip, Progress, ScrollArea, Separator, Spinner, Theme } from '../../../src/components/index';

const px = (el: Element, prop: string) => parseFloat(getComputedStyle(el).getPropertyValue(prop));

describe('sizeless primitives keep the old default look', () => {
  it('spinner 16, separator fills its container, progress at size-2 height, scrollbar 4', () => {
    const { container } = render(
      <Theme>
        <Spinner />
        <div style={{ width: 120 }}>
          <Separator />
        </div>
        <div style={{ height: 60, display: 'flex' }}>
          <Separator orientation="vertical" />
        </div>
        <Progress value={50} />
        <ScrollArea type="always" style={{ height: 40, width: 40 }}>
          <div style={{ height: 200, width: 200 }} />
        </ScrollArea>
      </Theme>,
    );
    const spinner = container.querySelector('.kui-Spinner')!.getBoundingClientRect();
    expect([spinner.width, spinner.height]).toEqual([16, 16]);
    const [h, v] = container.querySelectorAll('.kui-Separator');
    expect(h.getBoundingClientRect().width).toBe(120);
    expect(v.getBoundingClientRect().height).toBe(60);
    const progress = container.querySelector('.kui-ProgressRoot')!;
    expect(progress.getBoundingClientRect().height).toBeGreaterThan(0);
    expect(progress.getBoundingClientRect().height).toBe(6);
    const bar = container.querySelector('.kui-ScrollAreaScrollbar[data-orientation="vertical"]')!;
    expect(bar.getBoundingClientRect().width).toBe(4);
  });
});

describe('chip ladder', () => {
  it('rests at size 2 and every padding and gap sits on 2/4/8/12', () => {
    const { container } = render(
      <Theme>
        {(['1', '2', '3', '4'] as const).flatMap((size) =>
          (['soft', 'ghost'] as const).map((variant) => (
            <Chip key={size + variant} size={size} variant={variant}>
              Label
            </Chip>
          )),
        )}
        <Chip>Rest</Chip>
      </Theme>,
    );
    const chips = [...container.querySelectorAll('.kui-Chip')];
    const palette = [2, 4, 8, 12];
    for (const b of chips) {
      for (const p of ['padding-top', 'padding-left', 'column-gap']) expect(palette).toContain(px(b, p));
    }
    const rest = chips.at(-1)!;
    expect(rest.className).toContain('kui-r-size-2');
    expect([px(rest, 'padding-top'), px(rest, 'padding-left'), px(rest, 'column-gap')]).toEqual([4, 8, 4]);
  });

  it('disabled is a remap: default cursor, still hit-tests', () => {
    const { container } = render(
      <Theme>
        <Chip variant="soft" data-disabled="">
          Off
        </Chip>
      </Theme>,
    );
    const b = container.querySelector('.kui-Chip')!;
    expect(getComputedStyle(b).cursor).toBe('default');
    expect(getComputedStyle(b).pointerEvents).not.toBe('none');
    expect(getComputedStyle(b).opacity).toBe('1');
  });
});

describe('avatar ladder', () => {
  it('follows v2: 28/32/40/48/56/64/80/96/128, default 40', () => {
    const sizes = ['1', '2', '3', '4', '5', '6', '7', '8', '9'] as const;
    const { container } = render(
      <Theme>
        {sizes.map((s) => (
          <Avatar key={s} size={s} fallback="A" />
        ))}
        <Avatar fallback="B" />
      </Theme>,
    );
    const boxes = [...container.querySelectorAll('.kui-AvatarRoot')].map((el) => el.getBoundingClientRect());
    expect(boxes.map((b) => b.height)).toEqual([28, 32, 40, 48, 56, 64, 80, 96, 128, 40]);
    expect(boxes.map((b) => b.width)).toEqual([28, 32, 40, 48, 56, 64, 80, 96, 128, 40]);
  });
});
