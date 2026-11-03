import { Box, Card, Flex, Image, Text } from '@kushagradhawan/kookie-ui';

export default function CustomerCard() {
  return (
    <Box width="100%" maxWidth="320px">
      <Card>
        <Flex direction="column" gap="3">
          <Image
            src="/logos/kookie-ui/kookie-ui.png"
            alt="Kookie UI"
            width="120px"
            height="40px"
            fit="contain"
          />
          <Text size="2" emphasis="medium">Customer since 2023, on the Pro plan.</Text>
        </Flex>
      </Card>
    </Box>
  );
}
