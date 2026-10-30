import { Button, Flex, Sheet } from '@kushagradhawan/kookie-ui';
import { HugeiconsIcon } from '@hugeicons/react';
import { Copy01Icon, Share08Icon } from '@hugeicons/core-free-icons';

export default function ShareSheet() {
  return (
    <Sheet.Root>
      <Sheet.Trigger>
        <Button>
          <HugeiconsIcon icon={Share08Icon} strokeWidth={1.75} />
          Share
        </Button>
      </Sheet.Trigger>
      <Sheet.Content side="bottom" height="auto" aria-label="Share">
        <Flex direction="column" gap="2">
          <Button fullWidth>
            <HugeiconsIcon icon={Copy01Icon} strokeWidth={1.75} />
            Copy link
          </Button>
          <Sheet.Close>
            <Button emphasis="quiet" color="gray" fullWidth>Cancel</Button>
          </Sheet.Close>
        </Flex>
      </Sheet.Content>
    </Sheet.Root>
  );
}
