'use client';

import React from 'react';
import { Box, Card, Heading, Image, Text } from '@kushagradhawan/kookie-ui';
import Playground from '@/components/playground';

const spaces = ['0', '1', '2', '3', '4', '5', '6'] as const;
const maxWidths = ['240px', '280px', '320px'] as const;

type BoxPlaygroundProps = {
  showControls?: boolean;
  showToolbar?: boolean;
  height?: string;
};

export default function BoxPlayground({ showControls = false, showToolbar = true, height }: BoxPlaygroundProps = {}) {
  const [bleed, setBleed] = React.useState<boolean>(true);
  const [mt, setMt] = React.useState<string>('3');
  const [maxWidth, setMaxWidth] = React.useState<string>('280px');

  const items = [
    {
      id: 'bleed',
      label: 'Bleed cover',
      type: 'switch' as const,
      value: bleed,
      onChange: setBleed,
    },
    {
      id: 'mt',
      label: 'Text margin top',
      type: 'select' as const,
      value: mt,
      onChange: setMt,
      options: spaces.map((s) => ({ label: s, value: s })),
      placeholder: 'Select space',
    },
    {
      id: 'max-width',
      label: 'Max width',
      type: 'select' as const,
      value: maxWidth,
      onChange: setMaxWidth,
      options: maxWidths.map((w) => ({ label: w, value: w })),
      placeholder: 'Select width',
    },
  ];

  const generateCode = () => {
    const coverProps = bleed ? ' mx="bleed" mt="bleed"' : '';

    return `<Box maxWidth="${maxWidth}">
  <Card size="2">
    <Box${coverProps}>
      <Image src="/cover.jpg" alt="" width="100%" height="120px" />
    </Box>
    <Box mt="${mt}">
      <Heading size="3">Spring release</Heading>
      <Text size="2" emphasis="medium">Twelve new components and a faster theme.</Text>
    </Box>
  </Card>
</Box>`;
  };

  return (
    <Playground
      component={
        <Box width="100%" maxWidth={maxWidth}>
          <Card size="2">
            <Box mx={bleed ? 'bleed' : undefined} mt={bleed ? 'bleed' : undefined}>
              <Image src="/playground/image.jpg" alt="" width="100%" height="120px" />
            </Box>
            <Box mt={mt as any}>
              <Heading size="3">Spring release</Heading>
              <Text as="p" size="2" emphasis="medium">
                Twelve new components and a faster theme.
              </Text>
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
