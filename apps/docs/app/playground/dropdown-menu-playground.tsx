'use client';

import React from 'react';
import { Button, DropdownMenu } from '@kushagradhawan/kookie-ui';
import Playground from '@/components/playground';

const sizes = ['1', '2', '3', '4'] as const;
const accentColors = ['theme', 'gray', 'iris', 'crimson', 'jade', 'gold'] as const;
const submenuBehaviors = ['cascade', 'drill-down'] as const;

type DropdownMenuPlaygroundProps = {
  showControls?: boolean;
  showToolbar?: boolean;
  height?: string;
};

export default function DropdownMenuPlayground({
  showControls = false,
  showToolbar = true,
  height,
}: DropdownMenuPlaygroundProps = {}) {
  const [size, setSize] = React.useState<(typeof sizes)[number]>('2');
  const [color, setColor] = React.useState<(typeof accentColors)[number]>('theme');
  const [submenuBehavior, setSubmenuBehavior] = React.useState<(typeof submenuBehaviors)[number]>('cascade');
  const [showShortcuts, setShowShortcuts] = React.useState(true);
  const [showPinned, setShowPinned] = React.useState(true);

  const shortcut = (keys: string) => (showShortcuts ? keys : undefined);
  const shortcutProp = (keys: string) => (showShortcuts ? ` shortcut="${keys}"` : '');

  const generateCode = () => {
    const contentProps: string[] = [];
    if (size !== '2') contentProps.push(`size="${size}"`);
    if (color !== 'theme') contentProps.push(`color="${color}"`);
    if (submenuBehavior !== 'cascade') contentProps.push(`submenuBehavior="${submenuBehavior}"`);
    const contentOpen = contentProps.length > 0 ? `<DropdownMenu.Content ${contentProps.join(' ')}>` : '<DropdownMenu.Content>';

    return `import * as React from 'react';
import { Button, DropdownMenu } from '@kushagradhawan/kookie-ui';

export function ProjectActions() {
  const [pinned, setPinned] = React.useState(${showPinned});

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger>
        <Button>
          Actions
          <DropdownMenu.TriggerIcon />
        </Button>
      </DropdownMenu.Trigger>
      ${contentOpen}
        <DropdownMenu.Item${shortcutProp('⌘ R')}>Rename</DropdownMenu.Item>
        <DropdownMenu.Item${shortcutProp('⌘ D')}>Duplicate</DropdownMenu.Item>
        <DropdownMenu.Sub>
          <DropdownMenu.SubTrigger>Share</DropdownMenu.SubTrigger>
          <DropdownMenu.SubContent>
            <DropdownMenu.Item>Copy link</DropdownMenu.Item>
            <DropdownMenu.Item>Invite people</DropdownMenu.Item>
          </DropdownMenu.SubContent>
        </DropdownMenu.Sub>
        <DropdownMenu.CheckboxItem checked={pinned} onCheckedChange={setPinned}>
          Pin to sidebar
        </DropdownMenu.CheckboxItem>
        <DropdownMenu.Separator />
        <DropdownMenu.Item color="red"${shortcutProp('⌘ ⌫')}>Delete</DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  );
}`;
  };

  const component = (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger>
        <Button>
          Actions
          <DropdownMenu.TriggerIcon />
        </Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content size={size} color={color === 'theme' ? undefined : color} submenuBehavior={submenuBehavior}>
        <DropdownMenu.Item shortcut={shortcut('⌘ R')}>Rename</DropdownMenu.Item>
        <DropdownMenu.Item shortcut={shortcut('⌘ D')}>Duplicate</DropdownMenu.Item>
        <DropdownMenu.Sub>
          <DropdownMenu.SubTrigger>Share</DropdownMenu.SubTrigger>
          <DropdownMenu.SubContent>
            <DropdownMenu.Item>Copy link</DropdownMenu.Item>
            <DropdownMenu.Item>Invite people</DropdownMenu.Item>
          </DropdownMenu.SubContent>
        </DropdownMenu.Sub>
        <DropdownMenu.CheckboxItem checked={showPinned} onCheckedChange={(checked) => setShowPinned(checked === true)}>
          Pin to sidebar
        </DropdownMenu.CheckboxItem>
        <DropdownMenu.Separator />
        <DropdownMenu.Item color="red" shortcut={shortcut('⌘ ⌫')}>
          Delete
        </DropdownMenu.Item>
      </DropdownMenu.Content>
    </DropdownMenu.Root>
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
      id: 'submenuBehavior',
      label: 'Submenu',
      type: 'select' as const,
      value: submenuBehavior,
      onChange: (next: string) => setSubmenuBehavior(next as (typeof submenuBehaviors)[number]),
      options: submenuBehaviors.map((option) => ({ label: option, value: option })),
      placeholder: 'Submenu behavior',
    },
    {
      id: 'shortcuts',
      label: 'Shortcuts',
      type: 'switch' as const,
      value: showShortcuts,
      onChange: setShowShortcuts,
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
