import { Avatar, Combobox, Flex, Text } from '@kushagradhawan/kookie-ui';

const users = [
  { name: 'Ana Ruiz', email: 'ana@example.com' },
  { name: 'Ben Okafor', email: 'ben@example.com' },
];

export default function ReviewerPicker() {
  return (
    <Combobox.Root placeholder="Add a reviewer">
      <Combobox.Trigger aria-label="Reviewer" />
      <Combobox.Content>
        <Combobox.Input placeholder="Search people" />
        <Combobox.List>
          <Combobox.Empty>No one found</Combobox.Empty>
          {users.map((user) => (
            <Combobox.Item key={user.email} value={user.name} label={user.name}>
              <Avatar size="1" fallback={user.name[0]} />
              <Flex direction="column">
                <Text size="2">{user.name}</Text>
                <Text size="1" emphasis="medium">{user.email}</Text>
              </Flex>
            </Combobox.Item>
          ))}
        </Combobox.List>
      </Combobox.Content>
    </Combobox.Root>
  );
}
