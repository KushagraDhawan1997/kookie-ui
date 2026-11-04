'use client';

import React from 'react';
import { Kbd, Text } from '@kushagradhawan/kookie-ui';
import Playground from '@/components/playground';

const variants = ['raised', 'soft'] as const;
const sizes = ['1', '2', '3', '4', '5', '6', '7', '8', '9'] as const;

type KbdPlaygroundProps = {
  showControls?: boolean;
  showToolbar?: boolean;
  height?: string;
};

export default function KbdPlayground({ showControls = false, showToolbar = true, height }: KbdPlaygroundProps = {}) {
  const [variant, setVariant] = React.useState<string>('raised');
  const [size, setSize] = React.useState<string>('3');
  const [pressable, setPressable] = React.useState(false);
  const [presses, setPresses] = React.useState(0);

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
      id: 'pressable',
      label: 'Pressable',
      type: 'switch' as const,
      value: pressable,
      onChange: setPressable,
    },
  ];

  const generateCode = () => {
    const props = [`size="${size}"`];
    if (variant !== 'raised') props.push(`variant="${variant}"`);
    const kbdProps = props.join(' ');
    const searchKey = pressable
      ? `<Kbd ${kbdProps} asChild>
    <button type="button" onClick={openSearch}>⌘ K</button>
  </Kbd>`
      : `<Kbd ${kbdProps}>⌘ K</Kbd>`;

    return `<Text as="p" size="${size}" emphasis="medium">
  Press ${searchKey} to search, or <Kbd ${kbdProps}>Esc</Kbd> to close.
</Text>`;
  };

  const kbdSize = size as any;
  const kbdVariant = variant as any;

  return (
    <Playground
      component={
        <Text as="p" size={kbdSize} emphasis="medium" align="center">
          Press{' '}
          {pressable ? (
            <Kbd size={kbdSize} variant={kbdVariant} asChild>
              <button type="button" onClick={() => setPresses((n) => n + 1)}>
                ⌘ K
              </button>
            </Kbd>
          ) : (
            <Kbd size={kbdSize} variant={kbdVariant}>
              ⌘ K
            </Kbd>
          )}{' '}
          to search, or{' '}
          <Kbd size={kbdSize} variant={kbdVariant}>
            Esc
          </Kbd>{' '}
          to close.
          {pressable && presses > 0 ? ` Pressed ${presses}×.` : null}
        </Text>
      }
      code={generateCode()}
      items={items}
      showControls={showControls}
      showToolbar={showToolbar}
      height={height}
    />
  );
}
