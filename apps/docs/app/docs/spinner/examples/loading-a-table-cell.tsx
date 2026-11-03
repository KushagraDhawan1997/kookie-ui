import * as React from 'react';
import { Button, Spinner, Table } from '@kushagradhawan/kookie-ui';

export default function InvoiceRow() {
  const [pending, setPending] = React.useState(false);

  function refresh() {
    setPending(true);
    setTimeout(() => setPending(false), 1500);
  }

  return (
    <Table.Root variant="surface">
      <Table.Body>
        <Table.Row align="center">
          <Table.RowHeaderCell>INV-204</Table.RowHeaderCell>
          <Table.Cell justify="end">
            <Spinner loading={pending}>$1,280.00</Spinner>
          </Table.Cell>
          <Table.Cell justify="end">
            <Button size="1" emphasis="quiet" color="gray" disabled={pending} onClick={refresh}>
              Refresh
            </Button>
          </Table.Cell>
        </Table.Row>
      </Table.Body>
    </Table.Root>
  );
}
