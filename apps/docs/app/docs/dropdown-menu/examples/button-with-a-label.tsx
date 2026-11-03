import { Button, DropdownMenu } from '@kushagradhawan/kookie-ui';

export default function ExportMenu() {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger>
        <Button>
          Export
          <DropdownMenu.TriggerIcon />
        </Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content>
        <DropdownMenu.Item>PDF</DropdownMenu.Item>
        <DropdownMenu.Item>CSV</DropdownMenu.Item>
        <DropdownMenu.Item>PNG</DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  );
}
