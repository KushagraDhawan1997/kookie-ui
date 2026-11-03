import { Button, Flex, Tooltip } from '@kushagradhawan/kookie-ui';
import { HugeiconsIcon } from '@hugeicons/react';
import { Folder01Icon, Home01Icon, Settings02Icon } from '@hugeicons/core-free-icons';

const items = [
  { label: 'Home', icon: Home01Icon },
  { label: 'Projects', icon: Folder01Icon },
  { label: 'Settings', icon: Settings02Icon },
];

export default function IconRail() {
  return (
    <Flex direction="column" gap="1">
      {items.map((item) => (
        <Tooltip key={item.label} content={item.label} side="right">
          <Button iconOnly emphasis="quiet" aria-label={item.label}>
            <HugeiconsIcon icon={item.icon} strokeWidth={1.75} />
          </Button>
        </Tooltip>
      ))}
    </Flex>
  );
}
