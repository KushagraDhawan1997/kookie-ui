import { Button, DropdownMenu } from '@kushagradhawan/kookie-ui';
import { HugeiconsIcon } from '@hugeicons/react';
import { MoreHorizontalIcon } from '@hugeicons/core-free-icons';

export default function FileActions() {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger>
        <Button iconOnly emphasis="quiet" aria-label="File actions">
          <HugeiconsIcon icon={MoreHorizontalIcon} strokeWidth={1.75} />
        </Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content>
        <DropdownMenu.Item shortcut="⌘ R">Rename</DropdownMenu.Item>
        <DropdownMenu.Item shortcut="⌘ D">Duplicate</DropdownMenu.Item>
        <DropdownMenu.Separator />
        <DropdownMenu.Item color="red" shortcut="⌘ ⌫">Move to trash</DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  );
}
