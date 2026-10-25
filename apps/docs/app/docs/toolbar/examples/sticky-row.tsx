import { Box, Flex, Text, Toolbar } from '@kushagradhawan/kookie-ui';

const lines = Array.from({ length: 12 }, (_, index) => `Paragraph ${index + 1} of the draft.`);

export default function DraftEditor() {
  return (
    <Box width="100%" maxWidth="360px" height="200px" overflow="auto">
      <Toolbar aria-label="Formatting" position="sticky" top="0" px="3" backdrop>
        <Toolbar.Title>Draft</Toolbar.Title>
        <Toolbar.Button>Share</Toolbar.Button>
      </Toolbar>
      <Flex direction="column" gap="2" px="3">
        {lines.map((line) => (
          <Text as="p" key={line} size="2">
            {line}
          </Text>
        ))}
      </Flex>
    </Box>
  );
}
