import { Button, Flex, Separator } from '@kushagradhawan/kookie-ui';
import { HugeiconsIcon } from '@hugeicons/react';
import { Link01Icon, TextBoldIcon, TextItalicIcon } from '@hugeicons/core-free-icons';

export default function FormattingToolbar() {
  return (
    <Flex gap="2">
      <Button iconOnly emphasis="quiet" aria-label="Bold">
        <HugeiconsIcon icon={TextBoldIcon} strokeWidth={1.75} />
      </Button>
      <Button iconOnly emphasis="quiet" aria-label="Italic">
        <HugeiconsIcon icon={TextItalicIcon} strokeWidth={1.75} />
      </Button>
      <Separator orientation="vertical" />
      <Button iconOnly emphasis="quiet" aria-label="Insert link">
        <HugeiconsIcon icon={Link01Icon} strokeWidth={1.75} />
      </Button>
    </Flex>
  );
}
