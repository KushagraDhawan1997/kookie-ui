import { Avatar, Box, Card, Chip, Flex, Text } from '@kushagradhawan/kookie-ui';

const members = [
  { initials: 'SK', name: 'Sarah Kim', role: 'Product lead', access: 'Admin' },
  { initials: 'JD', name: 'John Doe', role: 'Engineer', access: 'Member' },
  { initials: 'AL', name: 'Alex Lee', role: 'Designer', access: 'Member' },
];

export default function TeamMembers() {
  return (
    <Box width="100%" maxWidth="380px">
      <Card>
        <Flex direction="column" gap="4">
          {members.map((member) => (
            <Flex key={member.name} gap="3" align="center">
              <Avatar fallback={member.initials} alt="" />
              <Flex direction="column" flexGrow="1">
                <Text size="2" weight="medium">{member.name}</Text>
                <Text size="2" emphasis="medium">{member.role}</Text>
              </Flex>
              <Chip variant="soft">{member.access}</Chip>
            </Flex>
          ))}
        </Flex>
      </Card>
    </Box>
  );
}
