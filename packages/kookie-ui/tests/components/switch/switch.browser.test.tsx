import * as React from 'react';
import { describe, it, expect, afterEach } from 'vitest';
import { cdp } from 'vitest/browser';
import { render } from '@testing-library/react';
import { Switch, Theme } from '../../../src/components/index';

const emulate = (features: { name: string; value: string }[]) => cdp().send('Emulation.setEmulatedMedia', { features });

afterEach(async () => {
  await emulate([]);
});

function thumbSide(dir: 'ltr' | 'rtl', checked: boolean) {
  const { container, unmount } = render(
    <Theme>
      <div dir={dir}>
        <Switch defaultChecked={checked} aria-label="Wi-Fi" />
      </div>
    </Theme>,
  );
  const root = container.querySelector('.kui-SwitchRoot')!.getBoundingClientRect();
  const thumb = container.querySelector('.kui-SwitchThumb')!.getBoundingClientRect();
  const centre = thumb.left + thumb.width / 2;
  unmount();
  return centre < root.left + root.width / 2 ? 'left' : 'right';
}

describe('Switch direction', () => {
  it('puts "on" at the right end left to right', () => {
    expect(thumbSide('ltr', false)).toBe('left');
    expect(thumbSide('ltr', true)).toBe('right');
  });

  it('mirrors right to left', () => {
    expect(thumbSide('rtl', false)).toBe('right');
    expect(thumbSide('rtl', true)).toBe('left');
  });
});

describe('Switch disabled', () => {
  it('keeps its disabled colours without !important, so a caller can override them', () => {
    const { container } = render(
      <Theme>
        <style>{'.my-switch::before { box-shadow: rgb(1, 2, 3) 0px 0px 0px 1px inset; }'}</style>
        <Switch disabled aria-label="Wi-Fi" />
      </Theme>,
    );
    const root = container.querySelector('.kui-SwitchRoot')!;
    expect(getComputedStyle(root, '::before').boxShadow).toBe('none');
    root.classList.add('my-switch');
    expect(getComputedStyle(root, '::before').boxShadow).toBe('rgb(1, 2, 3) 0px 0px 0px 1px inset');
  });
});

describe('Switch in forced colours', () => {
  it('draws the track with a border', async () => {
    await emulate([{ name: 'forced-colors', value: 'active' }]);
    const { container } = render(
      <Theme>
        <Switch aria-label="Wi-Fi" />
      </Theme>,
    );
    const track = getComputedStyle(container.querySelector('.kui-SwitchRoot')!, '::before');
    expect(track.borderTopStyle).toBe('solid');
    expect(track.borderTopWidth).toBe('1px');
    // The border sits inside the track, so the track keeps its size.
    expect(track.width).toBe('40px');
  });
});
