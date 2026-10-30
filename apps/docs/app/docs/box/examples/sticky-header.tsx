import { Box, Button, Card, Flex, Heading, Text } from '@kushagradhawan/kookie-ui';

const entries = ['API keys can expire', 'New usage page', 'Faster search', 'Dark mode for email', 'CSV export'];

export default function ChangelogPanel() {
  return (
    <Box width="100%" maxWidth="360px" height="240px" overflowY="auto" p="2">
      <Box position="sticky" top="0">
        <Card size="1">
          <Flex justify="between" align="center">
            <Heading as="h3" size="3">Changelog</Heading>
            <Button size="1" emphasis="quiet">Mark all read</Button>
          </Flex>
        </Card>
      </Box>
      {entries.map((entry) => (
        <Box key={entry} px="3" py="5">
          <Text size="2">{entry}</Text>
        </Box>
      ))}
    </Box>
  );
}
