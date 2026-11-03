import { Box, Text } from '@kushagradhawan/kookie-ui';
import { HugeiconsIcon } from '@hugeicons/react';
import { CommandIcon } from '@hugeicons/core-free-icons';

export default function ShortcutHint() {
  return (
    <Text as="p" size="2">
      Press
      <Box as="span" display="inline-block" mx="2">
        <HugeiconsIcon icon={CommandIcon} size={14} strokeWidth={1.75} />
      </Box>
      K to search the docs.
    </Text>
  );
}
