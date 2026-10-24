'use client';

import React from 'react';
import { Box, Link, Text } from '@kushagradhawan/kookie-ui';
import Playground from '@/components/playground';

const underlines = ['auto', 'always', 'hover', 'none'] as const;
const sizes = ['1', '2', '3', '4', '5', '6', '7', '8', '9'] as const;
const weights = ['regular', 'medium', 'semibold'] as const;
const accentColors = ['gray', 'gold', 'amber', 'crimson', 'plum', 'iris', 'blue', 'teal', 'jade', 'grass'] as const;

type LinkPlaygroundProps = {
  showControls?: boolean;
  showToolbar?: boolean;
  height?: string;
};

export default function LinkPlayground({ showControls = false, showToolbar = true, height }: LinkPlaygroundProps = {}) {
  const [underline, setUnderline] = React.useState<string>('auto');
  const [size, setSize] = React.useState<string>('3');
  const [color, setColor] = React.useState<string>('theme');
  const [weight, setWeight] = React.useState<string>('theme');

  const items = [
    {
      id: 'underline',
      label: 'Underline',
      type: 'select' as const,
      value: underline,
      onChange: setUnderline,
      options: underlines.map((u) => ({ label: u, value: u })),
      placeholder: 'Select underline',
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
    const props = ['href="/docs/theme"'];
    if (underline !== 'auto') props.push(`underline="${underline}"`);
    if (color !== 'theme') props.push(`color="${color}"`);
    if (weight !== 'theme') props.push(`weight="${weight}"`);

    return `<Text size="${size}">
  Colours come from the theme. See the{' '}
  <Link ${props.join(' ')}>theme guide</Link>{' '}
  to change them.
</Text>`;
  };

  return (
    <Playground
      component={
        <Box px="4">
          <Text as="p" size={size as any} align="center">
            Colours come from the theme. See the{' '}
            <Link
              href="#"
              onClick={(event) => event.preventDefault()}
              underline={underline as any}
              color={color === 'theme' ? undefined : (color as any)}
              weight={weight === 'theme' ? undefined : (weight as any)}
            >
              theme guide
            </Link>{' '}
            to change them.
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
