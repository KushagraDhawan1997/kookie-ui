import { ContextMenu, Table } from '@kushagradhawan/kookie-ui';

const files = [
  { id: 'f1', name: 'Q3 Report.pdf', size: '2.4 MB' },
  { id: 'f2', name: 'Roadmap.key', size: '18 MB' },
  { id: 'f3', name: 'Invoice 0142.pdf', size: '96 KB' },
];

export default function FileTable() {
  return (
    <Table.Root size="1">
      <Table.Body>
        {files.map((file) => (
          <ContextMenu.Root key={file.id}>
            <ContextMenu.Trigger>
              <Table.Row>
                <Table.Cell>{file.name}</Table.Cell>
                <Table.Cell justify="end">{file.size}</Table.Cell>
              </Table.Row>
            </ContextMenu.Trigger>
            <ContextMenu.Content>
              <ContextMenu.Item>Open</ContextMenu.Item>
              <ContextMenu.Item>Share</ContextMenu.Item>
            </ContextMenu.Content>
          </ContextMenu.Root>
        ))}
      </Table.Body>
    </Table.Root>
  );
}
