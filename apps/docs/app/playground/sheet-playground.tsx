'use client';

import React from 'react';
import { Sheet, Button, Flex, Text } from '@kushagradhawan/kookie-ui';
import Playground from '@/components/playground';

const sides = ['start', 'end', 'top', 'bottom'] as const;
const sizes = ['1', '2', '3', '4'] as const;
const widths = ['280px', '320px', '400px', '50%'] as const;
const heights = ['200px', '300px', '400px', '50%'] as const;

type SheetPlaygroundProps = {
  showControls?: boolean;
  showToolbar?: boolean;
  height?: string;
};

export default function SheetPlayground({
  showControls = false,
  showToolbar = true,
  height: playgroundHeight,
}: SheetPlaygroundProps = {}) {
  const [side, setSide] = React.useState<string>('end');
  const [size, setSize] = React.useState<string>('2');
  const [width, setWidth] = React.useState<string>('320px');
  const [height, setHeight] = React.useState<string>('300px');
  const [open, setOpen] = React.useState(false);

  const isHorizontal = side === 'start' || side === 'end';

  const items = [
    {
      id: 'side',
      label: 'Side',
      type: 'select' as const,
      value: side,
      onChange: setSide,
      options: sides.map((s) => ({ label: s, value: s })),
      placeholder: 'Select side',
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
    ...(isHorizontal
      ? [
          {
            id: 'width',
            label: 'Width',
            type: 'select' as const,
            value: width,
            onChange: setWidth,
            options: widths.map((w) => ({ label: w, value: w })),
            placeholder: 'Select width',
          },
        ]
      : [
          {
            id: 'height',
            label: 'Height',
            type: 'select' as const,
            value: height,
            onChange: setHeight,
            options: heights.map((h) => ({ label: h, value: h })),
            placeholder: 'Select height',
          },
        ]),
  ];

  const generateCode = () => {
    const contentProps = [`side="${side}"`];
    if (size !== '2') contentProps.push(`size="${size}"`);
    if (isHorizontal && width !== '320px') contentProps.push(`width="${width}"`);
    if (!isHorizontal && height !== '300px') contentProps.push(`height="${height}"`);

    const contentPropsString = contentProps.length > 0 ? ` ${contentProps.join(' ')}` : '';

    return `<Sheet.Root>
  <Sheet.Trigger>
    <Button variant="soft">Open Sheet</Button>
  </Sheet.Trigger>
  <Sheet.Content${contentPropsString}>
    <Sheet.Title>Sheet Title</Sheet.Title>
    <Sheet.Description>
      Sheet content goes here.
    </Sheet.Description>
    <Sheet.Close>
      <Button variant="soft">Close</Button>
    </Sheet.Close>
  </Sheet.Content>
</Sheet.Root>`;
  };

  return (
    <Playground
      component={
        <Sheet.Root open={open} onOpenChange={setOpen}>
          <Sheet.Trigger>
            <Button variant="soft">Open Sheet</Button>
          </Sheet.Trigger>
          <Sheet.Content
            side={side as any}
            size={size as any}
            width={isHorizontal ? width : undefined}
            height={!isHorizontal ? height : undefined}
          >
            <Flex direction="column" gap="5">
              <Flex direction="column" gap="2">
                <Sheet.Title>Sheet Title</Sheet.Title>
                <Sheet.Description>
                  This is a sheet panel that slides in from the {side} side.
                </Sheet.Description>
              </Flex>
              <Flex
                direction="column"
                gap="3"
                p="5"
                style={{
                  border: '1px dashed var(--gray-6)',
                  borderRadius: 'var(--radius-2)',
                  background: 'var(--gray-2)',
                  minHeight: '200px',
                }}
              >
                <Text size="2" emphasis="medium">
                  Sheet content area
                </Text>
              </Flex>
              <Flex gap="3" justify="end">
                <Sheet.Close>
                  <Button variant="soft" color="gray">
                    Cancel
                  </Button>
                </Sheet.Close>
                <Sheet.Close>
                  <Button variant="soft">Confirm</Button>
                </Sheet.Close>
              </Flex>
            </Flex>
          </Sheet.Content>
        </Sheet.Root>
      }
      code={generateCode()}
      items={items}
      showControls={showControls}
      showToolbar={showToolbar}
      height={playgroundHeight}
    />
  );
}
