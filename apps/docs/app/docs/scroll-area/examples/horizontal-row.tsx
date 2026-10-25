import { Box, Chip, Flex, ScrollArea } from '@kushagradhawan/kookie-ui';

const filters = ['All', 'Design', 'Engineering', 'Marketing', 'Sales', 'Support', 'Finance', 'Legal', 'Operations'];

export default function TeamFilters() {
  return (
    <Box width="100%" maxWidth="360px">
      <ScrollArea scrollbars="horizontal">
        <Flex gap="2" pb="3">
          {filters.map((filter) => (
            <Chip key={filter}>{filter}</Chip>
          ))}
        </Flex>
      </ScrollArea>
    </Box>
  );
}
