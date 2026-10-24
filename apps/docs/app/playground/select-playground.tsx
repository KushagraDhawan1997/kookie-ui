'use client';

import React from 'react';
import { Flex, Select, Text } from '@kushagradhawan/kookie-ui';
import Playground from '@/components/playground';

const sizes = ['1', '2', '3', '4'] as const;
const variants = ['raised', 'surface', 'soft', 'outline', 'ghost'] as const;
const accentColors = ['theme', 'gray', 'iris', 'crimson', 'jade', 'gold'] as const;
const states = ['default', 'error', 'loading', 'disabled', 'readOnly'] as const;

const zones = [
  {
    region: 'Americas',
    cities: [
      { value: 'america-new-york', label: 'New York' },
      { value: 'america-chicago', label: 'Chicago' },
    ],
  },
  {
    region: 'Europe',
    cities: [
      { value: 'europe-london', label: 'London' },
      { value: 'europe-berlin', label: 'Berlin' },
    ],
  },
  {
    region: 'Asia',
    cities: [
      { value: 'asia-kolkata', label: 'Kolkata' },
      { value: 'asia-tokyo', label: 'Tokyo' },
    ],
  },
];

type SelectPlaygroundProps = {
  showControls?: boolean;
  showToolbar?: boolean;
  height?: string;
};

export default function SelectPlayground({
  showControls = false,
  showToolbar = true,
  height,
}: SelectPlaygroundProps = {}) {
  const [size, setSize] = React.useState<(typeof sizes)[number]>('2');
  const [variant, setVariant] = React.useState<(typeof variants)[number]>('raised');
  const [color, setColor] = React.useState<(typeof accentColors)[number]>('theme');
  const [state, setState] = React.useState<(typeof states)[number]>('default');
  const [value, setValue] = React.useState<string | undefined>(undefined);

  const generateCode = () => {
    const rootProps = ['value={value}', 'onValueChange={setValue}'];
    if (size !== '2') rootProps.unshift(`size="${size}"`);
    const triggerProps = ['id="time-zone"', 'placeholder="Choose a time zone"'];
    if (variant !== 'raised') triggerProps.push(`variant="${variant}"`);
    if (color !== 'theme') triggerProps.push(`color="${color}"`);
    if (state !== 'default') triggerProps.push(state);

    const groups = zones
      .map(
        (group, index) => `${index > 0 ? '          <Select.Separator />\n' : ''}          <Select.Group>
            <Select.Label>${group.region}</Select.Label>
${group.cities.map((city) => `            <Select.Item value="${city.value}">${city.label}</Select.Item>`).join('\n')}
          </Select.Group>`,
      )
      .join('\n');

    return `import * as React from 'react';
import { Flex, Select, Text } from '@kushagradhawan/kookie-ui';

export function TimeZoneField() {
  const [value, setValue] = React.useState<string>();

  return (
    <Flex direction="column" gap="1">
      <Text as="label" htmlFor="time-zone" size="2" weight="medium">
        Time zone
      </Text>
      <Select.Root
        ${rootProps.join('\n        ')}
      >
        <Select.Trigger
          ${triggerProps.join('\n          ')}
        />
        <Select.Content>
${groups}
        </Select.Content>
      </Select.Root>
    </Flex>
  );
}`;
  };

  const component = (
    <Flex direction="column" gap="1" width="240px">
      <Text as="label" htmlFor="playground-time-zone" size="2" weight="medium">
        Time zone
      </Text>
      <Select.Root size={size} value={value} onValueChange={setValue}>
        <Select.Trigger
          id="playground-time-zone"
          placeholder="Choose a time zone"
          variant={variant}
          color={color === 'theme' ? undefined : color}
          error={state === 'error'}
          loading={state === 'loading'}
          disabled={state === 'disabled'}
          readOnly={state === 'readOnly'}
        />
        <Select.Content>
          {zones.map((group, index) => (
            <React.Fragment key={group.region}>
              {index > 0 ? <Select.Separator /> : null}
              <Select.Group>
                <Select.Label>{group.region}</Select.Label>
                {group.cities.map((city) => (
                  <Select.Item key={city.value} value={city.value}>
                    {city.label}
                  </Select.Item>
                ))}
              </Select.Group>
            </React.Fragment>
          ))}
        </Select.Content>
      </Select.Root>
    </Flex>
  );

  const items = [
    {
      id: 'size',
      label: 'Size',
      type: 'select' as const,
      value: size,
      onChange: (next: string) => setSize(next as (typeof sizes)[number]),
      options: sizes.map((option) => ({ label: option, value: option })),
      placeholder: 'Select size',
    },
    {
      id: 'variant',
      label: 'Trigger variant',
      type: 'select' as const,
      value: variant,
      onChange: (next: string) => setVariant(next as (typeof variants)[number]),
      options: variants.map((option) => ({ label: option, value: option })),
      placeholder: 'Select variant',
    },
    {
      id: 'color',
      label: 'Color',
      type: 'select' as const,
      value: color,
      onChange: (next: string) => setColor(next as (typeof accentColors)[number]),
      options: accentColors.map((option) => ({ label: option, value: option })),
      placeholder: 'Theme',
      appearance: 'swatch' as const,
    },
    {
      id: 'state',
      label: 'State',
      type: 'select' as const,
      value: state,
      onChange: (next: string) => setState(next as (typeof states)[number]),
      options: states.map((option) => ({ label: option, value: option })),
      placeholder: 'Select state',
    },
  ];

  return (
    <Playground
      component={component}
      code={generateCode()}
      items={items}
      showControls={showControls}
      showToolbar={showToolbar}
      height={height}
    />
  );
}
