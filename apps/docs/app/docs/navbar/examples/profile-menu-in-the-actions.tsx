import Link from 'next/link';
import { Button, DropdownMenu, Navbar, Text } from '@kushagradhawan/kookie-ui';
import { HugeiconsIcon } from '@hugeicons/react';
import { Notification01Icon } from '@hugeicons/core-free-icons';

export default function DashboardHeader() {
  return (
    <Navbar.Root position="static">
      <Navbar.Logo asChild>
        <Link href="/" aria-label="Acme home">
          <Text weight="medium">Acme</Text>
        </Link>
      </Navbar.Logo>
      <Navbar.Actions>
        <Button iconOnly emphasis="quiet" aria-label="Notifications" tooltip="Notifications">
          <HugeiconsIcon icon={Notification01Icon} strokeWidth={1.75} />
        </Button>
        <DropdownMenu.Root>
          <DropdownMenu.Trigger>
            <Button emphasis="quiet">Account</Button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Content>
            <DropdownMenu.Item>Profile</DropdownMenu.Item>
            <DropdownMenu.Item>Settings</DropdownMenu.Item>
            <DropdownMenu.Separator />
            <DropdownMenu.Item color="red">Sign out</DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Root>
      </Navbar.Actions>
    </Navbar.Root>
  );
}
