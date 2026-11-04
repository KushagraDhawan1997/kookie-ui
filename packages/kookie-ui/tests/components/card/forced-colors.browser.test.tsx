import * as React from 'react';
import { afterEach, describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { cdp } from 'vitest/browser';
import { Card, Theme } from '../../../src/components/index';

const setForcedColors = (value: 'active' | 'none') =>
  cdp().send('Emulation.setEmulatedMedia', { features: [{ name: 'forced-colors', value }] });

afterEach(async () => {
  await setForcedColors('none');
});

describe('Card in forced colors', () => {
  it('draws a real border, since the box-shadow edge is dropped', async () => {
    await setForcedColors('active');
    expect(matchMedia('(forced-colors: active)').matches).toBe(true);
    const { container } = render(
      <Theme>
        <Card variant="surface">Surface</Card>
        <Card variant="raised">Raised</Card>
        <Card variant="soft">Soft</Card>
      </Theme>,
    );
    for (const card of container.querySelectorAll('.kui-Card')) {
      const s = getComputedStyle(card);
      expect(s.borderTopStyle).toBe('solid');
      expect(parseFloat(s.borderTopWidth)).toBeGreaterThan(0);
    }
  });

  it('draws no border outside forced colors', () => {
    const { container } = render(
      <Theme>
        <Card variant="surface">Surface</Card>
      </Theme>,
    );
    expect(getComputedStyle(container.querySelector('.kui-Card')!).borderTopStyle).toBe('none');
  });
});
