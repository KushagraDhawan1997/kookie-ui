'use client';

import React from 'react';
import { Avatar, Box, Button, Card, Flex, Separator, Text } from '@kushagradhawan/kookie-ui';
import { HugeiconsIcon } from '@hugeicons/react';
import { TextBoldIcon, TextItalicIcon, TextUnderlineIcon, Edit02Icon, Share08Icon, Delete02Icon } from '@hugeicons/core-free-icons';
import Playground from '@/components/playground';

const orientations = ['horizontal', 'vertical'] as const;
const accentColors = ['gray', 'gold', 'amber', 'crimson', 'plum', 'iris', 'blue', 'teal', 'jade', 'grass'] as const;

type SeparatorPlaygroundProps = {
  showControls?: boolean;
  showToolbar?: boolean;
  height?: string;
};

export default function SeparatorPlayground({ showControls = false, showToolbar = true, height }: SeparatorPlaygroundProps = {}) {
  const [orientation, setOrientation] = React.useState<string>('horizontal');
  const [color, setColor] = React.useState<string>('gray');
  const [light, setLight] = React.useState<boolean>(false);

  const items = [
    {
      id: 'orientation',
      label: 'Orientation',
      type: 'select' as const,
      value: orientation,
      onChange: setOrientation,
      options: orientations.map((o) => ({ label: o, value: o })),
      placeholder: 'Select orientation',
    },
    {
      id: 'color',
      label: 'Color',
      type: 'select' as const,
      value: color,
      onChange: setColor,
      options: accentColors.map((c) => ({ label: c, value: c })),
      placeholder: 'gray',
      appearance: 'swatch' as const,
    },
    {
      id: 'light',
      label: 'Light',
      type: 'switch' as const,
      value: light,
      onChange: setLight,
    },
  ];

  const separatorProps = [orientation === 'vertical' ? 'orientation="vertical"' : '', color !== 'gray' ? `color="${color}"` : '', light ? 'light' : ''].filter(Boolean).join(' ');
  const separatorCode = `<Separator${separatorProps ? ` ${separatorProps}` : ''} />`;

  const generateCode = () => {
    if (orientation === 'vertical') {
      return `<Flex align="center" gap="2" height="32px">
  <Button iconOnly variant="ghost" color="gray" aria-label="Bold">
    <HugeiconsIcon icon={TextBoldIcon} strokeWidth={1.75} />
  </Button>
  <Button iconOnly variant="ghost" color="gray" aria-label="Italic">
    <HugeiconsIcon icon={TextItalicIcon} strokeWidth={1.75} />
  </Button>
  <Button iconOnly variant="ghost" color="gray" aria-label="Underline">
    <HugeiconsIcon icon={TextUnderlineIcon} strokeWidth={1.75} />
  </Button>
  ${separatorCode}
  <Button iconOnly variant="ghost" color="gray" aria-label="Edit">
    <HugeiconsIcon icon={Edit02Icon} strokeWidth={1.75} />
  </Button>
  <Button iconOnly variant="ghost" color="gray" aria-label="Share">
    <HugeiconsIcon icon={Share08Icon} strokeWidth={1.75} />
  </Button>
  <Button iconOnly variant="ghost" color="gray" aria-label="Delete">
    <HugeiconsIcon icon={Delete02Icon} strokeWidth={1.75} />
  </Button>
</Flex>`;
    }
    return `<Card size="2">
  <Flex direction="column" gap="3">
    <Flex align="center" gap="3">
      <Avatar fallback="AR" />
      <Flex direction="column">
        <Text size="2" weight="medium">Ana Rivera</Text>
        <Text size="2" emphasis="medium">Design lead</Text>
      </Flex>
    </Flex>
    ${separatorCode}
    <Text size="2" emphasis="medium">Joined March 2024 · Lisbon</Text>
  </Flex>
</Card>`;
  };

  const separator = <Separator orientation={orientation as any} color={color as any} light={light} />;

  const iconButton = (icon: typeof TextBoldIcon, label: string) => (
    <Button iconOnly variant="ghost" color="gray" aria-label={label}>
      <HugeiconsIcon icon={icon} strokeWidth={1.75} />
    </Button>
  );

  return (
    <Playground
      component={
        orientation === 'vertical' ? (
          <Flex align="center" gap="2" height="32px">
            {iconButton(TextBoldIcon, 'Bold')}
            {iconButton(TextItalicIcon, 'Italic')}
            {iconButton(TextUnderlineIcon, 'Underline')}
            {separator}
            {iconButton(Edit02Icon, 'Edit')}
            {iconButton(Share08Icon, 'Share')}
            {iconButton(Delete02Icon, 'Delete')}
          </Flex>
        ) : (
          <Box width="280px">
            <Card size="2">
              <Flex direction="column" gap="3">
                <Flex align="center" gap="3">
                  <Avatar fallback="AR" />
                  <Flex direction="column">
                    <Text size="2" weight="medium">
                      Ana Rivera
                    </Text>
                    <Text size="2" emphasis="medium">
                      Design lead
                    </Text>
                  </Flex>
                </Flex>
                {separator}
                <Text size="2" emphasis="medium">
                  Joined March 2024 · Lisbon
                </Text>
              </Flex>
            </Card>
          </Box>
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
