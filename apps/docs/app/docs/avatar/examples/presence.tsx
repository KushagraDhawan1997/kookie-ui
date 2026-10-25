import { Avatar, Flex, Text } from '@kushagradhawan/kookie-ui';

export default function TeammatePresence() {
  return (
    <Flex gap="3" align="center">
      <Avatar fallback="MK" alt="" status="green" statusLabel="Online" />
      <Flex direction="column">
        <Text size="2" weight="medium">Mira Kapoor</Text>
        <Text size="2" emphasis="medium">Online</Text>
      </Flex>
    </Flex>
  );
}
