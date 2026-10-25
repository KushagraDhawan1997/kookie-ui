import { Chip, Flex, Text } from '@kushagradhawan/kookie-ui';

export default function PullRequestStatus() {
  return (
    <Flex gap="3" align="center">
      <Text size="2" weight="medium">Add billing export</Text>
      <Chip color="amber" variant="soft" tooltip="Waiting for a reviewer">
        In review
      </Chip>
    </Flex>
  );
}
