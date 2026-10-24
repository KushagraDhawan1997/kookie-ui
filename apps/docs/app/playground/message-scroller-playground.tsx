'use client';

import React from 'react';
import { Box, Button, Flex, MessageScroller, Text } from '@kushagradhawan/kookie-ui';
import { HugeiconsIcon } from '@hugeicons/react';
import { SentIcon } from '@hugeicons/core-free-icons';
import Playground from '@/components/playground';

const scrollPositions = ['end', 'start', 'last-anchor'] as const;

type Message = { id: string; role: 'user' | 'assistant'; text: string };

const seedMessages: Message[] = [
  { id: 'm1', role: 'user', text: 'Can you summarise the launch plan?' },
  { id: 'm2', role: 'assistant', text: 'The launch is in three stages: a private beta for 200 teams, a public waitlist two weeks later, and general availability at the end of the month.' },
  { id: 'm3', role: 'user', text: 'What are the risks?' },
  { id: 'm4', role: 'assistant', text: 'The main risk is support load during the waitlist. The second is the billing migration, which has to finish before general availability.' },
  { id: 'm5', role: 'user', text: 'Who owns the billing migration?' },
  { id: 'm6', role: 'assistant', text: 'Priya owns it, with a review from finance on the 14th.' },
];

const questions = ['Draft an email to the beta teams.', 'What should we measure in week one?', 'Make the timeline shorter.'];
const reply =
  'Here is a first pass. Start with what changes for them, then the dates, then where to send questions. Keep it under 150 words, and link the full plan at the end so the email stays short. I can tighten the tone once you have read it.';

const DEFAULT_HEIGHT = '30rem';

type MessageScrollerPlaygroundProps = {
  showControls?: boolean;
  showToolbar?: boolean;
  height?: string;
};

