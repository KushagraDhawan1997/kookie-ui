import { Avatar, Button, DropdownMenu } from '@kushagradhawan/kookie-ui';
import { HugeiconsIcon } from '@hugeicons/react';
import { Logout01Icon, Settings01Icon } from '@hugeicons/core-free-icons';

export default function AccountMenu() {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger>
        <Button emphasis="quiet" color="gray">
          <Avatar size="1" fallback="AR" />
          Ana Ruiz
        </Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content>
        <DropdownMenu.Group>
          <DropdownMenu.Label>ana@example.com</DropdownMenu.Label>
          <DropdownMenu.Item>
            <HugeiconsIcon icon={Settings01Icon} strokeWidth={1.75} />
            Settings
          </DropdownMenu.Item>
        </DropdownMenu.Group>
        <DropdownMenu.Separator />
        <DropdownMenu.Item>
          <HugeiconsIcon icon={Logout01Icon} strokeWidth={1.75} />
          Sign out
        </DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  );
}
