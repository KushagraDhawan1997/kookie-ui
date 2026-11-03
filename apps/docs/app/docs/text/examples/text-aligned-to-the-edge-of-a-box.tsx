import { Box, Card, Flex, Text } from '@kushagradhawan/kookie-ui';
import { HugeiconsIcon } from '@hugeicons/react';
import { Calendar03Icon } from '@hugeicons/core-free-icons';

export default function RenewalNotice() {
  return (
    <Box width="100%" maxWidth="320px">
      <Card>
        <Flex align="center" gap="2">
          <HugeiconsIcon icon={Calendar03Icon} strokeWidth={1.75} />
          <Text as="p" size="3" trim="both">
            Your plan renews on 1 March.
          </Text>
        </Flex>
      </Card>
    </Box>
  );
}
