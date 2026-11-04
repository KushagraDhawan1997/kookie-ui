import * as React from 'react';
import { describe, expect, it } from 'vitest';
import { render } from '@testing-library/react';
import { Button, Slider, Theme } from '../../src/components/index';

const TICKS = [0, 25, 50, 75, 100].map((value) => ({ value }));

/**
 * Kookie hides and positions with classes, not style attributes. A style attribute is parsed and
 * stored per element, so one written by every instance costs memory that a shared rule does not.
 * Radix writes its own (thumb position, range insets); those are left alone and not counted here.
 */
function inlineStyles(root: Element) {
  return Array.from(root.querySelectorAll<HTMLElement>('[style]')).map((el) => ({
    el,
    css: el.style.cssText,
  }));
}

describe('Slider writes no inline style of its own', () => {
  it('the live region is hidden by the class, not a style attribute', () => {
    const { container } = render(
      <Theme>
        <Slider defaultValue={[40]} />
      </Theme>,
    );
    const live = container.querySelector<HTMLElement>('[aria-live="polite"]')!;
    expect(live.getAttribute('style')).toBeNull();
    const cs = getComputedStyle(live);
    expect(cs.position).toBe('absolute');
    expect(cs.width).toBe('1px');
    expect(cs.height).toBe('1px');
    expect(cs.overflow).toBe('hidden');
    expect(cs.clip).toBe('rect(0px, 0px, 0px, 0px)');
  });

  it('a tick keeps only its varying left inline; the centring comes from the class', () => {
    const { container } = render(
      <Theme>
        <Slider defaultValue={[40]} ticks={TICKS} />
      </Theme>,
    );
    const ticks = Array.from(container.querySelectorAll<HTMLElement>('.kui-SliderTick'));
    expect(ticks.length).toBe(5);
    for (const tick of ticks) {
      expect(tick.style.transform).toBe('');
      expect(tick.style.length).toBe(1);
      expect(tick.style.left).toMatch(/%$/);
      // Still centred on its stop: translateX(-50%) of its own width.
      const m = new DOMMatrixReadOnly(getComputedStyle(tick).transform);
      expect(m.m41).toBeCloseTo(-tick.offsetWidth / 2, 1);
    }
  });
});

describe('loading Button writes no inline style', () => {
  it('hides its content and re-labels it with classes', () => {
    const { container } = render(
      <Theme>
        <Button loading>Save</Button>
      </Theme>,
    );
    const button = container.querySelector<HTMLElement>('.kui-BaseButton')!;
    expect(inlineStyles(button)).toEqual([]);

    const content = button.querySelector<HTMLElement>(':scope > span[aria-hidden]')!;
    const ccs = getComputedStyle(content);
    expect(ccs.display).toBe('contents');
    expect(ccs.visibility).toBe('hidden');

    const label = button.querySelector<HTMLElement>('.kui-sr-only')!;
    expect(label.textContent).toContain('Save');
    const lcs = getComputedStyle(label);
    expect(lcs.position).toBe('absolute');
    expect(lcs.width).toBe('1px');
    expect(lcs.height).toBe('1px');
    expect(lcs.overflow).toBe('hidden');
    expect(lcs.clip).toBe('rect(0px, 0px, 0px, 0px)');
    expect(lcs.whiteSpace).toBe('nowrap');
  });
});

describe('inline style bytes', () => {
  it('reports per-instance bytes', () => {
    const n = 200;
    const { container } = render(
      <Theme>
        {Array.from({ length: n }, (_, i) => (
          <Slider key={`s${i}`} defaultValue={[40]} ticks={TICKS} />
        ))}
        {Array.from({ length: n }, (_, i) => (
          <Button key={`b${i}`} loading>
            Save
          </Button>
        ))}
      </Theme>,
    );
    const sum = (sel: string) => {
      let bytes = 0;
      let els = 0;
      for (const root of container.querySelectorAll(sel)) {
        for (const s of inlineStyles(root)) {
          bytes += s.css.length;
          els++;
        }
      }
      return { bytesPer: bytes / n, elsPer: els / n };
    };
    const slider = sum('.kui-SliderContainer');
    const button = sum('.kui-BaseButton');
    console.log('INLINE', JSON.stringify({ slider, button }));
    const rect = (el: Element) => {
      const r = el.getBoundingClientRect();
      return [r.x, r.y, r.width, r.height].map((v) => Math.round(v * 100) / 100).join(',');
    };
    const first = container.querySelector('.kui-SliderContainer')!;
    console.log(
      'GEOM',
      JSON.stringify({
        ticks: Array.from(first.querySelectorAll('.kui-SliderTick')).map(rect),
        live: rect(first.querySelector('[aria-live]')!),
        button: rect(container.querySelector('.kui-BaseButton')!),
      }),
    );
    expect(button.elsPer).toBe(0);
  });
});
