import type * as React from 'react';
import { Box, Button, Flex, MessageScroller, Text } from '@kushagradhawan/kookie-ui';

const messages = Array.from({ length: 12 }, (_, i) => ({ id: `m${i}`, text: `Step ${i + 1} of the deploy finished.` }));

export default function DeployLog() {
  return (
    <MessageScroller.Root style={{ height: '240px', width: '100%' }}>
      <MessageScroller.Viewport aria-label="Deploy log" style={{ '--scroll-fade-end': '56px' } as React.CSSProperties}>
        <MessageScroller.Content>
          {messages.map((message) => (
            <MessageScroller.Item key={message.id} messageId={message.id}>
              <Box px="4" py="2"><Text size="2">{message.text}</Text></Box>
            </MessageScroller.Item>
          ))}
          <Box height="56px" flexShrink="0" />
        </MessageScroller.Content>
      </MessageScroller.Viewport>
      <Flex position="absolute" bottom="0" left="0" right="0" height="56px" align="center" justify="end" px="4">
        <Button size="1" emphasis="loud">Promote to production</Button>
      </Flex>
    </MessageScroller.Root>
  );
}
