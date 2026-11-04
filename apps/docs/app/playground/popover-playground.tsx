'use client';

import React from 'react';
import { Button, Checkbox, Flex, Popover, Text } from '@kushagradhawan/kookie-ui';
import { HugeiconsIcon } from '@hugeicons/react';
import { FilterIcon } from '@hugeicons/core-free-icons';
import Playground from '@/components/playground';

const sizes = ['1', '2', '3', '4'] as const;
const widths = ['200px', '240px', '320px'] as const;
const sides = ['bottom', 'top', 'right', 'left'] as const;
const aligns = ['start', 'center', 'end'] as const;

const statuses = ['Open', 'In review', 'Closed'];

type PopoverPlaygroundProps = {
  showControls?: boolean;
  showToolbar?: boolean;
  height?: string;
};

export default function PopoverPlayground({
  showControls = false,
  showToolbar = true,
  height,
}: PopoverPlaygroundProps = {}) {
  const [size, setSize] = React.useState<(typeof sizes)[number]>('2');
  const [width, setWidth] = React.useState<(typeof widths)[number]>('240px');
  const [side, setSide] = React.useState<(typeof sides)[number]>('bottom');
  const [align, setAlign] = React.useState<(typeof aligns)[number]>('start');

  const generateCode = () => {
    const contentProps = [`width="${width}"`];
    if (size !== '2') contentProps.push(`size="${size}"`);
    if (side !== 'bottom') contentProps.push(`side="${side}"`);
    if (align !== 'start') contentProps.push(`align="${align}"`);

    return `import { Button, Checkbox, Flex, Popover, Text } from '@kushagradhawan/kookie-ui';
import { HugeiconsIcon } from '@hugeicons/react';
import { FilterIcon } from '@hugeicons/core-free-icons';

export function StatusFilter() {
  return (
    <Popover.Root>
      <Popover.Trigger>
        <Button>
          <HugeiconsIcon icon={FilterIcon} strokeWidth={1.75} />
          Filter
        </Button>
      </Popover.Trigger>
      <Popover.Content
        ${contentProps.join('\n        ')}
      >
        <Flex direction="column" gap="3">
          {['Open', 'In review', 'Closed'].map((status, index) => (
            <Flex gap="2" align="center" key={status}>
              <Checkbox id={\`status-\${index}\`} defaultChecked={status === 'Open'} />
              <Text as="label" htmlFor={\`status-\${index}\`} size="2">
                {status}
              </Text>
            </Flex>
          ))}
        </Flex>
      </Popover.Content>
    </Popover.Root>
  );
}`;
  };

  const component = (
    <Popover.Root>
      <Popover.Trigger>
        <Button>
          <HugeiconsIcon icon={FilterIcon} strokeWidth={1.75} />
          Filter
        </Button>
      </Popover.Trigger>
      <Popover.Content size={size} width={width} side={side} align={align}>
        <Flex direction="column" gap="3">
          {statuses.map((status, index) => (
            <Flex gap="2" align="center" key={status}>
              <Checkbox id={`playground-status-${index}`} defaultChecked={status === 'Open'} />
              <Text as="label" htmlFor={`playground-status-${index}`} size="2">
                {status}
              </Text>
            </Flex>
          ))}
        </Flex>
      </Popover.Content>
    </Popover.Root>
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
      id: 'width',
      label: 'Width',
      type: 'select' as const,
      value: width,
      onChange: (next: string) => setWidth(next as (typeof widths)[number]),
      options: widths.map((option) => ({ label: option, value: option })),
      placeholder: 'Width',
    },
    {
      id: 'side',
      label: 'Side',
      type: 'select' as const,
      value: side,
      onChange: (next: string) => setSide(next as (typeof sides)[number]),
      options: sides.map((option) => ({ label: option, value: option })),
      placeholder: 'Select side',
    },
    {
      id: 'align',
      label: 'Align',
      type: 'select' as const,
      value: align,
      onChange: (next: string) => setAlign(next as (typeof aligns)[number]),
      options: aligns.map((option) => ({ label: option, value: option })),
      placeholder: 'Select align',
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
