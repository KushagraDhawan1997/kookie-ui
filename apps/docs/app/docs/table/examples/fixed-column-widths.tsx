import { Table } from '@kushagradhawan/kookie-ui';

const files = [
  { name: 'Quarterly report.pdf', updated: '2 hours ago' },
  { name: 'Brand guidelines for the 2026 launch.fig', updated: 'Yesterday' },
];

export default function RecentFilesTable() {
  return (
    <Table.Root layout="fixed" variant="surface">
      <Table.Header>
        <Table.Row>
          <Table.ColumnHeaderCell width="60%">Name</Table.ColumnHeaderCell>
          <Table.ColumnHeaderCell>Updated</Table.ColumnHeaderCell>
        </Table.Row>
      </Table.Header>
      <Table.Body>
        {files.map((file) => (
          <Table.Row key={file.name}>
            <Table.RowHeaderCell>{file.name}</Table.RowHeaderCell>
            <Table.Cell>{file.updated}</Table.Cell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table.Root>
  );
}
