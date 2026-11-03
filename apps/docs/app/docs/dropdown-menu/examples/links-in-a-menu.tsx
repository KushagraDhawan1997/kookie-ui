import Link from 'next/link';
import { Button, DropdownMenu } from '@kushagradhawan/kookie-ui';

export default function HelpMenu() {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger>
        <Button emphasis="quiet" color="gray">
          Help
          <DropdownMenu.TriggerIcon />
        </Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content>
        <DropdownMenu.Item asChild>
          <Link href="/start/installation">Installation</Link>
        </DropdownMenu.Item>
        <DropdownMenu.Item asChild>
          <Link href="/start/theming">Theming</Link>
        </DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  );
}
