import * as React from 'react';
import { describe, it, expect, afterEach } from 'vitest';
import { cdp } from 'vitest/browser';
import { render } from '@testing-library/react';
import { Progress, Theme } from '../../../src/components/index';

const emulate = (features: { name: string; value: string }[]) =>
  cdp().send('Emulation.setEmulatedMedia', { features });

afterEach(async () => {
  await emulate([]);
});

describe('Progress in RTL', () => {
  it('fills from the right', () => {
    const { container } = render(
      <Theme>
        <div dir="rtl" style={{ width: 200 }}>
          <Progress value={25} />
        </div>
      </Theme>,
    );
    const root = container.querySelector<HTMLElement>('.kui-ProgressRoot')!.getBoundingClientRect();
    const fill = container.querySelector<HTMLElement>('.kui-ProgressIndicator')!.getBoundingClientRect();
    expect(Math.round(fill.right)).toBe(Math.round(root.right + 150));
    expect(Math.round(fill.left)).toBe(Math.round(root.left + 150));
  });
});

describe('Progress with reduced motion', () => {
  it('slows the indeterminate animation', async () => {
    await emulate([{ name: 'prefers-reduced-motion', value: 'reduce' }]);
    const { container } = render(
      <Theme>
        <Progress duration="2s" />
      </Theme>,
    );
    const fill = container.querySelector<HTMLElement>('.kui-ProgressIndicator')!;
    expect(getComputedStyle(fill).animationDuration).toBe('6s');
  });
});

describe('Progress in forced colors', () => {
  it('outlines the track and fills the bar with Highlight', async () => {
    await emulate([{ name: 'forced-colors', value: 'active' }]);
    const { container } = render(
      <Theme>
        <Progress value={50} />
      </Theme>,
    );
    const root = getComputedStyle(container.querySelector<HTMLElement>('.kui-ProgressRoot')!);
    const fill = getComputedStyle(container.querySelector<HTMLElement>('.kui-ProgressIndicator')!);
    expect(root.borderTopWidth).toBe('1px');
    expect(fill.backgroundColor).not.toBe(root.backgroundColor);
  });
});
