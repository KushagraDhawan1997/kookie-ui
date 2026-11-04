import * as React from 'react';
import { describe, it, expect, vi } from 'vitest';
import { render, act } from '@testing-library/react';
import { userEvent } from 'vitest/browser';
import { MessageScroller, Theme } from '../../../src/components/index';

const settle = () => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(() => setTimeout(resolve, 50))));

async function until(check: () => boolean, timeout = 2000) {
  const start = performance.now();
  while (!check()) {
    if (performance.now() - start > timeout) throw new Error('timed out');
    await settle();
  }
}

function Transcript({ count }: { count: number }) {
  return (
    <Theme>
      <MessageScroller.Root style={{ height: 300, width: 400 }}>
        <MessageScroller.Viewport aria-label="Conversation">
          <MessageScroller.Content>
            {Array.from({ length: count }, (_, i) => (
              <MessageScroller.Item key={i} messageId={`m${i}`} style={{ height: 60 }}>
                Message {i}
              </MessageScroller.Item>
            ))}
          </MessageScroller.Content>
        </MessageScroller.Viewport>
        <MessageScroller.Button />
      </MessageScroller.Root>
    </Theme>
  );
}

const viewport = () => document.querySelector<HTMLElement>('.kui-MessageScrollerViewport')!;
const button = () => document.querySelector<HTMLElement>('.kui-MessageScrollerButton')!;
const distanceFromEnd = (el: HTMLElement) => el.scrollHeight - el.clientHeight - el.scrollTop;

describe('MessageScroller in a browser', () => {
  it('is the one scroller, and opens a long transcript at its end', async () => {
    render(<Transcript count={30} />);
    await until(() => viewport().scrollTop > 0);
    expect(getComputedStyle(viewport()).overflowY).toBe('auto');
    expect(viewport().scrollHeight).toBeGreaterThan(viewport().clientHeight);
    expect(distanceFromEnd(viewport())).toBeLessThan(2);
  });

  it('follows new messages while the reader is at the end', async () => {
    const { rerender } = render(<Transcript count={30} />);
    await until(() => distanceFromEnd(viewport()) < 2 && viewport().scrollTop > 0);
    rerender(<Transcript count={34} />);
    await until(() => distanceFromEnd(viewport()) < 2 && viewport().scrollHeight >= 34 * 60);
    expect(distanceFromEnd(viewport())).toBeLessThan(2);
  });

  it('leaves a reader who scrolled up alone, and wakes the jump button', async () => {
    const { rerender } = render(<Transcript count={30} />);
    await until(() => viewport().scrollTop > 0);
    const el = viewport();
    await act(async () => {
      el.dispatchEvent(new WheelEvent('wheel', { deltaY: -400, bubbles: true }));
      el.scrollTop = 200;
      el.dispatchEvent(new Event('scroll'));
    });
    await until(() => button().getAttribute('data-active') === 'true');
    expect(getComputedStyle(button()).opacity).toBe('1');
    expect(button().hasAttribute('inert')).toBe(false);

    rerender(<Transcript count={34} />);
    await settle();
    expect(el.scrollTop).toBe(200);
  });

  it('jumps back to the latest when the button is pressed', async () => {
    render(<Transcript count={30} />);
    await until(() => viewport().scrollTop > 0);
    const el = viewport();
    await act(async () => {
      el.dispatchEvent(new WheelEvent('wheel', { deltaY: -400, bubbles: true }));
      el.scrollTop = 0;
      el.dispatchEvent(new Event('scroll'));
    });
    await until(() => button().getAttribute('data-active') === 'true');
    await userEvent.click(button());
    await until(() => distanceFromEnd(el) < 2, 4000);
    await until(() => button().getAttribute('data-active') === 'false');
    expect(getComputedStyle(button()).opacity).toBe('0');
  });

  it('moves keyboard focus to the viewport when the button is pressed, not to the page', async () => {
    render(<Transcript count={30} />);
    await until(() => viewport().scrollTop > 0);
    const el = viewport();
    await act(async () => {
      el.dispatchEvent(new WheelEvent('wheel', { deltaY: -400, bubbles: true }));
      el.scrollTop = 0;
      el.dispatchEvent(new Event('scroll'));
    });
    await until(() => button().getAttribute('data-active') === 'true');
    button().focus();
    await userEvent.keyboard('{Enter}');
    expect(document.activeElement).toBe(el);
    await until(() => distanceFromEnd(el) < 2, 4000);
  });

  it('centres the jump button by its margins, not a transform', async () => {
    render(<Transcript count={30} />);
    await settle();
    const root = document.querySelector<HTMLElement>('.kui-MessageScrollerRoot')!.getBoundingClientRect();
    const b = button().getBoundingClientRect();
    expect(Math.abs(b.left + b.width / 2 - (root.left + root.width / 2))).toBeLessThan(1);
    expect(b.width).toBeCloseTo(b.height, 0);
    // One control wide, not stretched across the transcript by left and right 0.
    expect(b.width).toBeCloseTo(parseFloat(getComputedStyle(button()).minHeight), 0);
    expect(b.width).toBeLessThan(root.width / 2);
  });
});

describe('MessageScroller.Button default jump', () => {
  it('is instant, so it does not animate a long scroll', async () => {
    render(<Transcript count={60} />);
    await until(() => viewport().scrollTop > 0);
    const el = viewport();
    await act(async () => {
      el.dispatchEvent(new WheelEvent('wheel', { deltaY: -400, bubbles: true }));
      el.scrollTop = 0;
      el.dispatchEvent(new Event('scroll'));
    });
    await until(() => button().getAttribute('data-active') === 'true');
    const scrollTo = vi.spyOn(el, 'scrollTo');
    await act(async () => {
      button().click();
    });
    await until(() => distanceFromEnd(el) < 2, 4000);
    const behaviors = scrollTo.mock.calls.map((call) => (call[0] as ScrollToOptions | undefined)?.behavior);
    expect(behaviors).not.toContain('smooth');
    expect(distanceFromEnd(el)).toBeLessThan(2);
  });
});
