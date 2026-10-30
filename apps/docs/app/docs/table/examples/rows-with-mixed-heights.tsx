import { Avatar, Flex, Table, Text } from '@kushagradhawan/kookie-ui';

const members = [
  { name: 'Maya Patel', email: 'maya@example.com', role: 'Owner' },
  { name: 'Leo Brandt', email: 'leo@example.com', role: 'Editor' },
];

export default function TeamTable() {
  return (
    <Table.Root variant="surface">
      <Table.Body>
        {members.map((member) => (
          <Table.Row key={member.email} align="center">
            <Table.RowHeaderCell>
              <Flex align="center" gap="3">
                <Avatar size="2" fallback={member.name[0]} />
                <Flex direction="column">
                  <Text weight="medium">{member.name}</Text>
                  <Text emphasis="medium">{member.email}</Text>
                </Flex>
              </Flex>
            </Table.RowHeaderCell>
            <Table.Cell justify="end">{member.role}</Table.Cell>
          </Table.Row>
        ))}
      </Table.Body>
    </Table.Root>
  );
}