export default function MessageScrollerPlayground({ showControls = false, showToolbar = true, height = DEFAULT_HEIGHT }: MessageScrollerPlaygroundProps = {}) {
  const [autoScroll, setAutoScroll] = React.useState(true);
  const [defaultScrollPosition, setDefaultScrollPosition] = React.useState<(typeof scrollPositions)[number]>('end');
  const [anchor, setAnchor] = React.useState(true);
  const [fade, setFade] = React.useState(true);
  const [messages, setMessages] = React.useState<Message[]>(seedMessages);
  const [streaming, setStreaming] = React.useState(false);
  const timer = React.useRef<number | undefined>(undefined);

  React.useEffect(() => () => window.clearInterval(timer.current), []);

  // Sends the next question, then streams the reply a few words at a time.
  const send = () => {
    if (streaming) return;
    const count = messages.length;
    const question = questions[Math.floor(count / 2) % questions.length];
    const replyId = `m${count + 2}`;
    setMessages((prev) => [...prev, { id: `m${count + 1}`, role: 'user', text: question }, { id: replyId, role: 'assistant', text: '' }]);
    setStreaming(true);
    const words = reply.split(' ');
    let shown = 0;
    timer.current = window.setInterval(() => {
      shown = Math.min(words.length, shown + 3);
      const text = words.slice(0, shown).join(' ');
      setMessages((prev) => prev.map((m) => (m.id === replyId ? { ...m, text } : m)));
      if (shown >= words.length) {
        window.clearInterval(timer.current);
        setStreaming(false);
      }
    }, 120);
  };

  const generateCode = () => {
    const rootProps = ['style={{ height: \'100%\' }}'];
    if (!autoScroll) rootProps.push('autoScroll={false}');
    if (defaultScrollPosition !== 'end') rootProps.push(`defaultScrollPosition="${defaultScrollPosition}"`);

    const viewportProps = ['aria-label="Conversation"'];
    if (!fade) viewportProps.push('fade={false}');

    const itemProps = ['key={message.id}', 'messageId={message.id}'];
    if (anchor) itemProps.push("scrollAnchor={message.role === 'user'}");

    return `import { Box, Flex, MessageScroller, Text } from '@kushagradhawan/kookie-ui';

type Message = { id: string; role: 'user' | 'assistant'; text: string };

export function Conversation({ messages }: { messages: Message[] }) {
  return (
    <MessageScroller.Root
      ${rootProps.join('\n      ')}
    >
      <MessageScroller.Viewport ${viewportProps.join(' ')}>
        <MessageScroller.Content>
          {messages.map((message) => (
            <MessageScroller.Item
              ${itemProps.join('\n              ')}
            >
              <Flex justify={message.role === 'user' ? 'end' : 'start'} px="4" py="2">
                <Box maxWidth="80%">
                  <Text size="2">{message.text}</Text>
                </Box>
              </Flex>
            </MessageScroller.Item>
          ))}
        </MessageScroller.Content>
      </MessageScroller.Viewport>
      <MessageScroller.Button />
    </MessageScroller.Root>
  );
}`;
  };

  const component = (
    <Flex
      direction="column"
      width="100%"
      maxWidth="560px"
      height={`calc(${height} - 2 * var(--preview-block-padding))`}
      overflow="hidden"
      style={{ border: '1px solid var(--neutral-a4)', borderRadius: 'var(--radius-4)' }}
    >
      <Box flexGrow="1" minHeight="0">
        {/* Where the transcript opens is read once, so a new value remounts it. */}
        <MessageScroller.Root key={defaultScrollPosition} autoScroll={autoScroll} defaultScrollPosition={defaultScrollPosition} style={{ height: '100%' }}>
          <MessageScroller.Viewport aria-label="Conversation" fade={fade}>
            <MessageScroller.Content>
              {messages.map((message) => (
                <MessageScroller.Item key={message.id} messageId={message.id} scrollAnchor={anchor && message.role === 'user'}>
                  <Flex justify={message.role === 'user' ? 'end' : 'start'} px="4" py="2">
                    {message.role === 'user' ? (
                      <Box maxWidth="80%" px="3" py="2" style={{ background: 'var(--accent-a3)', borderRadius: 'var(--radius-4)' }}>
                        <Text size="2">{message.text}</Text>
                      </Box>
                    ) : (
                      <Box maxWidth="80%">
                        <Text size="2">{message.text || '...'}</Text>
                      </Box>
                    )}
                  </Flex>
                </MessageScroller.Item>
              ))}
            </MessageScroller.Content>
          </MessageScroller.Viewport>
          <MessageScroller.Button />
        </MessageScroller.Root>
      </Box>
      <Flex align="center" justify="between" gap="3" px="4" py="3" style={{ borderTop: '1px solid var(--neutral-a4)' }}>
        <Text size="2" emphasis="medium">
          Scroll up, then send, to see it stay put.
        </Text>
        <Button size="2" emphasis="loud" onClick={send} loading={streaming}>
          <HugeiconsIcon icon={SentIcon} strokeWidth={1.75} />
          Send
        </Button>
      </Flex>
    </Flex>
  );

  const items = [
    {
      id: 'autoScroll',
      label: 'Auto scroll',
      type: 'switch' as const,
      value: autoScroll,
      onChange: setAutoScroll,
    },
    {
      id: 'defaultScrollPosition',
      label: 'Opens at',
      type: 'select' as const,
      value: defaultScrollPosition,
      onChange: (next: string) => setDefaultScrollPosition(next as (typeof scrollPositions)[number]),
      options: scrollPositions.map((option) => ({ label: option, value: option })),
      placeholder: 'Position',
    },
    {
      id: 'anchor',
      label: 'Anchor user messages',
      type: 'switch' as const,
      value: anchor,
      onChange: setAnchor,
    },
    {
      id: 'fade',
      label: 'Fade',
      type: 'switch' as const,
      value: fade,
      onChange: setFade,
    },
  ];

  return <Playground component={component} code={generateCode()} items={items} showControls={showControls} showToolbar={showToolbar} height={height} />;
}
