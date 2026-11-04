import * as React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Theme } from '../../src/components/index';

const resolve = (el: Element, token: string) => {
  const probe = document.createElement('span');
  probe.style.color = `var(${token})`;
  el.appendChild(probe);
  const value = getComputedStyle(probe).color;
  probe.remove();
  return value;
};

describe("v2's token names", () => {
  it.each(['light', 'dark'] as const)('resolve to v1 values in %s', (appearance) => {
    render(
      <Theme appearance={appearance}>
        <div data-testid="inside" />
      </Theme>,
    );
    const inside = screen.getByTestId('inside');
    expect(resolve(inside, '--color-page')).toBe(resolve(inside, '--color-page'));
    expect(resolve(inside, '--color-text')).toBe(resolve(inside, '--neutral-12'));
    for (let n = 1; n <= 12; n++) {
      expect(resolve(inside, `--neutral-${n}`)).toBe(resolve(inside, `--gray-${n}`));
    }
    expect(resolve(inside, '--color-page')).not.toBe('');
  });

  it('follows the appearance', () => {
    render(
      <>
        <Theme appearance="light">
          <div data-testid="light" />
        </Theme>
        <Theme appearance="dark">
          <div data-testid="dark" />
        </Theme>
      </>,
    );
    expect(resolve(screen.getByTestId('light'), '--color-page')).not.toBe(
      resolve(screen.getByTestId('dark'), '--color-page'),
    );
  });
});
