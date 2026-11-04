import * as React from 'react';
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { Code, Link, Text, Theme } from '../../../src/components/index';

const long = 'A sentence long enough that it cannot fit in a narrow box at all';

describe('truncate on inline elements', () => {
  it('clips a span Text, a Code and a Link to their container', () => {
    const { container } = render(
      <Theme>
        <div style={{ width: 120 }}>
          <Text truncate data-testid="t">{long}</Text>
        </div>
        <div style={{ width: 120 }}>
          <Code truncate data-testid="t">{long}</Code>
        </div>
        <div style={{ width: 120 }}>
          <Link href="#" truncate data-testid="t">
            {long}
          </Link>
        </div>
      </Theme>,
    );
    const items = Array.from(container.querySelectorAll<HTMLElement>('[data-testid="t"]'));
    expect(items).toHaveLength(3);
    for (const el of items) {
      expect(getComputedStyle(el).textOverflow).toBe('ellipsis');
      expect(el.getBoundingClientRect().width).toBeLessThanOrEqual(120);
      expect(el.scrollWidth).toBeGreaterThan(el.clientWidth);
    }
  });

  it('leaves a block Text a block', () => {
    const { container } = render(
      <Theme>
        <Text as="p" truncate>
          {long}
        </Text>
      </Theme>,
    );
    expect(getComputedStyle(container.querySelector('p')!).display).toBe('block');
  });
});
