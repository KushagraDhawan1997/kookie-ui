'use client';

import React from 'react';
import { Badge } from '@kushagradhawan/kookie-ui';
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

const variants = ['solid', 'soft', 'surface', 'outline', 'ghost'] as const;
const sizes = ['1', '2', '3', '4'] as const;
const radiusOptions = ['none', 'small', 'medium', 'large', 'full'] as const;

type BadgePlaygroundProps = {
  showControls?: boolean;
  showToolbar?: boolean;
  height?: string;
};

export default function BadgePlayground({
  showControls = false,
  showToolbar = true,
  height,
}: BadgePlaygroundProps = {}) {
  const [variant, setVariant] = React.useState<string>('soft');
  const [color, setColor] = React.useState<string>('theme');
  const [radius, setRadius] = React.useState<string>('theme');
  const [size, setSize] = React.useState<string>('2');

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
    {
      id: 'size',
      label: 'Size',
      type: 'select' as const,
      value: size,
      onChange: setSize,
      options: sizes.map((s) => ({ label: s, value: s })),
      placeholder: 'Select size',
    },
  ];

  const generateCode = () => {
    const props = [`variant="${variant}"`, `size="${size}"`];

    if (color !== 'theme') props.push(`color="${color}"`);
    if (radius !== 'theme') props.push(`radius="${radius}"`);

    const propsString = props.length > 0 ? `\n  ${props.join('\n  ')}` : '';

    return `<Badge${propsString}>
  Badge
</Badge>`;
  };

  return (
    <Playground
      component={
        <Badge
          size={size as any}
          variant={variant as any}
          color={color === 'theme' ? undefined : (color as any)}
          radius={radius === 'theme' ? undefined : (radius as any)}
        >
          Badge
        </Badge>
      }
      code={generateCode()}
      items={items}
      showControls={showControls}
      showToolbar={showToolbar}
      height={height}
    />
  );
}
