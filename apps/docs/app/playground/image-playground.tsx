'use client';

import React from 'react';
import { Box, Card, Flex, Image, Text } from '@kushagradhawan/kookie-ui';
import Playground from '@/components/playground';

const fits = ['cover', 'contain', 'fill', 'scale-down', 'none'] as const;
const radiusOptions = ['none', 'small', 'medium', 'large', 'full'] as const;
const heights = ['120px', '160px', '200px'] as const;

type ImagePlaygroundProps = {
  showControls?: boolean;
  showToolbar?: boolean;
  height?: string;
};

export default function ImagePlayground({ showControls = false, showToolbar = true, height }: ImagePlaygroundProps = {}) {
  const [fit, setFit] = React.useState<string>('cover');
  const [radius, setRadius] = React.useState<string>('theme');
  const [imageHeight, setImageHeight] = React.useState<string>('160px');

  const items = [
    {
      id: 'fit',
      label: 'Fit',
      type: 'select' as const,
      value: fit,
      onChange: setFit,
      options: fits.map((f) => ({ label: f, value: f })),
      placeholder: 'Select fit',
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
    {
      id: 'height',
      label: 'Height',
      type: 'select' as const,
      value: imageHeight,
      onChange: setImageHeight,
      options: heights.map((h) => ({ label: h, value: h })),
      placeholder: 'Select height',
    },
  ];

  const generateCode = () => {
    const props = ['src="/listings/loft.jpg"', 'alt="A bright room with tall windows"', 'width="100%"', `height="${imageHeight}"`];
    if (fit !== 'cover') props.push(`fit="${fit}"`);
    if (radius !== 'theme') props.push(`radius="${radius}"`);

    return `<Card size="2">
  <Flex direction="column" gap="3">
    <Image
      ${props.join('\n      ')}
    />
    <Flex direction="column" gap="1">
      <Text size="2" weight="medium">Riverside loft</Text>
      <Text size="2" emphasis="medium">2 beds, from $180 a night</Text>
    </Flex>
  </Flex>
</Card>`;
  };

  return (
    <Playground
      component={
        <Box width="280px">
          <Card size="2">
            <Flex direction="column" gap="3">
              <Image src="/playground/image.jpg" alt="A bright room with tall windows" width="100%" height={imageHeight} fit={fit as any} radius={radius === 'theme' ? undefined : (radius as any)} />
              <Flex direction="column" gap="1">
                <Text size="2" weight="medium">
                  Riverside loft
                </Text>
                <Text size="2" emphasis="medium">
                  2 beds, from $180 a night
                </Text>
              </Flex>
            </Flex>
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
