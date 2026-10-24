'use client';

import React from 'react';
import { Accordion, Box } from '@kushagradhawan/kookie-ui';
import { HugeiconsIcon } from '@hugeicons/react';
import { ArrowDown01Icon } from '@hugeicons/core-free-icons';
import Playground from '@/components/playground';

const sizes = ['1', '2', '3', '4'] as const;
const variants = ['raised', 'soft', 'surface', 'outline', 'ghost'] as const;
const types = ['single', 'multiple'] as const;
const accentColors = ['theme', 'gray', 'iris', 'crimson', 'jade', 'gold'] as const;
const radiusOptions = ['theme', 'none', 'small', 'medium', 'large', 'full'] as const;

const questions = [
  { id: 'refunds', question: 'Can I get a refund?', answer: 'Yes, within 30 days of purchase.' },
  { id: 'seats', question: 'Can I add more seats later?', answer: 'Add seats from Billing at any time.' },
  { id: 'invoices', question: 'Where do I find my invoices?', answer: 'Every invoice is in Billing, under History.' },
];

type AccordionPlaygroundProps = {
  showControls?: boolean;
  showToolbar?: boolean;
  height?: string;
};

export default function AccordionPlayground({
  showControls = false,
  showToolbar = true,
  height,
}: AccordionPlaygroundProps = {}) {
  const [size, setSize] = React.useState<(typeof sizes)[number]>('2');
  const [variant, setVariant] = React.useState<(typeof variants)[number]>('raised');
  const [type, setType] = React.useState<(typeof types)[number]>('single');
  const [color, setColor] = React.useState<(typeof accentColors)[number]>('theme');
  const [radius, setRadius] = React.useState<(typeof radiusOptions)[number]>('theme');

  const generateCode = () => {
    const props = [`type="${type}"`, type === 'single' ? `defaultValue="refunds"` : `defaultValue={['refunds']}`];
    if (size !== '2') props.push(`size="${size}"`);
    if (variant !== 'raised') props.push(`variant="${variant}"`);
    if (color !== 'theme') props.push(`color="${color}"`);
    if (radius !== 'theme') props.push(`radius="${radius}"`);

    return `import { Accordion } from '@kushagradhawan/kookie-ui';
import { HugeiconsIcon } from '@hugeicons/react';
import { ArrowDown01Icon } from '@hugeicons/core-free-icons';

const questions = [
${questions.map((q) => `  { id: '${q.id}', question: '${q.question}', answer: '${q.answer}' },`).join('\n')}
];

export function BillingFaq() {
  return (
    <Accordion.Root
      ${props.join('\n      ')}
    >
      {questions.map((item) => (
        <Accordion.Item key={item.id} value={item.id}>
          <Accordion.Header>
            <Accordion.Trigger>
              {item.question}
              <HugeiconsIcon icon={ArrowDown01Icon} strokeWidth={1.75} />
            </Accordion.Trigger>
          </Accordion.Header>
          <Accordion.Content>{item.answer}</Accordion.Content>
        </Accordion.Item>
      ))}
    </Accordion.Root>
  );
}`;
  };

  const items = questions.map((item) => (
    <Accordion.Item key={item.id} value={item.id}>
      <Accordion.Header>
        <Accordion.Trigger>
          {item.question}
          <HugeiconsIcon icon={ArrowDown01Icon} strokeWidth={1.75} />
        </Accordion.Trigger>
      </Accordion.Header>
      <Accordion.Content>{item.answer}</Accordion.Content>
    </Accordion.Item>
  ));

  const shared = {
    size,
    variant,
    color: color === 'theme' ? undefined : color,
    radius: radius === 'theme' ? undefined : radius,
  };

  // Radix's single/multiple union is flattened in AccordionRootProps, which drops `defaultValue` and `collapsible`
  // from the type; spreading keeps the runtime props.
  const singleOpen = { defaultValue: 'refunds', collapsible: true };
  const multipleOpen = { defaultValue: ['refunds'] };

  const component = (
    <Box width="100%" maxWidth="420px" px="4">
      {type === 'single' ? (
        <Accordion.Root key="single" type="single" {...singleOpen} {...shared}>
          {items}
        </Accordion.Root>
      ) : (
        <Accordion.Root key="multiple" type="multiple" {...multipleOpen} {...shared}>
          {items}
        </Accordion.Root>
      )}
    </Box>
  );

  const controls = [
    {
      id: 'type',
      label: 'Type',
      type: 'select' as const,
      value: type,
      onChange: (next: string) => setType(next as (typeof types)[number]),
      options: types.map((option) => ({ label: option, value: option })),
      placeholder: 'Select type',
    },
    {
      id: 'variant',
      label: 'Variant',
      type: 'select' as const,
      value: variant,
      onChange: (next: string) => setVariant(next as (typeof variants)[number]),
      options: variants.map((option) => ({ label: option, value: option })),
      placeholder: 'Select variant',
    },
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
      id: 'radius',
      label: 'Radius',
      type: 'select' as const,
      value: radius,
      onChange: (next: string) => setRadius(next as (typeof radiusOptions)[number]),
      options: radiusOptions.map((option) => ({ label: option, value: option })),
      placeholder: 'Theme',
    },
  ];

  return (
    <Playground
      component={component}
      code={generateCode()}
      items={controls}
      showControls={showControls}
      showToolbar={showToolbar}
      height={height}
    />
  );
}
