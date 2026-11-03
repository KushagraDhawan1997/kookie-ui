import { Box, Button, Card, Flex, Heading, Image, Text } from '@kushagradhawan/kookie-ui';

export default function GuideCard() {
  return (
    <Box width="100%" maxWidth="320px">
      <Card>
        <Box mx="bleed" mt="bleed" mb="4">
          <Image src="/playground/image.jpg" alt="White sculpted ribbons" width="100%" height="180px" />
        </Box>
        <Flex direction="column" gap="3">
          <Heading as="h3" size="3">Getting started</Heading>
          <Text size="2" emphasis="medium">
            The basics of building an interface, in six short lessons.
          </Text>
          <Button emphasis="loud">Start the guide</Button>
        </Flex>
      </Card>
    </Box>
  );
}
