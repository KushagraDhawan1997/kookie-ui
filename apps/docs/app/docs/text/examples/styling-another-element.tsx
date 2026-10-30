import { Flex, Text } from '@kushagradhawan/kookie-ui';

export default function CommentMeta() {
  return (
    <Flex align="baseline" gap="2">
      <Text size="2" weight="medium">
        Maya Patel
      </Text>
      <Text asChild size="1" emphasis="quiet">
        <time dateTime="2026-03-01">1 March</time>
      </Text>
    </Flex>
  );
}
