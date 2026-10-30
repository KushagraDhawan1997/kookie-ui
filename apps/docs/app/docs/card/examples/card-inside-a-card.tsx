import { Box, Card, Flex, Heading, Text } from '@kushagradhawan/kookie-ui';

export default function UsageCard() {
  return (
    <Box width="100%" maxWidth="360px">
      <Card size="3">
        <Flex direction="column" gap="3">
          <Heading as="h3" size="3">Storage</Heading>
          <Card variant="soft" size="1">
            <Flex justify="between">
              <Text size="2">Used</Text>
              <Text size="2" weight="medium">2.4 GB of 5 GB</Text>
            </Flex>
          </Card>
        </Flex>
      </Card>
    </Box>
  );
}
