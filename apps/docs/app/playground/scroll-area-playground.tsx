'use client';

import React from 'react';
import { Box, Card, Flex, ScrollArea, Text } from '@kushagradhawan/kookie-ui';
import Playground from '@/components/playground';

const scrollbarsOptions = ['vertical', 'horizontal', 'both'] as const;
const radiusOptions = ['none', 'small', 'medium', 'large', 'full'] as const;

const events = [
  { time: '09:12', text: 'Ana Rivera merged “Add billing page” into main' },
  { time: '09:40', text: 'Deploy to production finished in 2 minutes' },
  { time: '10:05', text: 'Leo Park opened an issue about slow search results' },
  { time: '10:31', text: 'Nightly backup completed for all three databases' },
  { time: '11:02', text: 'Mia Chen invited two people to the design team' },
  { time: '11:48', text: 'Error rate on the checkout API fell back under 0.1%' },
  { time: '12:20', text: 'Sam Ortiz changed the plan to Team, billed yearly' },
  { time: '13:07', text: 'A new API key was created for the staging app' },
  { time: '13:55', text: 'Preview deploy for branch “fix/cart-total” is ready' },
  { time: '14:30', text: 'Weekly report sent to 14 subscribers' },
];

type ScrollAreaPlaygroundProps = {
  showControls?: boolean;
  showToolbar?: boolean;
  height?: string;
};

export default function ScrollAreaPlayground({ showControls = false, showToolbar = true, height }: ScrollAreaPlaygroundProps = {}) {
  const [scrollbars, setScrollbars] = React.useState<string>('vertical');
  const [fade, setFade] = React.useState<boolean>(true);
  const [radius, setRadius] = React.useState<string>('theme');

  const scrollsX = scrollbars !== 'vertical';

  const items = [
    {
      id: 'scrollbars',
      label: 'Scrollbars',
      type: 'select' as const,
      value: scrollbars,
      onChange: setScrollbars,
      options: scrollbarsOptions.map((s) => ({ label: s, value: s })),
      placeholder: 'Select scrollbars',
    },
    {
      id: 'fade',
      label: 'Fade',
      type: 'switch' as const,
      value: fade,
      onChange: setFade,
    },
    {
      id: 'radius',
      label: 'Radius',
      type: 'select' as const,
      value: radius,
      onChange: setRadius,
      options: [{ label: 'Theme', value: 'theme' }, ...radiusOptions.map((r) => ({ label: r, value: r }))],
      placeholder: 'Theme',
    },
  ];

  const generateCode = () => {
    const props = [`scrollbars="${scrollbars}"`];
    if (fade) props.push('fade');
    if (radius !== 'theme') props.push(`radius="${radius}"`);
    const contentWidth = scrollsX ? ' width="560px"' : '';

    return `<Box height="240px">
  <ScrollArea ${props.join(' ')}>
    <Flex direction="column" gap="3" p="4"${contentWidth}>
      {events.map((event) => (
        <Flex key={event.time} gap="3">
          <Text size="2" emphasis="quiet">{event.time}</Text>
          <Text size="2">{event.text}</Text>
        </Flex>
      ))}
    </Flex>
  </ScrollArea>
</Box>`;
  };

  return (
    <Playground
      component={
        <Box width="100%" maxWidth="340px" px="4">
          <Card size="1" variant="surface">
            <Box height="240px" m="bleed">
              <ScrollArea scrollbars={scrollbars as any} fade={fade} radius={radius === 'theme' ? undefined : (radius as any)}>
                <Flex direction="column" gap="3" p="4" width={scrollsX ? '560px' : undefined}>
                  {events.map((event) => (
                    <Flex key={event.time} gap="3">
                      <Text size="2" emphasis="quiet" wrap="nowrap">
                        {event.time}
                      </Text>
                      <Text size="2">{event.text}</Text>
                    </Flex>
                  ))}
                </Flex>
              </ScrollArea>
            </Box>
          </Card>
        </Box>
      }
      code={generateCode()}
      items={items}
      showControls={showControls}
      showToolbar={showToolbar}
      height={height}
    />
  );
}
