'use client';

import * as React from 'react';
import { Box, Button, Card, Flex } from '@kushagradhawan/kookie-ui';
import { HugeiconsIcon } from '@hugeicons/react';
import { PlayIcon, RefreshIcon } from '@hugeicons/core-free-icons';
import { StreamingMarkdown } from '@/components/blocks/streaming-markdown/streaming-markdown';

const RESPONSE = [
  'Here is how to add a **loading state** to a button:',
  '',
  '```tsx',
  '<Button loading={isSaving} onClick={save}>',
  '  Save changes',
  '</Button>',
  '```',
  '',
  'While `loading` is true the button:',
  '',
  '- Shows a spinner in place of its content',
  '- Keeps its width, so the layout does not shift',
  '- Ignores clicks until the request settles',
].join('\n');

const CHARACTERS_PER_TICK = 3;
const TICK_MS = 24;

/** Replays a canned response a few characters at a time, like a model streaming tokens. */
export function StreamingDemo() {
  const [length, setLength] = React.useState(0);
  const [isRunning, setIsRunning] = React.useState(false);
  const isStreaming = isRunning && length < RESPONSE.length;

  React.useEffect(() => {
    if (!isStreaming) return;
    const interval = window.setInterval(() => {
      setLength((previous) => Math.min(previous + CHARACTERS_PER_TICK, RESPONSE.length));
    }, TICK_MS);
    return () => window.clearInterval(interval);
  }, [isStreaming]);

  const start = () => {
    setLength(0);
    setIsRunning(true);
  };

  const hasStarted = length > 0;

  return (
    <Flex direction="column" gap="3" width="100%" maxWidth="32rem">
      <Card variant="classic" size="2">
        <Box minHeight="12rem">
          <StreamingMarkdown id="demo" content={RESPONSE.slice(0, length)} options={{ spacing: 'compact' }} />
        </Box>
      </Card>
      <Flex justify="end">
        <Button variant="soft" color="gray" highContrast size="2" onClick={start} disabled={isStreaming}>
          <HugeiconsIcon icon={hasStarted ? RefreshIcon : PlayIcon} strokeWidth={1.75} />
          {hasStarted ? 'Replay' : 'Stream response'}
        </Button>
      </Flex>
    </Flex>
  );
}
