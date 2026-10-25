import { Card, Flex, Kbd, Text } from '@kushagradhawan/kookie-ui';

const commands = [
  { label: 'New file', keys: '⌘ N' },
  { label: 'Open file', keys: '⌘ O' },
  { label: 'Save', keys: '⌘ S' },
];

export default function FileMenu() {
  return (
    <Card size="1">
      <Flex direction="column" gap="2" width="220px">
        {commands.map((command) => (
          <Flex key={command.label} justify="between" align="center" gap="4">
            <Text size="2">{command.label}</Text>
            <Kbd size="1" variant="soft">{command.keys}</Kbd>
          </Flex>
        ))}
      </Flex>
    </Card>
  );
}
