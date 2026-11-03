import { Box, Flex, Heading, ScrollArea, Text } from '@kushagradhawan/kookie-ui';

const sections = ['Your account', 'Payments', 'Content you share', 'Ending the service', 'Changes to these terms'];

export default function TermsOfService() {
  return (
    <Box width="100%" maxWidth="360px">
      <ScrollArea height="200px" aria-label="Terms of service">
        <Flex direction="column" gap="3" pr="3">
          {sections.map((title) => (
            <Flex key={title} direction="column" gap="1">
              <Heading as="h3" size="2">{title}</Heading>
              <Text as="p" size="2" emphasis="medium">
                You keep the rights to what you upload. We only use it to run the service for you.
              </Text>
            </Flex>
          ))}
        </Flex>
      </ScrollArea>
    </Box>
  );
}
