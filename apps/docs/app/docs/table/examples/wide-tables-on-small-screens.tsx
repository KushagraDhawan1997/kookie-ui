import { Box, Table } from '@kushagradhawan/kookie-ui';

export default function ProjectBudgetTable() {
  return (
    <Box width="100%" maxWidth="360px">
      <Table.Root variant="surface" aria-label="Project budgets">
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeaderCell minWidth="200px">Project</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>Owner</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell justify="end">Budget</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell justify="end">Spent</Table.ColumnHeaderCell>
          </Table.Row>
        </Table.Header>
        <Table.Body>
          <Table.Row>
            <Table.RowHeaderCell>Website redesign</Table.RowHeaderCell>
            <Table.Cell>Maya Patel</Table.Cell>
            <Table.Cell justify="end">$48,000</Table.Cell>
            <Table.Cell justify="end">$31,200</Table.Cell>
          </Table.Row>
        </Table.Body>
      </Table.Root>
    </Box>
  );
}
