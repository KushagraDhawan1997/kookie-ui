import { Box, Card, ContextMenu, Text } from '@kushagradhawan/kookie-ui';

export default function MessageMenu() {
  return (
    <ContextMenu.Root>
      <ContextMenu.Trigger>
        <Box width="100%" maxWidth="320px">
          <Card>
            <Text size="2">Right-click the message to file it</Text>
          </Card>
        </Box>
      </ContextMenu.Trigger>
      <ContextMenu.Content>
        <ContextMenu.Item>Reply</ContextMenu.Item>
        <ContextMenu.Sub>
          <ContextMenu.SubTrigger>Move to</ContextMenu.SubTrigger>
          <ContextMenu.SubContent>
            <ContextMenu.Item>Drafts</ContextMenu.Item>
            <ContextMenu.Item>Archive</ContextMenu.Item>
          </ContextMenu.SubContent>
        </ContextMenu.Sub>
      </ContextMenu.Content>
    </ContextMenu.Root>
  );
}
