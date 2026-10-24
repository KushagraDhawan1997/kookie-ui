'use client';

import React from 'react';
import { Box, Flex, Tabs, Text } from '@kushagradhawan/kookie-ui';
import { HugeiconsIcon } from '@hugeicons/react';
import { Activity01Icon, DashboardSquare01Icon, Settings01Icon } from '@hugeicons/core-free-icons';
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
const sizes = ['1', '2', '3', '4'] as const;
const justifyValues = ['start', 'center', 'end'] as const;

const tabs = [
  { value: 'overview', label: 'Overview', icon: DashboardSquare01Icon, iconName: 'DashboardSquare01Icon', body: 'Three open issues and a release planned for Friday.' },
  { value: 'activity', label: 'Activity', icon: Activity01Icon, iconName: 'Activity01Icon', body: 'Maya merged two pull requests this morning.' },
  { value: 'settings', label: 'Settings', icon: Settings01Icon, iconName: 'Settings01Icon', body: 'Visibility, members and billing for this project.' },
];

type TabsPlaygroundProps = {
  showControls?: boolean;
  showToolbar?: boolean;
  height?: string;
};

export default function TabsPlayground({ showControls = false, showToolbar = true, height }: TabsPlaygroundProps = {}) {
  const [size, setSize] = React.useState<string>('2');
  const [color, setColor] = React.useState<string>('theme');
  const [justify, setJustify] = React.useState<string>('start');
  const [showIcons, setShowIcons] = React.useState(false);
  const [value, setValue] = React.useState('overview');

  const items = [
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
      id: 'color',
      label: 'Color',
      type: 'select' as const,
      value: color,
      onChange: setColor,
      options: [{ label: 'Theme', value: 'theme' }, ...accentColors.map((c) => ({ label: c, value: c }))],
      placeholder: 'Theme',
      appearance: 'swatch' as const,
    },
    {
      id: 'justify',
      label: 'Justify',
      type: 'select' as const,
      value: justify,
      onChange: setJustify,
      options: justifyValues.map((j) => ({ label: j, value: j })),
      placeholder: 'Select justify',
    },
    {
      id: 'icons',
      label: 'Icons',
      type: 'switch' as const,
      value: showIcons,
      onChange: setShowIcons,
    },
  ];

  const generateCode = () => {
    const listProps = [`size="${size}"`];
    if (color !== 'theme') listProps.push(`color="${color}"`);
    if (justify !== 'start') listProps.push(`justify="${justify}"`);

    const triggers = tabs
      .map((t) =>
        showIcons
          ? `    <Tabs.Trigger value="${t.value}">
      <HugeiconsIcon icon={${t.iconName}} strokeWidth={1.75} />
      ${t.label}
    </Tabs.Trigger>`
          : `    <Tabs.Trigger value="${t.value}">${t.label}</Tabs.Trigger>`,
      )
      .join('\n');

    const panels = tabs
      .map(
        (t) => `    <Tabs.Content value="${t.value}">
      <Text size="2">${t.body}</Text>
    </Tabs.Content>`,
      )
      .join('\n');

    return `<Tabs.Root defaultValue="overview">
  <Tabs.List ${listProps.join(' ')}>
${triggers}
  </Tabs.List>
  <Box pt="4">
${panels}
  </Box>
</Tabs.Root>`;
  };

  return (
    <Playground
      component={
        <Flex direction="column" width="440px" maxWidth="100%" px="4">
          <Tabs.Root value={value} onValueChange={setValue}>
            <Tabs.List size={size as any} color={color === 'theme' ? undefined : (color as any)} justify={justify as any}>
              {tabs.map((t) => (
                <Tabs.Trigger key={t.value} value={t.value}>
                  {showIcons ? <HugeiconsIcon icon={t.icon} strokeWidth={1.75} /> : null}
                  {t.label}
                </Tabs.Trigger>
              ))}
            </Tabs.List>
            <Box pt="4">
              {tabs.map((t) => (
                <Tabs.Content key={t.value} value={t.value}>
                  <Text size="2">{t.body}</Text>
                </Tabs.Content>
              ))}
            </Box>
          </Tabs.Root>
        </Flex>
      }
      code={generateCode()}
      items={items}
      showControls={showControls}
      showToolbar={showToolbar}
      height={height}
    />
  );
}
