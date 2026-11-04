'use client';

import React from 'react';
import { Flex, Spinner, Text } from '@kushagradhawan/kookie-ui';
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
const usages = ['label', 'children'] as const;

type SpinnerPlaygroundProps = {
  showControls?: boolean;
  showToolbar?: boolean;
  height?: string;
};

export default function SpinnerPlayground({ showControls = false, showToolbar = true, height }: SpinnerPlaygroundProps = {}) {
  const [loading, setLoading] = React.useState(true);
  const [usage, setUsage] = React.useState<string>('label');
  const [color, setColor] = React.useState<string>('gray');

  const items = [
    {
      id: 'loading',
      label: 'Loading',
      type: 'switch' as const,
      value: loading,
      onChange: setLoading,
    },
    {
      id: 'usage',
      label: 'Usage',
      type: 'select' as const,
      value: usage,
      onChange: setUsage,
      options: [
        { label: 'Beside a label', value: 'label' },
        { label: 'Wrapping content', value: 'children' },
      ],
      placeholder: 'Select usage',
    },
    {
      id: 'color',
      label: 'Text color',
      type: 'select' as const,
      value: color,
      onChange: setColor,
      options: accentColors.map((c) => ({ label: c, value: c })),
      placeholder: 'gray',
      appearance: 'swatch' as const,
    },
  ];

  const generateCode = () => {
    const loadingProp = loading ? '' : ' loading={false}';
    const colorProp = color !== 'gray' ? ` color="${color}"` : '';

    if (usage === 'children') {
      return `<Flex align="center" gap="2">
  <Text size="2" emphasis="medium">Results</Text>
  <Text size="2"${colorProp}>
    <Spinner${loadingProp}>
      <Text size="2">128 results</Text>
    </Spinner>
  </Text>
</Flex>`;
    }

    return `<Flex align="center" justify="center" gap="2" role="status">
  ${loading ? `<Text as="div"${colorProp}>\n    <Spinner />\n  </Text>` : ''}
  <Text size="2" emphasis="medium">
    ${loading ? 'Loading comments' : '12 comments'}
  </Text>
</Flex>`.replace(/\n  \n/, '\n');
  };

  const textColor = color === 'gray' ? undefined : (color as any);

  return (
    <Playground
      component={
        usage === 'children' ? (
          <Flex align="center" gap="2">
            <Text size="2" emphasis="medium">
              Results
            </Text>
            <Text size="2" color={textColor}>
              <Spinner loading={loading}>
                <Text size="2">128 results</Text>
              </Spinner>
            </Text>
          </Flex>
        ) : (
          <Flex align="center" justify="center" gap="2" role="status">
            {loading ? (
              <Text as="div" color={textColor}>
                <Spinner />
              </Text>
            ) : null}
            <Text size="2" emphasis="medium">
              {loading ? 'Loading comments' : '12 comments'}
            </Text>
          </Flex>
        )
      }
      code={generateCode()}
      items={items}
      showControls={showControls}
      showToolbar={showToolbar}
      height={height}
    />
  );
}
