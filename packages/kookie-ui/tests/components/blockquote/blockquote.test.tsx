import * as React from 'react';
import { describe, it, expect } from 'vitest';
import { renderWithProviders, screen } from '../../test-utils';
import { Blockquote } from '../../../src/components/index';

describe('Blockquote props', () => {
  it('styles itself with its own props', () => {
    renderWithProviders(
      <Blockquote size="3" weight="medium" color="red" emphasis="medium" truncate>
        Quote
      </Blockquote>,
    );
    const quote = screen.getByText('Quote');
    expect(quote.tagName).toBe('BLOCKQUOTE');
    expect(quote.className).toContain('kui-Text');
    expect(quote.className).toContain('kui-Blockquote');
    expect(quote.className).toContain('kui-r-size-3');
    expect(quote.className).toContain('kui-truncate');
    expect(quote).toHaveAttribute('data-accent-color', 'red');
  });

  it('does not apply Text props that are not in its types', () => {
    const textOnly = { align: 'center' } as Record<string, string>;
    renderWithProviders(<Blockquote {...textOnly}>Quote</Blockquote>);
    expect(screen.getByText('Quote').className).not.toContain('kui-r-ta');
  });
});
