import * as React from 'react';
import { describe, it, expect } from 'vitest';
import { render } from '@testing-library/react';
import { Table, Theme } from '../../../src/components/index';

describe('Table alignment', () => {
  it('uses start and end, so right-to-left tables mirror', () => {
    const { container } = render(
      <Theme>
        <div dir="rtl">
          <Table.Root>
            <Table.Header>
              <Table.Row>
                <Table.ColumnHeaderCell>Name</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell justify="end">Total</Table.ColumnHeaderCell>
              </Table.Row>
            </Table.Header>
          </Table.Root>
        </div>
      </Theme>,
    );
    const [name, total] = container.querySelectorAll('th');
    expect(getComputedStyle(name).textAlign).toBe('start');
    expect(getComputedStyle(total).textAlign).toBe('end');
    expect(total).toHaveClass('kui-r-ta-end');
  });
});
