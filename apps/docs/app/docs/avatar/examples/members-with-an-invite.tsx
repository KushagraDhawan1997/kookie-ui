import { Avatar, Button, Flex } from '@kushagradhawan/kookie-ui';
import { HugeiconsIcon } from '@hugeicons/react';
import { Add01Icon } from '@hugeicons/core-free-icons';

export default function ProjectMembers() {
  return (
    <Flex gap="2" align="center">
      <Avatar fallback="JD" alt="John Doe" variant="soft" radius="full" />
      <Avatar fallback="SK" alt="Sarah Kim" variant="soft" radius="full" />
      <Avatar fallback="AL" alt="Alex Lee" variant="soft" radius="full" />
      <Button
        iconOnly
        variant="outline"
        color="gray"
        radius="full"
        aria-label="Invite a member"
        tooltip="Invite a member"
      >
        <HugeiconsIcon icon={Add01Icon} strokeWidth={1.75} />
      </Button>
    </Flex>
  );
}
