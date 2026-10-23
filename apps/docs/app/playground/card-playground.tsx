'use client';

import React from 'react';
import { Card, Flex } from '@kushagradhawan/kookie-ui';
import Playground from '@/components/playground';

const variants = ['surface', 'outline', 'raised', 'ghost', 'soft'] as const;
const sizes = ['1', '2', '3', '4', '5'] as const;

type CardPlaygroundProps = {
  showControls?: boolean;
  showToolbar?: boolean;
  height?: string;
};

export default function CardPlayground({
  showControls = false,
  showToolbar = true,
  height,
}: CardPlaygroundProps = {}) {
  const [variant, setVariant] = React.useState<string>('raised');
  const [size, setSize] = React.useState<string>('2');
  const [interactive, setInteractive] = React.useState<boolean>(false);

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
      id: 'interactive',
      label: 'Interactive (asChild)',
      type: 'switch' as const,
      value: interactive,
      onChange: setInteractive,
    },
  ];

  const generateCode = () => {
    const props = [`variant="${variant}"`, `size="${size}"`];

    if (interactive) props.push('asChild');

    const propsString = props.length > 0 ? `\n  ${props.join('\n  ')}` : '';

    if (interactive) {
      return `<Card${propsString}>
  <button onClick={() => handleClick()}>
    {/* Card content */}
  </button>
</Card>`;
    }

    return `<Card${propsString}>
  <Flex direction="column" gap="3">
    <Heading size="3">Card Title</Heading>
    <Text size="2">Card content goes here.</Text>
  </Flex>
</Card>`;
  };

  // Use smaller height when in compact mode (no controls)
  const contentHeight = showControls ? '320px' : '160px';

  const innerContent = (
    <Flex
      direction="column"
      gap="3"
      p="3"
      width="100%"
      height={contentHeight}
      style={{
        border: '1px dashed var(--crimson-8)',
        borderRadius: 'var(--radius-2)',
        background: 'repeating-linear-gradient(135deg, transparent, transparent 4px, var(--crimson-3) 4px, var(--crimson-3) 5px)',
      }}
    />
  );

  return (
    <Playground
      component={
        <Card
          asChild={interactive}
          size={size as any}
          variant={variant as any}
          style={{ width: 280 }}
        >
          {interactive ? (
            <button>
              {innerContent}
            </button>
          ) : (
            innerContent
          )}
        </Card>
      }
      code={generateCode()}
      items={items}
      hint={
        interactive
          ? 'Click the card to test. Hover and active states are styled automatically.'
          : undefined
      }
      showControls={showControls}
      showToolbar={showToolbar}
      height={height}
    />
  );
}
