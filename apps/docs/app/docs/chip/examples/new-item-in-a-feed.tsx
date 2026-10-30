import { Avatar, Box, Card, Chip, Flex, Text } from '@kushagradhawan/kookie-ui';

export default function ReviewNotification() {
  return (
    <Box width="100%" maxWidth="380px">
      <Card>
        <Flex gap="3" align="start">
          <Avatar fallback="JD" alt="" variant="soft" />
          <Flex direction="column" flexGrow="1">
            <Flex justify="between" align="center" gap="2">
              <Text size="2" weight="medium">John Doe</Text>
              <Chip size="1" variant="solid">New</Chip>
            </Flex>
            <Text size="2" emphasis="medium">Commented on your pull request</Text>
          </Flex>
        </Flex>
      </Card>
    </Box>
  );
}
