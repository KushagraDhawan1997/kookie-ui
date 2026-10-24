import * as React from 'react';
import { describe, it, expect, afterEach } from 'vitest';
import { cdp } from 'vitest/browser';
import { render } from '@testing-library/react';
import { Slider, Theme } from '../../../src/components/index';

const emulate = (features: { name: string; value: string }[]) => cdp().send('Emulation.setEmulatedMedia', { features });

afterEach(async () => {
  await emulate([]);
});

const ticks = [
  { value: 0, label: 'Zero' },
  { value: 100, label: 'Hundred' },
];

/** The centre of the thumb and of each tick mark, along the slider's own axis. */
function centres(container: HTMLElement, axis: 'x' | 'y') {
  const centre = (el: Element) => {
    const rect = el.getBoundingClientRect();
    return axis === 'x' ? rect.left + rect.width / 2 : rect.top + rect.height / 2;
  };
  const thumb = centre(container.querySelector('.kui-SliderThumb')!);
  const [zero, hundred] = Array.from(container.querySelectorAll('.kui-SliderTickMark')).map(centre);
  return { thumb, zero, hundred };
}

describe('Slider ticks', () => {
  it('sit under the values they name in a right to left slider', () => {
    const { container } = render(
      <Theme>
        <div dir="rtl" style={{ width: 400 }}>
          <Slider dir="rtl" defaultValue={[0]} ticks={ticks} aria-label="Volume" />
        </div>
      </Theme>,
    );
    const { thumb, zero, hundred } = centres(container, 'x');
    expect(Math.abs(thumb - zero)).toBeLessThan(15);
    expect(hundred).toBeLessThan(zero);
  });

  it('sit under the values they name in an inverted slider', () => {
    const { container } = render(
      <Theme>
        <div style={{ width: 400 }}>
          <Slider inverted defaultValue={[0]} ticks={ticks} aria-label="Volume" />
        </div>
      </Theme>,
    );
    const { thumb, zero, hundred } = centres(container, 'x');
    expect(Math.abs(thumb - zero)).toBeLessThan(15);
    expect(hundred).toBeLessThan(zero);
  });

  it('run beside a vertical slider, from the bottom', () => {
    const { container } = render(
      <Theme>
        <div style={{ height: 200 }}>
          <Slider orientation="vertical" defaultValue={[0]} ticks={ticks} aria-label="Volume" />
        </div>
      </Theme>,
    );
    const { thumb, zero, hundred } = centres(container, 'y');
    expect(Math.abs(thumb - zero)).toBeLessThan(15);
    expect(hundred).toBeLessThan(zero);
    const root = container.querySelector('.kui-SliderRoot')!.getBoundingClientRect();
    const mark = container.querySelector('.kui-SliderTickMark')!.getBoundingClientRect();
    expect(mark.left).toBeGreaterThanOrEqual(root.right);
  });

  it('take up space, so the content after the slider starts below them', () => {
    const { container } = render(
      <Theme>
        <div style={{ width: 400 }}>
          <Slider defaultValue={[0]} ticks={ticks} aria-label="Volume" />
          <p style={{ margin: 0 }}>After</p>
        </div>
      </Theme>,
    );
    const ticksBox = container.querySelector('.kui-SliderTicks')!.getBoundingClientRect();
    const after = container.querySelector('p')!.getBoundingClientRect();
    expect(after.top).toBeGreaterThanOrEqual(ticksBox.bottom);
  });
});

describe('Slider orientation', () => {
  it('a vertical slider fills the height of its box', () => {
    const { container } = render(
      <Theme>
        <div style={{ height: 200 }}>
          <Slider orientation="vertical" defaultValue={[40]} aria-label="Volume" />
        </div>
      </Theme>,
    );
    expect(container.querySelector('.kui-SliderRoot')!.getBoundingClientRect().height).toBe(200);
  });
});

describe('Slider paint', () => {
  it('reads the thumb shadow from --slider-thumb-box-shadow', () => {
    const { container } = render(
      <Theme>
        <Slider defaultValue={[40]} aria-label="Volume" style={{ '--slider-thumb-box-shadow': '0 0 0 3px red' } as React.CSSProperties} />
      </Theme>,
    );
    expect(getComputedStyle(container.querySelector('.kui-SliderThumb')!, '::after').boxShadow).toBe('rgb(255, 0, 0) 0px 0px 0px 3px');
  });

  it('keeps the disabled colours without !important, so a caller can still override them', () => {
    const { container } = render(
      <Theme>
        <style>{'.my-track { background-color: rgb(1, 2, 3); }'}</style>
        <Slider disabled defaultValue={[40]} aria-label="Volume" />
      </Theme>,
    );
    const track = container.querySelector('.kui-SliderTrack')!;
    expect(getComputedStyle(track).boxShadow).toBe('none');
    track.classList.add('my-track');
    expect(getComputedStyle(track).backgroundColor).toBe('rgb(1, 2, 3)');
  });
});

describe('Slider in forced colours', () => {
  it('draws the track and handle with a border and system colours', async () => {
    await emulate([{ name: 'forced-colors', value: 'active' }]);
    const { container } = render(
      <Theme>
        <Slider defaultValue={[40]} aria-label="Volume" />
      </Theme>,
    );
    const track = getComputedStyle(container.querySelector('.kui-SliderTrack')!);
    expect(track.borderTopStyle).toBe('solid');
    expect(track.borderTopWidth).toBe('1px');
    const thumb = getComputedStyle(container.querySelector('.kui-SliderThumb')!, '::after');
    expect(thumb.borderTopStyle).toBe('solid');
  });
});
