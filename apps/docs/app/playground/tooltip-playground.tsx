'use client';

import React from 'react';
import { Button, Flex, Tooltip } from '@kushagradhawan/kookie-ui';
import { HugeiconsIcon } from '@hugeicons/react';
import { TextBoldIcon, TextItalicIcon, TextUnderlineIcon } from '@hugeicons/core-free-icons';
import Playground from '@/components/playground';

const sides = ['top', 'right', 'bottom', 'left'] as const;
const aligns = ['center', 'start', 'end'] as const;
const delays = ['700', '300', '0'] as const;

const tools = [
  { label: 'Bold', shortcut: '⌘B', icon: TextBoldIcon, iconName: 'TextBoldIcon' },
  { label: 'Italic', shortcut: '⌘I', icon: TextItalicIcon, iconName: 'TextItalicIcon' },
  { label: 'Underline', shortcut: '⌘U', icon: TextUnderlineIcon, iconName: 'TextUnderlineIcon' },
];

type TooltipPlaygroundProps = {
  showControls?: boolean;
  showToolbar?: boolean;
  height?: string;
};

export default function TooltipPlayground({
  showControls = false,
  showToolbar = true,
  height,
}: TooltipPlaygroundProps = {}) {
  const [side, setSide] = React.useState<(typeof sides)[number]>('top');
  const [align, setAlign] = React.useState<(typeof aligns)[number]>('center');
  const [delay, setDelay] = React.useState<(typeof delays)[number]>('700');
  const [keepOpen, setKeepOpen] = React.useState(false);

  const generateCode = () => {
    const props = ['content={`${tool.label} ${tool.shortcut}`}'];
    if (side !== 'top') props.push(`side="${side}"`);
    if (align !== 'center') props.push(`align="${align}"`);
    if (delay !== '700') props.push(`delayDuration={${delay}}`);

    return `import { Button, Flex, Tooltip } from '@kushagradhawan/kookie-ui';
import { HugeiconsIcon } from '@hugeicons/react';
import { ${tools.map((t) => t.iconName).join(', ')} } from '@hugeicons/core-free-icons';

const tools = [
${tools.map((t) => `  { label: '${t.label}', shortcut: '${t.shortcut}', icon: ${t.iconName} },`).join('\n')}
];

export function FormatToolbar() {
  return (
    <Flex gap="1">
      {tools.map((tool) => (
        <Tooltip
          key={tool.label}
          ${props.join('\n          ')}
        >
          <Button iconOnly emphasis="quiet" aria-label={tool.label}>
            <HugeiconsIcon icon={tool.icon} strokeWidth={1.75} />
          </Button>
        </Tooltip>
      ))}
    </Flex>
  );
}`;
  };

  const component = (
    <Flex gap="1">
      {tools.map((tool, index) => (
        <Tooltip
          key={tool.label}
          content={`${tool.label} ${tool.shortcut}`}
          side={side}
          align={align}
          delayDuration={Number(delay)}
          open={keepOpen && index === 0 ? true : undefined}
        >
          <Button iconOnly emphasis="quiet" aria-label={tool.label}>
            <HugeiconsIcon icon={tool.icon} strokeWidth={1.75} />
          </Button>
        </Tooltip>
      ))}
    </Flex>
  );

  const items = [
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
    {
      id: 'delay',
      label: 'Delay (ms)',
      type: 'select' as const,
      value: delay,
      onChange: (next: string) => setDelay(next as (typeof delays)[number]),
      options: delays.map((option) => ({ label: option, value: option })),
      placeholder: 'Delay',
    },
    {
      id: 'keepOpen',
      label: 'Keep first open',
      type: 'switch' as const,
      value: keepOpen,
      onChange: setKeepOpen,
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
