import { Button, Tooltip } from '@kushagradhawan/kookie-ui';
import { HugeiconsIcon } from '@hugeicons/react';
import { TextBoldIcon } from '@hugeicons/core-free-icons';

export default function BoldButton() {
  return (
    <Tooltip content="Bold ⌘B">
      <Button iconOnly emphasis="quiet" aria-label="Bold">
        <HugeiconsIcon icon={TextBoldIcon} strokeWidth={1.75} />
      </Button>
    </Tooltip>
  );
}
