import * as React from 'react';
import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';
import { userEvent } from 'vitest/browser';
import { Link, Theme } from '../../../src/components/index';

describe('Link underline', () => {
  it('is always there, quieter than the words, and darkens to the ink on hover', async () => {
    render(
      <Theme>
        <Link href="#x">Docs</Link>
      </Theme>,
    );
    const link = screen.getByRole('link', { name: 'Docs' });
    const style = getComputedStyle(link);
    expect(style.textDecorationLine).toBe('underline');
    expect(style.textDecorationColor).not.toBe(style.color);
    await userEvent.hover(link);
    expect(getComputedStyle(link).textDecorationColor).toBe(getComputedStyle(link).color);
  });

  it('stays underlined under keyboard focus, with the focus outline', async () => {
    render(
      <Theme>
        <Link href="#x">Docs</Link>
      </Theme>,
    );
    const link = screen.getByRole('link', { name: 'Docs' });
    await userEvent.tab();
    expect(link.matches(':focus-visible')).toBe(true);
    const style = getComputedStyle(link);
    expect(style.textDecorationLine).toBe('underline');
    expect(style.outlineStyle).toBe('solid');
  });
});
