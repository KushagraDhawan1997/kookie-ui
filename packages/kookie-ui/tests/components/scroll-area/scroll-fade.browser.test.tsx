import * as React from 'react';
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { MessageScroller, ScrollArea, Theme } from '../../../src/components/index';

const frames = () => new Promise((r) => requestAnimationFrame(() => requestAnimationFrame(() => r(null))));
const rows = Array.from({ length: 40 }, (_, i) => <div key={i} style={{ height: 30 }}>Row {i}</div>);
const vars = (el: HTMLElement) => ({
  start: el.style.getPropertyValue('--scroll-overflow-start'),
  end: el.style.getPropertyValue('--scroll-overflow-end'),
});

describe('scroll fade in a browser', () => {
  it('ScrollArea publishes what is hidden past each edge, and masks only with fade', async () => {
    render(
      <Theme>
        <ScrollArea fade style={{ height: 200 }} data-testid="faded">{rows}</ScrollArea>
        <ScrollArea style={{ height: 200 }}>{rows}</ScrollArea>
      </Theme>,
    );
    const [faded, plain] = Array.from(document.querySelectorAll<HTMLElement>('.kui-ScrollAreaViewport'));
    await frames();
    expect(vars(faded!).start).toBe('0px');
    expect(parseFloat(vars(faded!).end)).toBeGreaterThan(900);
    expect(getComputedStyle(faded!).maskImage).toContain('linear-gradient');
    expect(getComputedStyle(plain!).maskImage).toBe('none');
    expect(vars(plain!).start).toBe('');

    faded!.scrollTop = 300;
    faded!.dispatchEvent(new Event('scroll'));
    await frames();
    expect(vars(faded!).start).toBe('300px');
  });

  it('a vertical ScrollArea ignores wide content on the hidden axis', async () => {
    render(
      <Theme>
        <div style={{ width: 200 }}>
          <ScrollArea fade scrollbars="vertical" style={{ height: 300 }}>
            <div style={{ whiteSpace: 'nowrap' }}>{'A long line that runs well past the edge of the box '.repeat(3)}</div>
          </ScrollArea>
        </div>
      </Theme>,
    );
    const viewport = document.querySelector<HTMLElement>('.kui-ScrollAreaViewport')!;
    await frames();
    expect(getComputedStyle(viewport).overflowX).toBe('hidden');
    expect(viewport.scrollWidth).toBeGreaterThan(viewport.clientWidth);
    expect(viewport.style.getPropertyValue('--scroll-overflow-x-end')).toBe('0px');
    expect(viewport.hasAttribute('tabindex')).toBe(false);
  });

  it('MessageScroller fades by default, and a band can set its reach', async () => {
    render(
      <Theme>
        <MessageScroller.Root style={{ height: 200, ['--scroll-fade-start' as string]: '80px' }}>
          <MessageScroller.Viewport aria-label="Conversation">
            <MessageScroller.Content>{rows}</MessageScroller.Content>
          </MessageScroller.Viewport>
        </MessageScroller.Root>
      </Theme>,
    );
    const viewport = document.querySelector<HTMLElement>('.kui-MessageScrollerViewport')!;
    await frames();
    await frames();
    expect(viewport.hasAttribute('data-fade')).toBe(true);
    expect(getComputedStyle(viewport).maskImage).toContain('linear-gradient');
    expect(getComputedStyle(viewport).getPropertyValue('--scroll-fade-start').trim()).toBe('80px');
  });

  it('a nested scroller does not take its ancestor band’s reach', () => {
    render(
      <Theme>
        <ScrollArea fade style={{ height: 300, ['--scroll-fade-start' as string]: '80px' }}>
          <ScrollArea fade style={{ height: 100 }}>{rows}</ScrollArea>
        </ScrollArea>
      </Theme>,
    );
    const inner = document.querySelectorAll<HTMLElement>('.kui-ScrollAreaViewport')[1]!;
    expect(getComputedStyle(inner).getPropertyValue('--scroll-fade-start').trim()).toBe('');
  });

  it('keeps the edge values on the viewport, so a scroll frame does not restyle every row', async () => {
    render(
      <Theme>
        <ScrollArea fade style={{ height: 200 }}>{rows}</ScrollArea>
      </Theme>,
    );
    const viewport = document.querySelector<HTMLElement>('.kui-ScrollAreaViewport')!;
    viewport.scrollTop = 300;
    viewport.dispatchEvent(new Event('scroll'));
    await frames();
    expect(getComputedStyle(viewport).getPropertyValue('--scroll-overflow-start').trim()).toBe('300px');
    const row = viewport.querySelector<HTMLElement>('div div')!;
    expect(getComputedStyle(row).getPropertyValue('--scroll-overflow-start').trim()).toBe('0px');
    expect(getComputedStyle(row).getPropertyValue('--scroll-overflow-end').trim()).toBe('0px');
  });
});
