import { Code, Table } from '@kushagradhawan/kookie-ui';

export default function RequestLog() {
  return (
    <Table.Root size="1">
      <Table.Body>
        <Table.Row>
          <Table.Cell>
            <Code variant="solid" color="green">200 OK</Code>
          </Table.Cell>
          <Table.Cell>GET /api/projects</Table.Cell>
        </Table.Row>
        <Table.Row>
          <Table.Cell>
            <Code variant="solid" color="red">500 Failed</Code>
          </Table.Cell>
          <Table.Cell>POST /api/invites</Table.Cell>
        </Table.Row>
      </Table.Body>
    </Table.Root>
  );
}
