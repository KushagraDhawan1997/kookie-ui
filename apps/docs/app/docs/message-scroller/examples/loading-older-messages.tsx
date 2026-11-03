import * as React from 'react';
import { Box, Button, Flex, MessageScroller, Text } from '@kushagradhawan/kookie-ui';

const history = [
  'Hi, my invoice for March shows two charges.',
  'Thanks, let me look into that.',
  'I see one charge for the plan and one for extra seats.',
  'We added two seats mid-month.',
  'That explains it. The seats are billed from the day you added them.',
  'Can I get a single invoice next month?',
  'Yes, from April both appear on one invoice.',
  'Great, thank you.',
].map((text, i) => ({ id: `m${i}`, text }));

export default function SupportThread() {
  const [shown, setShown] = React.useState(4);
  const messages = history.slice(-shown);

  return (
    <MessageScroller.Root style={{ height: '240px', width: '100%' }}>
      <MessageScroller.Viewport aria-label="Support thread">
        <MessageScroller.Content>
          <Flex justify="center" py="2">
            <Button size="1" emphasis="quiet" disabled={shown >= history.length} onClick={() => setShown(history.length)}>
              Load older messages
            </Button>
          </Flex>
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
