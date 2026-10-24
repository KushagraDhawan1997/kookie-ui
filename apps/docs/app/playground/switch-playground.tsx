'use client';

import React from 'react';
import { Box, Card, Flex, Switch, Text } from '@kushagradhawan/kookie-ui';
import Playground from '@/components/playground';

const accentColors = [
  'gray',
  'gold',
  'bronze',
  'brown',
  'yellow',
  'amber',
  'orange',
  'tomato',
  'red',
  'ruby',
  'crimson',
  'pink',
  'plum',
  'purple',
  'violet',
  'iris',
  'indigo',
  'blue',
  'cyan',
  'teal',
  'jade',
  'green',
  'grass',
  'lime',
  'mint',
  'sky',
] as const;
const sizes = ['1', '2', '3', '4'] as const;

type SwitchPlaygroundProps = {
  showControls?: boolean;
  showToolbar?: boolean;
  height?: string;
};

export default function SwitchPlayground({ showControls = false, showToolbar = true, height }: SwitchPlaygroundProps = {}) {
  const [size, setSize] = React.useState<string>('2');
  const [color, setColor] = React.useState<string>('theme');
  const [disabled, setDisabled] = React.useState(false);
  const [on, setOn] = React.useState(true);

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
      id: 'disabled',
      label: 'Disabled',
      type: 'switch' as const,
      value: disabled,
      onChange: setDisabled,
    },
  ];

  const generateCode = () => {
    const props = ['checked={on}', 'onCheckedChange={setOn}', `size="${size}"`];
    if (color !== 'theme') props.push(`color="${color}"`);
    if (disabled) props.push('disabled');

    return `<Card size="2">
  <Text as="label" size="${size}">
    <Flex justify="between" align="center" gap="4">
      <Flex direction="column">
        <Text weight="medium">Auto-save</Text>
        <Text emphasis="medium">Save changes as you type</Text>
      </Flex>
      <Switch
        ${props.join('\n        ')}
      />
    </Flex>
  </Text>
</Card>`;
  };

  return (
    <Playground
      component={
        <Box width="360px" maxWidth="100%">
          <Card size="2">
            <Text as="label" size={size as any}>
              <Flex justify="between" align="center" gap="4">
                <Flex direction="column">
                  <Text weight="medium">Auto-save</Text>
                  <Text emphasis="medium">Save changes as you type</Text>
                </Flex>
                <Switch checked={on} onCheckedChange={setOn} size={size as any} color={color === 'theme' ? undefined : (color as any)} disabled={disabled} />
              </Flex>
            </Text>
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
