import { Box, Flex, Progress, Text } from '@kushagradhawan/kookie-ui';

export default function UsageMeters() {
  return (
    <Box width="100%" maxWidth="320px">
      <Flex direction="column" gap="4">
        <Flex direction="column" gap="2">
          <Text size="2">Checks passed: 24 of 24</Text>
          <Progress value={100} color="green" aria-label="Checks passed" />
        </Flex>
        <Flex direction="column" gap="2">
          <Text size="2">Storage almost full: 9.6 of 10 GB</Text>
          <Progress value={96} color="red" aria-label="Storage used" />
        </Flex>
      </Flex>
    </Box>
  );
}
