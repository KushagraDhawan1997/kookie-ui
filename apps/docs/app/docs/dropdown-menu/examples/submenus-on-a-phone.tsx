import { Button, DropdownMenu } from '@kushagradhawan/kookie-ui';
import { HugeiconsIcon } from '@hugeicons/react';
import { Add01Icon } from '@hugeicons/core-free-icons';

export default function NewItemMenu() {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger>
        <Button>
          <HugeiconsIcon icon={Add01Icon} strokeWidth={1.75} />
          New
        </Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content submenuBehavior={{ initial: 'drill-down', md: 'cascade' }}>
        <DropdownMenu.Item>File</DropdownMenu.Item>
        <DropdownMenu.Item>Folder</DropdownMenu.Item>
        <DropdownMenu.Sub label="From a template">
          <DropdownMenu.SubTrigger>From a template</DropdownMenu.SubTrigger>
          <DropdownMenu.SubContent>
            <DropdownMenu.Item>Meeting notes</DropdownMenu.Item>
            <DropdownMenu.Item>Project brief</DropdownMenu.Item>
          </DropdownMenu.SubContent>
        </DropdownMenu.Sub>
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  );
}
