import * as React from 'react';
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render } from '@testing-library/react';
import { Dialog, ScrollArea, Sheet, Theme, Toolbar } from '../../../src/components/index';

afterEach(cleanup);

// A ScrollArea directly in a panel's content is its body: the panel turns into a column, the top
// row stays put, and the ScrollArea takes the rest of the height and scrolls on its own, out to
// the panel's inline and bottom edges so the scrollbar sits at the edge.
const panels = [
  { what: 'Dialog', Part: Dialog },
  { what: 'Sheet', Part: Sheet },
] as const;

const makeRows = (count: number) =>
  Array.from({ length: count }, (_, i) => (
    <p key={i} style={{ margin: 0, lineHeight: '24px' }}>
      Shortcut {i + 1}
    </p>
  ));

function Panel({ Part, scroll = true, maxHeight, count = 80 }: { Part: typeof Dialog | typeof Sheet; scroll?: boolean; maxHeight?: string; count?: number }) {
  const rows = makeRows(count);
  const body = scroll ? <ScrollArea data-testid="body">{rows}</ScrollArea> : <div data-testid="body">{rows}</div>;
  return (
    <Theme>
      <Part.Root open>
        <Part.Content size="2" maxHeight={maxHeight} aria-describedby={undefined}>
          <Toolbar data-testid="row">
            <Toolbar.Title>
              <Part.Title>Keyboard shortcuts</Part.Title>
            </Toolbar.Title>
          </Toolbar>
          {body}
        </Part.Content>
      </Part.Root>
    </Theme>
  );
}

const box = (el: Element) => el.getBoundingClientRect();
const panel = () => document.querySelector<HTMLElement>('.kui-BaseDialogContent')!;
const viewport = () => document.querySelector<HTMLElement>('.kui-ScrollAreaViewport')!;

describe.each(panels)('$what with a ScrollArea body', ({ Part }) => {
  it('fits the window, and only the body scrolls', () => {
    render(<Panel Part={Part} />);
    const p = box(panel());
    expect(p.bottom).toBeLessThanOrEqual(window.innerHeight);
    expect(panel().scrollHeight).toBeLessThanOrEqual(panel().clientHeight);
    expect(viewport().scrollHeight).toBeGreaterThan(viewport().clientHeight);
  });

  it('keeps the top row in place while the body scrolls', () => {
    render(<Panel Part={Part} />);
    const row = document.querySelector('[data-testid="row"]')!;
    const before = box(row).top;
    viewport().scrollTop = 400;
    expect(box(row).top).toBe(before);
    expect(box(row).height).toBeGreaterThan(0);
  });

  it('runs under the top row to the top edge; content starts where it would without a ScrollArea', () => {
    render(<Panel Part={Part} scroll={false} />);
    const firstRow = (selector: string) => box(document.querySelector(selector)!).top - box(panel()).top;
    const plain = firstRow('[data-testid="body"] p');
    cleanup();

    render(<Panel Part={Part} />);
    const p = box(panel());
    const row = box(document.querySelector('[data-testid="row"]')!);
    const body = box(document.querySelector('[data-testid="body"]')!);
    expect(body.top).toBeCloseTo(p.top, 0);
    expect(row.top).toBeGreaterThan(body.top);
    expect(firstRow('[data-testid="body"] p')).toBeCloseTo(plain, 0);
    // The fade under the row reaches the row's bottom edge.
    const root = document.querySelector<HTMLElement>('.kui-ScrollAreaRoot')!;
    expect(root.style.getPropertyValue('--panel-top-row-height')).toBe(`${row.height}px`);
  });

  it('reaches the inline and bottom edges, and keeps its content on the panel inset', () => {
    render(<Panel Part={Part} />);
    const p = box(panel());
    const body = box(document.querySelector('[data-testid="body"]')!);
    const pad = parseFloat(getComputedStyle(panel()).paddingLeft);
    expect(body.left).toBeCloseTo(p.left, 0);
    expect(body.right).toBeCloseTo(p.right, 0);
    expect(body.bottom).toBeCloseTo(p.bottom, 0);
    const first = box(document.querySelector('[data-testid="body"] p')!);
    expect(first.left - p.left).toBeCloseTo(pad, 0);
  });

  it('without a ScrollArea, scrolls as a whole, as before', () => {
    render(<Panel Part={Part} scroll={false} maxHeight="400px" />);
    expect(getComputedStyle(panel()).display).toBe('block');
    expect(panel().scrollHeight).toBeGreaterThan(panel().clientHeight);
  });
});

describe('a panel body fades', () => {
  const fades = () => document.querySelector('.kui-ScrollAreaRoot')!.hasAttribute('data-fade');

  it.each(panels)('in a $what, by default', ({ Part }) => {
    render(<Panel Part={Part} />);
    expect(fades()).toBe(true);
    expect(getComputedStyle(viewport()).maskImage).not.toBe('none');
  });

  it('unless fade={false}, and not for a ScrollArea outside a panel or nested in the body', () => {
    render(
      <Theme>
        <ScrollArea data-testid="page">x</ScrollArea>
        <Dialog.Root open>
          <Dialog.Content aria-describedby={undefined}>
            <Dialog.Title>T</Dialog.Title>
            <ScrollArea fade={false} data-testid="off">
              <ScrollArea data-testid="nested">x</ScrollArea>
            </ScrollArea>
          </Dialog.Content>
        </Dialog.Root>
      </Theme>,
    );
    for (const id of ['page', 'off', 'nested']) {
      expect(document.querySelector(`[data-testid="${id}"]`)!.closest('.kui-ScrollAreaRoot')!.hasAttribute('data-fade')).toBe(false);
    }
  });
});

describe('the floating row hides content under it', () => {
  // The mask's hold, resolved to px by a probe that is as wide as it.
  function held() {
    const probe = document.createElement('div');
    probe.style.width = 'var(--scroll-fade-start-held)';
    viewport().append(probe);
    const width = probe.getBoundingClientRect().width;
    probe.remove();
    return width;
  }

  // 10 rows are 240px of content; at 300px the body overflows by about 40px.
  it.each([
    ['a little', 10],
    ['a lot', 80],
  ])('from the first pixel scrolled, when the body overflows %s', async (_, count) => {
    render(<Panel Part={Dialog} maxHeight="300px" count={count} />);
    expect(viewport().scrollHeight - viewport().clientHeight).toBeGreaterThan(count === 10 ? 0 : 500);
    const reach = box(document.querySelector('[data-testid="row"]')!).bottom - box(panel()).top;
    expect(held()).toBe(0);
    viewport().scrollTop = viewport().scrollHeight;
    viewport().dispatchEvent(new Event('scroll'));
    await new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve)));
    expect(held()).toBeCloseTo(reach, 0);
  });
});

describe('Dialog with a ScrollArea body', () => {
  it('a maxHeight still caps it', () => {
    render(<Panel Part={Dialog} maxHeight="300px" />);
    expect(box(panel()).height).toBe(300);
  });

  it('shrinks to short content', () => {
    render(
      <Theme>
        <Dialog.Root open>
          <Dialog.Content size="2" aria-describedby={undefined}>
            <Dialog.Title>Short</Dialog.Title>
            <ScrollArea>
              <p>One line</p>
            </ScrollArea>
          </Dialog.Content>
        </Dialog.Root>
      </Theme>,
    );
    expect(box(panel()).height).toBeLessThan(200);
  });
});
