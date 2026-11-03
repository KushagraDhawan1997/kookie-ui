import { Box, Button, Card, Flex, Heading, Text } from '@kushagradhawan/kookie-ui';
import { HugeiconsIcon } from '@hugeicons/react';
import { Delete01Icon } from '@hugeicons/core-free-icons';

export default function DeleteProjectCard() {
  return (
    <Box width="100%" maxWidth="380px">
      <Card>
        <Flex direction="column" gap="3">
          <Heading as="h3" size="3">Delete project</Heading>
          <Text size="2" emphasis="medium">
            Removes Atlas and its 24 files for everyone on the team.
          </Text>
          <Flex gap="2" justify="end">
            <Button emphasis="quiet" color="gray">
              Keep project
            </Button>
            <Button color="red">
              <HugeiconsIcon icon={Delete01Icon} strokeWidth={1.75} />
              Delete project
            </Button>
          </Flex>
        </Flex>
      </Card>
    </Box>
  );
}
