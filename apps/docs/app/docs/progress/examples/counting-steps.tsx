import { Box, Flex, Progress, Text } from '@kushagradhawan/kookie-ui';

export default function ContactImport() {
  return (
    <Box width="100%" maxWidth="320px">
      <Flex direction="column" gap="2">
        <Text size="2">Importing contacts: 3 of 12 files</Text>
        <Progress
          value={3}
          max={12}
          aria-label="Importing contacts"
          getValueLabel={(value, max) => `${value} of ${max} files`}
        />
      </Flex>
    </Box>
  );
}
