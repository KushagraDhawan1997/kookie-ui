import * as React from 'react';
import { afterEach, describe, expect, it } from 'vitest';
import { page } from 'vitest/browser';
import { render } from '@testing-library/react';
import { Sheet, Theme } from '../../../src/components/index';

afterEach(async () => {
  await page.viewport(1280, 800);
});

function width(side: 'start' | 'end' | 'top', props: { width?: string } = {}) {
  render(
    <Theme>
      <Sheet.Root open>
        <Sheet.Content side={side} aria-describedby={undefined} {...props}>
          <Sheet.Title>Title</Sheet.Title>
        </Sheet.Content>
      </Sheet.Root>
    </Theme>,
  );
  return document.querySelector<HTMLElement>('.kui-SheetContent')!.getBoundingClientRect().width;
}

// On a phone a start or end sheet takes 90% of the window, leaving a strip of page to tap.
describe('Sheet width', () => {
  it('a start sheet is 90vw on a narrow window', async () => {
    await page.viewport(400, 800);
    expect(width('start')).toBeCloseTo(360, 0);
  });
  it('an end sheet is 90vw on a narrow window', async () => {
    await page.viewport(400, 800);
    expect(width('end')).toBeCloseTo(360, 0);
  });
  it('a top sheet still spans the window', async () => {
    await page.viewport(400, 800);
    expect(width('top')).toBeCloseTo(400, 0);
  });
  it('the width prop still wins', async () => {
    await page.viewport(400, 800);
    expect(width('start', { width: '200px' })).toBeCloseTo(200, 0);
  });
});
