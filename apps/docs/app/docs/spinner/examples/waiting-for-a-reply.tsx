import { Card, Flex, Spinner, Text } from '@kushagradhawan/kookie-ui';

export default function ReplyPending() {
  return (
    <Flex direction="column" gap="3" width="100%" maxWidth="360px">
      <Flex justify="end">
        <Card size="1">
          <Text size="2">Can you summarise the meeting notes?</Text>
        </Card>
      </Flex>
      <Flex align="center" gap="2" role="status">
        <Spinner />
        <Text size="2" emphasis="medium">
          Writing a reply
        </Text>
      </Flex>
    </Flex>
  );
}
