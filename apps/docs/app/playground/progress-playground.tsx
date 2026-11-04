'use client';

import React from 'react';
import { Flex, Progress, Text } from '@kushagradhawan/kookie-ui';
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
const radiusOptions = ['none', 'small', 'medium', 'large', 'full'] as const;
const values = ['indeterminate', '10', '35', '60', '90', '100'] as const;

type ProgressPlaygroundProps = {
  showControls?: boolean;
  showToolbar?: boolean;
  height?: string;
};

export default function ProgressPlayground({ showControls = false, showToolbar = true, height }: ProgressPlaygroundProps = {}) {
  const [variant, setVariant] = React.useState<string>('surface');
  const [color, setColor] = React.useState<string>('theme');
  const [radius, setRadius] = React.useState<string>('theme');
  const [value, setValue] = React.useState<string>('60');

  const isIndeterminate = value === 'indeterminate';
  const percent = isIndeterminate ? null : Number(value);

  const items = [
    {
      id: 'value',
      label: 'Value',
      type: 'select' as const,
      value,
      onChange: setValue,
      options: values.map((v) => ({ label: v === 'indeterminate' ? 'Unknown' : `${v}%`, value: v })),
      placeholder: 'Select value',
    },
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
    const props: string[] = [];
    if (!isIndeterminate) props.push(`value={${percent}}`);
    props.push('aria-labelledby="upload-label"', `variant="${variant}"`);
    if (color !== 'theme') props.push(`color="${color}"`);
    if (radius !== 'theme') props.push(`radius="${radius}"`);

    return `<Flex direction="column" gap="2">
  <Flex justify="between" gap="3">
    <Text id="upload-label" size="2">
      Uploading report.pdf
    </Text>
    <Text size="2" emphasis="medium">
      ${isIndeterminate ? 'Preparing' : `${percent}%`}
    </Text>
  </Flex>
  <Progress
    ${props.join('\n    ')}
  />
</Flex>`;
  };

  return (
    <Playground
      component={
        <Flex direction="column" gap="2" width="320px" maxWidth="100%">
          <Flex justify="between" gap="3">
            <Text id="playground-upload-label" size="2">
              Uploading report.pdf
            </Text>
            <Text size="2" emphasis="medium">
              {isIndeterminate ? 'Preparing' : `${percent}%`}
            </Text>
          </Flex>
          <Progress
            key={isIndeterminate ? 'indeterminate' : 'determinate'}
            {...(isIndeterminate ? {} : { value: percent })}
            aria-labelledby="playground-upload-label"
            variant={variant as any}
            color={color === 'theme' ? undefined : (color as any)}
            radius={radius === 'theme' ? undefined : (radius as any)}
          />
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
