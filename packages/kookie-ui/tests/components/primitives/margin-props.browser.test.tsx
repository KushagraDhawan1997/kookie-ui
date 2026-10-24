import * as React from 'react';
import { afterEach, describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { page } from 'vitest/browser';
import { Box, Theme } from '../../../src/components/index';
import { getMarginStyles } from '../../../src/helpers/index';

const margin = (el: Element, side: 'top' | 'right' | 'bottom' | 'left') =>
  getComputedStyle(el).getPropertyValue(`margin-${side}`);

afterEach(async () => {
  await page.viewport(1280, 800);
});

describe('an arbitrary mx at the sm breakpoint', () => {
  it('applies between sm and md', async () => {
    await page.viewport(800, 800);
    expect(window.innerWidth).toBe(800);
    const { container } = render(
      <Theme>
        <Box data-testid="b" mx={{ initial: '0px', sm: '13px' }} />
      </Theme>,
    );
    const box = container.querySelector('[data-testid="b"]')!;
    expect(margin(box, 'left')).toBe('13px');
    expect(margin(box, 'right')).toBe('13px');
  });
});

describe('getMarginStyles', () => {
  function Styled(props: Parameters<typeof getMarginStyles>[0]) {
    const [className, style] = getMarginStyles(props);
    return <div data-testid="m" className={className} style={style} />;
  }

  it('applies an arbitrary m on every side', () => {
    const { container } = render(
      <Theme>
        <Styled m="13px" />
      </Theme>,
    );
    const el = container.querySelector('[data-testid="m"]')!;
    for (const side of ['top', 'right', 'bottom', 'left'] as const) expect(margin(el, side)).toBe('13px');
  });

  it('applies an arbitrary value at a breakpoint', () => {
    expect(window.innerWidth).toBeGreaterThanOrEqual(1024);
    const { container } = render(
      <Theme>
        <Styled mx={{ md: '13px' }} />
      </Theme>,
    );
    const el = container.querySelector('[data-testid="m"]')!;
    expect(margin(el, 'left')).toBe('13px');
    expect(margin(el, 'right')).toBe('13px');
  });

  it('still applies a scale value', () => {
    const { container } = render(
      <Theme>
        <Styled mt="3" />
      </Theme>,
    );
    expect(parseFloat(margin(container.querySelector('[data-testid="m"]')!, 'top'))).toBeGreaterThan(0);
  });
});
