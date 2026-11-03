import { Button, DropdownMenu } from '@kushagradhawan/kookie-ui';
import { HugeiconsIcon } from '@hugeicons/react';
import { MoreHorizontalIcon } from '@hugeicons/core-free-icons';

export default function DocumentActions() {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger>
        <Button iconOnly emphasis="quiet" aria-label="Document actions">
          <HugeiconsIcon icon={MoreHorizontalIcon} strokeWidth={1.75} />
        </Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content>
        <DropdownMenu.Item>Rename</DropdownMenu.Item>
        <DropdownMenu.Sub label="Move to">
          <DropdownMenu.SubTrigger>Move to</DropdownMenu.SubTrigger>
          <DropdownMenu.SubContent>
            <DropdownMenu.Item>Drafts</DropdownMenu.Item>
            <DropdownMenu.Item>Archive</DropdownMenu.Item>
          </DropdownMenu.SubContent>
        </DropdownMenu.Sub>
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  );
}
