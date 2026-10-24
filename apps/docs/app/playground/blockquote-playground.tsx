'use client';

import React from 'react';
import { Blockquote, Flex, Text } from '@kushagradhawan/kookie-ui';
import Playground from '@/components/playground';

const sizes = ['1', '2', '3', '4', '5', '6', '7', '8', '9'] as const;
const weights = ['regular', 'medium', 'semibold'] as const;
const emphases = ['loud', 'medium', 'quiet'] as const;
const accentColors = ['gray', 'gold', 'amber', 'crimson', 'plum', 'iris', 'blue', 'teal', 'jade', 'grass'] as const;

type BlockquotePlaygroundProps = {
  showControls?: boolean;
  showToolbar?: boolean;
  height?: string;
};

export default function BlockquotePlayground({ showControls = false, showToolbar = true, height }: BlockquotePlaygroundProps = {}) {
  const [size, setSize] = React.useState<string>('3');
  const [weight, setWeight] = React.useState<string>('theme');
  const [color, setColor] = React.useState<string>('theme');
  const [emphasis, setEmphasis] = React.useState<string>('default');

  const items = [
    {
      id: 'size',
      label: 'Size',
      type: 'select' as const,
      value: size,
      onChange: setSize,
      options: sizes.map((s) => ({ label: s, value: s })),
      placeholder: 'Select size',
    },
    {
      id: 'weight',
      label: 'Weight',
      type: 'select' as const,
      value: weight,
      onChange: setWeight,
      options: [{ label: 'Theme', value: 'theme' }, ...weights.map((w) => ({ label: w, value: w }))],
      placeholder: 'Theme',
    },
    {
      id: 'color',
      label: 'Color',
      type: 'select' as const,
      value: color,
      onChange: setColor,
      options: [{ label: 'Theme', value: 'theme' }, ...accentColors.map((c) => ({ label: c, value: c }))],
      placeholder: 'Theme',
      appearance: 'swatch' as const,
    },
    {
      id: 'emphasis',
      label: 'Emphasis',
      type: 'select' as const,
      value: emphasis,
      onChange: setEmphasis,
      options: [{ label: 'Default', value: 'default' }, ...emphases.map((e) => ({ label: e, value: e }))],
      placeholder: 'Default',
    },
  ];

  const generateCode = () => {
    const props = [`size="${size}"`];
    if (weight !== 'theme') props.push(`weight="${weight}"`);
    if (color !== 'theme') props.push(`color="${color}"`);
    if (emphasis !== 'default') props.push(`emphasis="${emphasis}"`);

    return `<Blockquote
  ${props.join('\n  ')}
>
  The best interface is the one you stop noticing after the first week.
</Blockquote>`;
  };

  return (
    <Playground
      component={
        <Flex direction="column" gap="3" maxWidth="420px" px="4">
          <Blockquote
            size={size as any}
            weight={weight === 'theme' ? undefined : (weight as any)}
            color={color === 'theme' ? undefined : (color as any)}
            emphasis={emphasis === 'default' ? undefined : (emphasis as any)}
          >
            The best interface is the one you stop noticing after the first week.
          </Blockquote>
          <Text size="2" emphasis="medium">
            Maya Lin, product lead
          </Text>
        </Flex>
      }
      code={generateCode()}
      items={items}
      showControls={showControls}
      showToolbar={showToolbar}
      height={height}
    />
  );
}
