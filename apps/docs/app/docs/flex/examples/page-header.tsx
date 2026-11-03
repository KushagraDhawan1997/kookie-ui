import { Button, Flex, Heading } from '@kushagradhawan/kookie-ui';
import { HugeiconsIcon } from '@hugeicons/react';
import { Add01Icon } from '@hugeicons/core-free-icons';

export default function ProjectsHeader() {
  return (
    <Flex justify="between" align="center" gap="3" width="100%">
      <Heading as="h1" size="5">Projects</Heading>
      <Button emphasis="loud">
        <HugeiconsIcon icon={Add01Icon} strokeWidth={1.75} />
        New project
      </Button>
    </Flex>
  );
}
