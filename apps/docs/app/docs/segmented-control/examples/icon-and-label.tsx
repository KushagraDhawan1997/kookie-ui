import { SegmentedControl } from '@kushagradhawan/kookie-ui';
import { HugeiconsIcon } from '@hugeicons/react';
import { GridViewIcon, Menu01Icon } from '@hugeicons/core-free-icons';

export default function FileView() {
  return (
    <SegmentedControl.Root defaultValue="grid" aria-label="View">
      <SegmentedControl.Item value="list">
        <HugeiconsIcon icon={Menu01Icon} strokeWidth={1.75} />
        List
      </SegmentedControl.Item>
      <SegmentedControl.Item value="grid">
        <HugeiconsIcon icon={GridViewIcon} strokeWidth={1.75} />
        Grid
      </SegmentedControl.Item>
    </SegmentedControl.Root>
  );
}
