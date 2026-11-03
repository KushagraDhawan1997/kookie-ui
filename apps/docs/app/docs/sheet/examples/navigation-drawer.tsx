import Link from 'next/link';
import { Button, Flex, Sheet } from '@kushagradhawan/kookie-ui';
import { HugeiconsIcon } from '@hugeicons/react';
import { Menu01Icon } from '@hugeicons/core-free-icons';

export default function AppMenu() {
  return (
    <Sheet.Root>
      <Sheet.Trigger>
        <Button iconOnly emphasis="quiet" aria-label="Menu">
          <HugeiconsIcon icon={Menu01Icon} strokeWidth={1.75} />
        </Button>
      </Sheet.Trigger>
      <Sheet.Content side="start" width="280px" aria-label="Navigation">
        <Flex direction="column" gap="1">
          <Button emphasis="quiet" fullWidth asChild>
            <Link href="/docs/sheet">Projects</Link>
          </Button>
          <Button emphasis="quiet" fullWidth asChild>
            <Link href="/docs/sheet">Settings</Link>
          </Button>
        </Flex>
      </Sheet.Content>
    </Sheet.Root>
  );
}
