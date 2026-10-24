import * as React from 'react';
import { describe, expect, it } from 'vitest';
import { renderWithProviders, screen } from '../../test-utils';
import { Separator } from '../../../src/components/index';

describe('Separator orientation', () => {
  it('a semantic vertical separator says it is vertical', () => {
    renderWithProviders(<Separator decorative={false} orientation="vertical" />);
    expect(screen.getByRole('separator')).toHaveAttribute('aria-orientation', 'vertical');
  });

  it('a responsive one announces the orientation it starts with', () => {
    renderWithProviders(<Separator decorative={false} orientation={{ initial: 'vertical', md: 'horizontal' }} />);
    expect(screen.getByRole('separator')).toHaveAttribute('aria-orientation', 'vertical');
  });

  it('a horizontal one relies on the role default', () => {
    renderWithProviders(<Separator decorative={false} />);
    expect(screen.getByRole('separator')).not.toHaveAttribute('aria-orientation');
  });

  it('a decorative one has no role and no orientation', () => {
    const { container } = renderWithProviders(<Separator orientation="vertical" />);
    const el = container.querySelector('.kui-Separator')!;
    expect(el).not.toHaveAttribute('role');
    expect(el).not.toHaveAttribute('aria-orientation');
  });
});
