/**
 * Shell flush, mounted (ported from v2, 0.33.0).
 *
 * A flush pane draws one hairline on its inner edge in --color-border and nothing else; a pane
 * off the frame is a card; it floats over a flush content, which runs underneath it; and with
 * the content off the frame, the flush panes draw no hairline toward it.
 */
import * as React from 'react';
import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import { Shell, Theme } from '../../../src/components/index';

type Flags = { header?: boolean; sidebar?: boolean; content?: boolean; inspector?: boolean };

function Frame({ header = true, sidebar = true, content = true, inspector = true }: Flags) {
  return (
    <Theme>
      <Shell.Root height="600px" style={{ width: 1200 }}>
        <Shell.Header flush={header}>header</Shell.Header>
        <Shell.Sidebar presentation="fixed" defaultState="expanded" flush={sidebar}>
          sidebar
        </Shell.Sidebar>
        <Shell.Content flush={content}>content</Shell.Content>
        <Shell.Inspector presentation="fixed" defaultOpen flush={inspector}>
          inspector
        </Shell.Inspector>
      </Shell.Root>
    </Theme>
  );
}

const q = (c: HTMLElement, cls: string) => c.querySelector<HTMLElement>(`.kui-Shell${cls}`)!;
const style = (el: Element) => getComputedStyle(el);
const borderColor = (c: HTMLElement) => {
  const probe = document.createElement('div');
  probe.style.color = 'var(--color-border)';
  c.querySelector('.kui-ShellRoot')!.appendChild(probe);
  const value = getComputedStyle(probe).color;
  probe.remove();
  return value;
};

describe('a flush frame', () => {
  it('draws one hairline per seam, on the pane’s inner edge, in --color-border', () => {
    const { container } = render(<Frame />);
    const color = borderColor(container);
    expect(style(q(container, 'Header')).borderBottomWidth).toBe('1px');
    expect(style(q(container, 'Header')).borderBottomColor).toBe(color);
    expect(style(q(container, 'Sidebar')).borderRightWidth).toBe('1px');
    expect(style(q(container, 'Sidebar')).borderLeftWidth).toBe('0px');
    expect(style(q(container, 'Inspector')).borderLeftWidth).toBe('1px');
    // The content draws none, so no seam doubles.
    const content = style(q(container, 'Content'));
    expect([content.borderTopWidth, content.borderRightWidth, content.borderBottomWidth, content.borderLeftWidth]).toEqual(['0px', '0px', '0px', '0px']);
    expect(style(q(container, 'Sidebar')).borderTopLeftRadius).toBe('0px');
    expect(style(q(container, 'Root')).backgroundColor).toBe('rgba(0, 0, 0, 0)');
  });
});

describe('a pane off the frame', () => {
  it('is a card that floats over a flush content, which runs underneath it', () => {
    const { container } = render(<Frame sidebar={false} />);
    const sidebar = q(container, 'Sidebar');
    const content = q(container, 'Content').getBoundingClientRect();
    expect(parseFloat(style(sidebar).marginLeft)).toBeGreaterThan(0);
    expect(parseFloat(style(sidebar).borderTopLeftRadius)).toBeGreaterThan(0);
    expect(style(sidebar).boxShadow).not.toBe('none');
    // The content starts at the frame's edge, under the card.
    expect(content.left).toBeLessThan(sidebar.getBoundingClientRect().left);
  });

  it('with the content off the frame, nothing floats and flush panes draw no hairline toward it', () => {
    const { container } = render(<Frame content={false} />);
    const content = q(container, 'Content');
    const sidebar = q(container, 'Sidebar');
    expect(style(q(container, 'Root')).backgroundColor).not.toBe('rgba(0, 0, 0, 0)');
    expect(style(sidebar).borderRightWidth).toBe('0px');
    expect(style(q(container, 'Header')).borderBottomWidth).toBe('0px');
    expect(style(q(container, 'Inspector')).borderLeftWidth).toBe('0px');
    // The card pays no air toward a flush pane: the pane's padding is the air.
    expect(content.getBoundingClientRect().left).toBeCloseTo(sidebar.getBoundingClientRect().right, 0);
    expect(parseFloat(style(content).borderTopLeftRadius)).toBeGreaterThan(0);
  });

  it('with nothing flush, card to card and card to edge are the same gap', () => {
    const { container } = render(<Frame header={false} sidebar={false} content={false} inspector={false} />);
    const root = q(container, 'Root').getBoundingClientRect();
    const sidebar = q(container, 'Sidebar').getBoundingClientRect();
    const content = q(container, 'Content').getBoundingClientRect();
    const edge = sidebar.left - root.left;
    expect(edge).toBeGreaterThan(0);
    expect(content.left - sidebar.right).toBeCloseTo(edge, 0);
  });
});
