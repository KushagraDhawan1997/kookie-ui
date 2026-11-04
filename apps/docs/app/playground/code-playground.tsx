'use client';

import React from 'react';
import { Box, Code, Text } from '@kushagradhawan/kookie-ui';
import Playground from '@/components/playground';

const variants = ['solid', 'soft', 'outline', 'ghost'] as const;
const sizes = ['1', '2', '3', '4', '5', '6', '7', '8', '9'] as const;
const weights = ['regular', 'medium', 'semibold'] as const;
const accentColors = ['gray', 'gold', 'amber', 'crimson', 'plum', 'iris', 'blue', 'teal', 'jade', 'grass'] as const;

type CodePlaygroundProps = {
  showControls?: boolean;
  showToolbar?: boolean;
  height?: string;
};

export default function CodePlayground({ showControls = false, showToolbar = true, height }: CodePlaygroundProps = {}) {
  const [variant, setVariant] = React.useState<string>('soft');
  const [size, setSize] = React.useState<string>('3');
  const [color, setColor] = React.useState<string>('theme');
  const [weight, setWeight] = React.useState<string>('theme');

  const items = [
    {
      id: 'variant',
      label: 'Variant',
      type: 'select' as const,
      value: variant,
      onChange: setVariant,
      options: variants.map((v) => ({ label: v, value: v })),
      placeholder: 'Select variant',
    },
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
      id: 'weight',
      label: 'Weight',
      type: 'select' as const,
      value: weight,
      onChange: setWeight,
      options: [{ label: 'Theme', value: 'theme' }, ...weights.map((w) => ({ label: w, value: w }))],
      placeholder: 'Theme',
    },
  ];

  const generateCode = () => {
    const props = [`variant="${variant}"`, `size="${size}"`];
    if (color !== 'theme') props.push(`color="${color}"`);
    if (weight !== 'theme') props.push(`weight="${weight}"`);

    return `<Text size="${size}">
  Run <Code ${props.join(' ')}>pnpm install</Code> before you start the dev server.
</Text>`;
  };

  return (
    <Playground
      component={
        <Box px="4">
          <Text as="p" size={size as any} align="center">
            Run{' '}
            <Code variant={variant as any} size={size as any} color={color === 'theme' ? undefined : (color as any)} weight={weight === 'theme' ? undefined : (weight as any)}>
              pnpm install
            </Code>{' '}
            before you start the dev server.
          </Text>
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
