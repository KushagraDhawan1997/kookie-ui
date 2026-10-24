import * as React from 'react';
import { afterAll, beforeAll, beforeEach, describe, expect, it } from 'vitest';
import { renderWithProviders, screen } from '../../test-utils';
import { installViewport } from '../../helpers/viewport';
import { Separator } from '../../../src/components/index';

let viewport: ReturnType<typeof installViewport>;
beforeAll(() => {
  viewport = installViewport(0);
});
afterAll(() => viewport.restore());
beforeEach(() => viewport.setWidth(0));

describe('Separator role and orientation', () => {
  it('is a separator by default, as in v2', () => {
    renderWithProviders(<Separator />);
    expect(screen.getByRole('separator')).toHaveAttribute('aria-orientation', 'horizontal');
  });

  it('a vertical separator says it is vertical', () => {
    renderWithProviders(<Separator orientation="vertical" />);
    expect(screen.getByRole('separator')).toHaveAttribute('aria-orientation', 'vertical');
  });

  it('a responsive one announces the orientation drawn at the current breakpoint', () => {
    renderWithProviders(<Separator orientation={{ initial: 'vertical', md: 'horizontal' }} />);
    const el = screen.getByRole('separator');
    expect(el).toHaveAttribute('aria-orientation', 'vertical');

    viewport.setWidth(1100);
    expect(el).toHaveAttribute('aria-orientation', 'horizontal');

    viewport.setWidth(600);
    expect(el).toHaveAttribute('aria-orientation', 'vertical');
  });

  it('a decorative one has no role and no orientation', () => {
    const { container } = renderWithProviders(<Separator decorative orientation="vertical" />);
    const el = container.querySelector('.kui-Separator')!;
    expect(el).not.toHaveAttribute('role');
    expect(el).not.toHaveAttribute('aria-orientation');
  });
});
