import { Box, Flex, Heading, Text } from '@kushagradhawan/kookie-ui';

export default function BillingSection() {
  return (
    <Box asChild p="4" maxWidth="420px">
      <section aria-labelledby="billing-heading">
        <Flex direction="column" gap="2">
          <Heading as="h2" id="billing-heading" size="4">Billing</Heading>
          <Text as="p" size="2" emphasis="medium">
            Your next invoice is due on 1 November.
          </Text>
        </Flex>
      </section>
    </Box>
  );
}
