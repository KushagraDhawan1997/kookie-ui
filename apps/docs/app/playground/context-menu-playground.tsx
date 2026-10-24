'use client';

import React from 'react';
import { Card, ContextMenu, Flex, Text } from '@kushagradhawan/kookie-ui';
import { HugeiconsIcon } from '@hugeicons/react';
import { File01Icon } from '@hugeicons/core-free-icons';
import Playground from '@/components/playground';

const sizes = ['1', '2', '3', '4'] as const;
const accentColors = ['theme', 'gray', 'iris', 'crimson', 'jade', 'gold'] as const;

type ContextMenuPlaygroundProps = {
  showControls?: boolean;
  showToolbar?: boolean;
  height?: string;
};

export default function ContextMenuPlayground({
  showControls = false,
  showToolbar = true,
  height,
}: ContextMenuPlaygroundProps = {}) {
  const [size, setSize] = React.useState<(typeof sizes)[number]>('2');
  const [color, setColor] = React.useState<(typeof accentColors)[number]>('theme');
  const [showShortcuts, setShowShortcuts] = React.useState(true);
  const [showSubmenu, setShowSubmenu] = React.useState(true);

  const shortcut = (keys: string) => (showShortcuts ? keys : undefined);
  const shortcutProp = (keys: string) => (showShortcuts ? ` shortcut="${keys}"` : '');

  const generateCode = () => {
    const contentProps: string[] = [];
    if (size !== '2') contentProps.push(`size="${size}"`);
    if (color !== 'theme') contentProps.push(`color="${color}"`);
    const contentOpen = contentProps.length > 0 ? `<ContextMenu.Content ${contentProps.join(' ')}>` : '<ContextMenu.Content>';
    const submenu = showSubmenu
      ? `
        <ContextMenu.Sub>
          <ContextMenu.SubTrigger>Move to</ContextMenu.SubTrigger>
          <ContextMenu.SubContent>
            <ContextMenu.Item>Reports</ContextMenu.Item>
            <ContextMenu.Item>Archive</ContextMenu.Item>
          </ContextMenu.SubContent>
        </ContextMenu.Sub>`
      : '';

    return `import { Card, ContextMenu, Flex, Text } from '@kushagradhawan/kookie-ui';
import { HugeiconsIcon } from '@hugeicons/react';
import { File01Icon } from '@hugeicons/core-free-icons';

export function FileCard() {
  return (
    <ContextMenu.Root>
      <ContextMenu.Trigger>
        <Card variant="raised" size="2">
          <Flex gap="3" align="center">
            <HugeiconsIcon icon={File01Icon} strokeWidth={1.75} />
            <Flex direction="column">
              <Text size="2" weight="medium">Q3 report.pdf</Text>
              <Text size="1" emphasis="medium">Right-click for actions</Text>
            </Flex>
          </Flex>
        </Card>
      </ContextMenu.Trigger>
      ${contentOpen}
        <ContextMenu.Item${shortcutProp('⌘ R')}>Rename</ContextMenu.Item>
        <ContextMenu.Item${shortcutProp('⌘ D')}>Duplicate</ContextMenu.Item>${submenu}
        <ContextMenu.Separator />
        <ContextMenu.Item color="red"${shortcutProp('⌘ ⌫')}>Delete</ContextMenu.Item>
      </ContextMenu.Content>
    </ContextMenu.Root>
  );
}`;
  };

  const component = (
    <ContextMenu.Root>
      <ContextMenu.Trigger>
        <Card variant="raised" size="2">
          <Flex gap="3" align="center">
            <HugeiconsIcon icon={File01Icon} strokeWidth={1.75} />
            <Flex direction="column">
              <Text size="2" weight="medium">
                Q3 report.pdf
              </Text>
              <Text size="1" emphasis="medium">
                Right-click for actions
              </Text>
            </Flex>
          </Flex>
        </Card>
      </ContextMenu.Trigger>
      <ContextMenu.Content size={size} color={color === 'theme' ? undefined : color}>
        <ContextMenu.Item shortcut={shortcut('⌘ R')}>Rename</ContextMenu.Item>
        <ContextMenu.Item shortcut={shortcut('⌘ D')}>Duplicate</ContextMenu.Item>
        {showSubmenu ? (
          <ContextMenu.Sub>
            <ContextMenu.SubTrigger>Move to</ContextMenu.SubTrigger>
            <ContextMenu.SubContent>
              <ContextMenu.Item>Reports</ContextMenu.Item>
              <ContextMenu.Item>Archive</ContextMenu.Item>
            </ContextMenu.SubContent>
          </ContextMenu.Sub>
        ) : null}
        <ContextMenu.Separator />
        <ContextMenu.Item color="red" shortcut={shortcut('⌘ ⌫')}>
          Delete
        </ContextMenu.Item>
      </ContextMenu.Content>
    </ContextMenu.Root>
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
      id: 'shortcuts',
      label: 'Shortcuts',
      type: 'switch' as const,
      value: showShortcuts,
      onChange: setShowShortcuts,
    },
    {
      id: 'submenu',
      label: 'Submenu',
      type: 'switch' as const,
      value: showSubmenu,
      onChange: setShowSubmenu,
    },
  ];

  return (
    <Playground
      component={component}
      code={generateCode()}
      items={items}
      hint="Right-click the card, or press and hold it on a touch screen."
      showControls={showControls}
      showToolbar={showToolbar}
      height={height}
    />
  );
}
