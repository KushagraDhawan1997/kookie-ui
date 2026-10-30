import { Blockquote, Box, Card, Flex, Heading, Text } from '@kushagradhawan/kookie-ui';

export default function ProductReview() {
  return (
    <Box width="100%" maxWidth="320px">
      <Card>
        <Flex direction="column" gap="2">
          <Heading as="h3" size="3">Northwind Desk</Heading>
          <Blockquote size="2" emphasis="medium">
            Setup took ten minutes, and the team never asked for the old tool back.
          </Blockquote>
          <Text size="1" emphasis="medium">Priya Raman, Head of Support</Text>
        </Flex>
      </Card>
    </Box>
  );
}
