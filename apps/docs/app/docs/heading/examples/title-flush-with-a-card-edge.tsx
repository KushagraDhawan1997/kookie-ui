import { Box, Card, Flex, Heading, Text } from '@kushagradhawan/kookie-ui';

export default function InvoiceCard() {
  return (
    <Box width="100%" maxWidth="320px">
      <Card>
        <Flex direction="column" gap="2">
          <Heading as="h3" size="4" trim="start">Invoice 0142</Heading>
          <Text size="2" emphasis="medium">Due on 12 November</Text>
        </Flex>
      </Card>
    </Box>
  );
}
