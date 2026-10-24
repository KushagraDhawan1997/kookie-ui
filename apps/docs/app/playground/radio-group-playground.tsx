'use client';

import React from 'react';
import { RadioGroup, Flex, Text } from '@kushagradhawan/kookie-ui';
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

const options = [
  { value: 'standard', label: 'Standard, 3 to 5 days' },
  { value: 'express', label: 'Express, next day' },
  { value: 'pickup', label: 'Pick up in store' },
];

type RadioGroupPlaygroundProps = {
  showControls?: boolean;
  showToolbar?: boolean;
  height?: string;
};

export default function RadioGroupPlayground({ showControls = false, showToolbar = true, height }: RadioGroupPlaygroundProps = {}) {
  const [size, setSize] = React.useState<string>('2');
  const [color, setColor] = React.useState<string>('theme');
  const [disabled, setDisabled] = React.useState(false);
  const [value, setValue] = React.useState('standard');

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
    const props = ['name="delivery"', 'defaultValue="standard"', 'aria-labelledby="delivery-label"', `size="${size}"`];
    if (color !== 'theme') props.push(`color="${color}"`);
    if (disabled) props.push('disabled');

    return `<Flex direction="column" gap="3">
  <Text as="div" size="${size}" weight="medium" id="delivery-label">
    Delivery
  </Text>
  <RadioGroup.Root
    ${props.join('\n    ')}
  >
${options.map((o) => `    <RadioGroup.Item value="${o.value}">${o.label}</RadioGroup.Item>`).join('\n')}
  </RadioGroup.Root>
</Flex>`;
  };

  return (
    <Playground
      component={
        <Flex direction="column" gap="3">
          <Text as="div" size={size as any} weight="medium" id="playground-delivery-label">
            Delivery
          </Text>
          <RadioGroup.Root
            name="delivery"
            value={value}
            onValueChange={setValue}
            aria-labelledby="playground-delivery-label"
            size={size as any}
            color={color === 'theme' ? undefined : (color as any)}
            disabled={disabled}
          >
            {options.map((o) => (
              <RadioGroup.Item key={o.value} value={o.value}>
                {o.label}
              </RadioGroup.Item>
            ))}
          </RadioGroup.Root>
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
