import * as React from 'react';
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { ScrollArea, Theme } from '../../../src/components/index';

const frames = () => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(() => r(null))));
const rows = Array.from({ length: 40 }, (_, i) => <div key={i} style={{ height: 30 }}>Row {i}</div>);
const wide = <div style={{ width: 2000, height: 20 }}>Wide</div>;
const viewports = () => Array.from(document.querySelectorAll<HTMLElement>('.kui-ScrollAreaViewport'));

describe('ScrollArea', () => {
  it('passes dir to the scroll area', () => {
    render(
      <Theme>
        <ScrollArea dir="rtl" style={{ height: 100 }}>{rows}</ScrollArea>
      </Theme>,
    );
    expect(document.querySelector('.kui-ScrollAreaRoot')).toHaveAttribute('dir', 'rtl');
  });

  it('takes width and height props', () => {
    render(
      <Theme>
        <div style={{ height: 600 }}>
          <ScrollArea width="200px" height="120px">{rows}</ScrollArea>
        </div>
      </Theme>,
    );
    const root = document.querySelector<HTMLElement>('.kui-ScrollAreaRoot')!;
    const box = root.getBoundingClientRect();
    expect([box.width, box.height]).toEqual([200, 120]);
  });

  it('fades horizontally too, from the inline start', async () => {
    render(
      <Theme>
        <ScrollArea fade style={{ width: 200, height: 60 }}>{wide}</ScrollArea>
        <ScrollArea fade dir="rtl" style={{ width: 200, height: 60 }}>{wide}</ScrollArea>
      </Theme>,
    );
    const [ltr, rtl] = viewports();
    await frames();
    expect(ltr!.style.getPropertyValue('--scroll-overflow-x-start')).toBe('0px');
    expect(parseFloat(ltr!.style.getPropertyValue('--scroll-overflow-x-end'))).toBeGreaterThan(1000);
    expect(getComputedStyle(ltr!).maskImage).toContain('to right');
    expect(getComputedStyle(rtl!).maskImage).toContain('to left');

    rtl!.scrollLeft = -300;
    rtl!.dispatchEvent(new Event('scroll'));
    await frames();
    expect(rtl!.style.getPropertyValue('--scroll-overflow-x-start')).toBe('300px');
  });

  it('is reachable by keyboard while it has something to scroll', async () => {
    render(
      <Theme>
        <ScrollArea style={{ height: 100 }}>{rows}</ScrollArea>
        <ScrollArea style={{ height: 100 }}>
          <div>Short</div>
        </ScrollArea>
        <ScrollArea style={{ height: 100 }} tabIndex={-1}>
          {rows}
        </ScrollArea>
        <div role="menu">
          <ScrollArea style={{ height: 100 }}>{rows}</ScrollArea>
        </div>
      </Theme>,
    );
    await frames();
    const [scrolling, short, own, inMenu] = viewports();
    expect(scrolling).toHaveAttribute('tabindex', '0');
    expect(short).not.toHaveAttribute('tabindex');
    expect(own).toHaveAttribute('tabindex', '-1');
    expect(inMenu).not.toHaveAttribute('tabindex');
  });

  it('is a region when it is named', () => {
    render(
      <Theme>
        <ScrollArea aria-label="Activity" style={{ height: 100 }}>{rows}</ScrollArea>
        <ScrollArea style={{ height: 100 }}>{rows}</ScrollArea>
      </Theme>,
    );
    const [named, plain] = viewports();
    expect(named).toHaveAttribute('role', 'region');
    expect(plain).not.toHaveAttribute('role');
  });
});

describe('ScrollArea overscroll', () => {
  it('contains horizontal overscroll when it has a horizontal scrollbar', async () => {
    render(
      <Theme>
        <ScrollArea type="always" scrollbars="horizontal" style={{ width: 200, height: 60 }}>
          {wide}
        </ScrollArea>
        <ScrollArea type="always" scrollbars="vertical" style={{ width: 200, height: 60 }}>
          {rows}
        </ScrollArea>
      </Theme>,
    );
    await frames();
    const [h, v] = viewports();
    expect(document.querySelector('.kui-ScrollAreaScrollbar[data-orientation="horizontal"]')).not.toBeNull();
    expect(getComputedStyle(h).overscrollBehaviorX).toBe('contain');
    expect(getComputedStyle(v).overscrollBehaviorX).toBe('auto');
  });
});
