import { SegmentedControl } from '@kushagradhawan/kookie-ui';
import { HugeiconsIcon } from '@hugeicons/react';
import { TextAlignCenterIcon, TextAlignLeftIcon, TextAlignRightIcon } from '@hugeicons/core-free-icons';

export default function TextAlignment() {
  return (
    <SegmentedControl.Root defaultValue="left" aria-label="Text alignment">
      <SegmentedControl.Item value="left" iconOnly aria-label="Align left">
        <HugeiconsIcon icon={TextAlignLeftIcon} strokeWidth={1.75} />
      </SegmentedControl.Item>
      <SegmentedControl.Item value="center" iconOnly aria-label="Align centre">
        <HugeiconsIcon icon={TextAlignCenterIcon} strokeWidth={1.75} />
      </SegmentedControl.Item>
      <SegmentedControl.Item value="right" iconOnly aria-label="Align right">
        <HugeiconsIcon icon={TextAlignRightIcon} strokeWidth={1.75} />
      </SegmentedControl.Item>
    </SegmentedControl.Root>
  );
}
