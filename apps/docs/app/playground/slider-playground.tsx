'use client';

import React from 'react';
import { Box, Flex, Slider, Text } from '@kushagradhawan/kookie-ui';
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
const variants = ['surface', 'soft', 'outline'] as const;
const sizes = ['1', '2', '3', '4'] as const;

const ticks = [
  { value: 0, label: 'Off' },
  { value: 25, label: '25%' },
  { value: 50, label: '50%' },
  { value: 75, label: '75%' },
  { value: 100, label: 'Max' },
];

type SliderPlaygroundProps = {
  showControls?: boolean;
  showToolbar?: boolean;
  height?: string;
};

export default function SliderPlayground({ showControls = false, showToolbar = true, height }: SliderPlaygroundProps = {}) {
  const [variant, setVariant] = React.useState<string>('surface');
  const [size, setSize] = React.useState<string>('2');
  const [color, setColor] = React.useState<string>('theme');
  const [showTicks, setShowTicks] = React.useState(false);
  const [disabled, setDisabled] = React.useState(false);
  const [volume, setVolume] = React.useState(60);

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
      id: 'ticks',
      label: 'Ticks',
      type: 'switch' as const,
      value: showTicks,
      onChange: setShowTicks,
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
    const props = ['value={[volume]}', 'onValueChange={([v]) => setVolume(v)}', 'unit="%"', 'aria-labelledby="volume-label"', `variant="${variant}"`, `size="${size}"`];
    if (color !== 'theme') props.push(`color="${color}"`);
    if (showTicks) {
      props.push(`ticks={[\n${ticks.map((t) => `  { value: ${t.value}, label: '${t.label}' },`).join('\n')}\n]}`);
      props.push('showTickLabels');
    }
    if (disabled) props.push('disabled');

    const indent = (text: string, spaces: number) => text.replace(/\n/g, `\n${' '.repeat(spaces)}`);
    const pad = showTicks ? 6 : 4;
    const slider = `<Slider\n${' '.repeat(pad)}${props.map((p) => indent(p, pad)).join(`\n${' '.repeat(pad)}`)}\n${' '.repeat(pad - 2)}/>`;

    return `<Flex direction="column" gap="2">
  <Flex justify="between">
    <Text size="2" weight="medium" id="volume-label">
      Volume
    </Text>
    <Text size="2" emphasis="medium">
      {volume}%
    </Text>
  </Flex>
  ${showTicks ? `<Box mb="6">\n    ${slider}\n  </Box>` : slider}
</Flex>`;
  };

  const slider = (
    <Slider
      value={[volume]}
      onValueChange={([v]) => setVolume(v)}
      unit="%"
      aria-labelledby="playground-volume-label"
      variant={variant as any}
      size={size as any}
      color={color === 'theme' ? undefined : (color as any)}
      ticks={showTicks ? ticks : undefined}
      showTickLabels={showTicks}
      disabled={disabled}
    />
  );

  return (
    <Playground
      component={
        <Flex direction="column" gap="2" width="320px" maxWidth="100%">
          <Flex justify="between">
            <Text size="2" weight="medium" id="playground-volume-label">
              Volume
            </Text>
            <Text size="2" emphasis="medium">
              {volume}%
            </Text>
          </Flex>
          {showTicks ? <Box mb="6">{slider}</Box> : slider}
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
