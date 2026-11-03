import { Avatar, Box, Button, Card, Flex, Heading, Text } from '@kushagradhawan/kookie-ui';
import { HugeiconsIcon } from '@hugeicons/react';
import { Mail01Icon } from '@hugeicons/core-free-icons';

export default function ProfileHeader() {
  return (
    <Box width="100%" maxWidth="320px">
      <Card size="3">
        <Flex direction="column" gap="4" align="center">
          <Avatar size="7" fallback="SK" alt="" variant="solid" />
          <Flex direction="column" gap="1" align="center">
            <Heading as="h3" size="4">Sarah Kim</Heading>
            <Text size="2" emphasis="medium">Senior product designer</Text>
          </Flex>
          <Flex gap="2">
            <Button emphasis="quiet" color="gray">Follow</Button>
            <Button emphasis="loud">
              <HugeiconsIcon icon={Mail01Icon} strokeWidth={1.75} />
              Message
            </Button>
          </Flex>
        </Flex>
      </Card>
    </Box>
  );
}
