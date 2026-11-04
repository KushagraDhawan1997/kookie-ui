import * as React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { userEvent } from 'vitest/browser';
import { Chip, Theme } from '../../../src/components/index';

const Icon = () => (
  <svg viewBox="0 0 24 24" width="40" height="40" aria-hidden>
    <circle cx="12" cy="12" r="10" />
  </svg>
);

describe('Chip in a browser', () => {
  it('sizes its icon to one line, so the icon never grows the chip', () => {
    const sizes = ['1', '2', '3', '4'] as const;
    render(
      <Theme>
        {sizes.map((size) => (
          <React.Fragment key={size}>
            <Chip size={size} data-testid={`icon-${size}`}>
              <Icon />
              Label
            </Chip>
            <Chip size={size} data-testid={`plain-${size}`}>
              Label
            </Chip>
          </React.Fragment>
        ))}
      </Theme>,
    );
    const expected = { '1': 16, '2': 16, '3': 20, '4': 24 };
    for (const size of sizes) {
      const withIcon = screen.getByTestId(`icon-${size}`);
      const svg = withIcon.querySelector('svg')!.getBoundingClientRect();
      expect([svg.width, svg.height]).toEqual([expected[size], expected[size]]);
      expect(withIcon.getBoundingClientRect().height).toBe(screen.getByTestId(`plain-${size}`).getBoundingClientRect().height);
    }
  });

  it('opens its tooltip from the keyboard', async () => {
    render(
      <Theme>
        <button>Before</button>
        <Chip tooltip="Saved 2 minutes ago">Saved</Chip>
      </Theme>,
    );
    screen.getByRole('button', { name: 'Before' }).focus();
    await userEvent.keyboard('{Tab}');
    expect(document.activeElement).toBe(screen.getByText('Saved'));
    expect(await screen.findByRole('tooltip')).toHaveTextContent('Saved 2 minutes ago');
  });

  it('carries no will-change hint', () => {
    render(
      <Theme>
        <Chip data-testid="chip">Label</Chip>
      </Theme>,
    );
    expect(getComputedStyle(screen.getByTestId('chip')).willChange).toBe('auto');
  });
});
