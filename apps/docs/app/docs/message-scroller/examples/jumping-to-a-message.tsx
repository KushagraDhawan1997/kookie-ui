import { Box, Button, Flex, MessageScroller, Text } from '@kushagradhawan/kookie-ui';

const messages = Array.from({ length: 12 }, (_, i) => ({
  id: `m${i}`,
  text: i === 2 ? 'The launch moves to Thursday, 14 March.' : `Standup note ${i + 1}: no blockers today.`,
}));

function SearchResult() {
  const { scrollToMessage } = MessageScroller.useMessageScroller();
  return (
    <Button size="1" emphasis="quiet" onClick={() => scrollToMessage('m2', { align: 'center', behavior: 'smooth' })}>
      Find “launch”
    </Button>
  );
}

export default function TeamChannel() {
  return (
    <MessageScroller.Root style={{ height: '240px', width: '100%' }}>
      <Flex justify="end" p="2"><SearchResult /></Flex>
      <MessageScroller.Viewport aria-label="Team channel">
        <MessageScroller.Content>
          {messages.map((message) => (
            <MessageScroller.Item key={message.id} messageId={message.id}>
              <Box px="4" py="2"><Text size="2">{message.text}</Text></Box>
            </MessageScroller.Item>
          ))}
        </MessageScroller.Content>
      </MessageScroller.Viewport>
    </MessageScroller.Root>
  );
}
