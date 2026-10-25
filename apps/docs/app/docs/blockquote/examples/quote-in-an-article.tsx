import { Blockquote, Flex, Text } from '@kushagradhawan/kookie-ui';

export default function OutageReview() {
  return (
    <Flex direction="column" gap="3" maxWidth="480px">
      <Text as="p" size="3">
        The review found one main cause of the outage.
      </Text>
      <Blockquote size="3" cite="https://example.com/review">
        The retry limit was set per request, not per user.
      </Blockquote>
      <Text as="p" size="3">
        The fix moves the limit to the account and ships next week.
      </Text>
    </Flex>
  );
}
