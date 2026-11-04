import * as React from 'react';
import { describe, expect, it } from 'vitest';
import { renderWithProviders, screen } from '../../test-utils';
import { Table } from '../../../src/components/index';

describe('Table.Root naming', () => {
  it('puts aria-label, aria-labelledby and aria-describedby on the table, not the wrapper', () => {
    const { container } = renderWithProviders(
      <Table.Root aria-label="Members" aria-describedby="note" data-testid="root">
        <Table.Body>
          <Table.Row>
            <Table.Cell>Mira</Table.Cell>
          </Table.Row>
        </Table.Body>
      </Table.Root>,
    );
    const table = screen.getByRole('table', { name: 'Members' });
    expect(table).toHaveAttribute('aria-describedby', 'note');
    const root = container.querySelector('.kui-TableRoot')!;
    expect(root).not.toHaveAttribute('aria-label');
    expect(root).not.toHaveAttribute('aria-describedby');
    // Other attributes still land on the wrapper.
    expect(root).toHaveAttribute('data-testid', 'root');
  });

  it('names the table by aria-labelledby', () => {
    renderWithProviders(
      <>
        <h2 id="heading">Team</h2>
        <Table.Root aria-labelledby="heading">
          <Table.Body>
            <Table.Row>
              <Table.Cell>Mira</Table.Cell>
            </Table.Row>
          </Table.Body>
        </Table.Root>
      </>,
    );
    expect(screen.getByRole('table', { name: 'Team' })).toBeInTheDocument();
  });
});

describe('Table.Root scroller', () => {
  const body = (
    <Table.Body>
      <Table.Row>
        <Table.Cell>Mira</Table.Cell>
      </Table.Row>
    </Table.Body>
  );

  it('names the scroll region with the table name', () => {
    renderWithProviders(<Table.Root aria-label="Members">{body}</Table.Root>);
    expect(screen.getByRole('region', { name: 'Members' })).toHaveClass('kui-ScrollAreaViewport');
  });

  it('names the scroll region by aria-labelledby', () => {
    renderWithProviders(
      <>
        <h2 id="heading">Team</h2>
        <Table.Root aria-labelledby="heading">{body}</Table.Root>
      </>,
    );
    expect(screen.getByRole('region', { name: 'Team' })).toHaveClass('kui-ScrollAreaViewport');
  });

  it('adds no region when the table has no name', () => {
    renderWithProviders(<Table.Root>{body}</Table.Root>);
    expect(screen.queryByRole('region')).toBeNull();
  });
});
