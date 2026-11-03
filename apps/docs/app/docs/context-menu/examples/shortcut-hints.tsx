import { Box, Card, ContextMenu, Text } from '@kushagradhawan/kookie-ui';
import { HugeiconsIcon } from '@hugeicons/react';
import { Delete01Icon, PencilEdit01Icon } from '@hugeicons/core-free-icons';

export default function FileCardMenu() {
  return (
    <ContextMenu.Root>
      <ContextMenu.Trigger>
        <Box width="100%" maxWidth="320px">
          <Card>
            <Text size="2" weight="medium">Q3 Report.pdf</Text>
          </Card>
        </Box>
      </ContextMenu.Trigger>
      <ContextMenu.Content>
        <ContextMenu.Item shortcut="⏎">
          <HugeiconsIcon icon={PencilEdit01Icon} strokeWidth={1.75} />
          Rename
        </ContextMenu.Item>
        <ContextMenu.Separator />
        <ContextMenu.Item color="red" shortcut="⌘ ⌫">
          <HugeiconsIcon icon={Delete01Icon} strokeWidth={1.75} />
          Move to trash
        </ContextMenu.Item>
      </ContextMenu.Content>
    </ContextMenu.Root>
  );
}
