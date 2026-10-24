'use client';

import React from 'react';
import { AccessibleIcon, Button, Card, Code, Flex, Text, VisuallyHidden } from '@kushagradhawan/kookie-ui';
import { HugeiconsIcon } from '@hugeicons/react';
import { AlertCircleIcon, CheckmarkCircle02Icon, Delete02Icon, Edit02Icon, Share08Icon } from '@hugeicons/core-free-icons';
import Playground from '@/components/playground';

const actions = [
  { id: 'edit', label: 'Edit file', icon: Edit02Icon, iconName: 'Edit02Icon' },
  { id: 'share', label: 'Share file', icon: Share08Icon, iconName: 'Share08Icon' },
  { id: 'delete', label: 'Delete file', icon: Delete02Icon, iconName: 'Delete02Icon' },
];

const statuses = {
  synced: { label: 'Synced', icon: CheckmarkCircle02Icon, iconName: 'CheckmarkCircle02Icon', color: 'jade' },
  failed: { label: 'Sync failed', icon: AlertCircleIcon, iconName: 'AlertCircleIcon', color: 'red' },
} as const;

type UtilitiesPlaygroundProps = {
  showControls?: boolean;
  showToolbar?: boolean;
  height?: string;
};

export default function UtilitiesPlayground({ showControls = false, showToolbar = true, height }: UtilitiesPlaygroundProps = {}) {
  const [status, setStatus] = React.useState<string>('synced');
  const [reveal, setReveal] = React.useState<boolean>(false);

  const current = statuses[status as keyof typeof statuses];

  const items = [
    {
      id: 'status',
      label: 'Status',
      type: 'select' as const,
      value: status,
      onChange: setStatus,
      options: [
        { label: 'Synced', value: 'synced' },
        { label: 'Sync failed', value: 'failed' },
      ],
      placeholder: 'Select status',
    },
    {
      id: 'reveal',
      label: 'Reveal hidden text',
      type: 'switch' as const,
      value: reveal,
      onChange: setReveal,
    },
  ];

  const generateCode = () => {
    const buttons = actions
      .map(
        ({ id, label, iconName }) => `    <Button iconOnly variant="ghost" color="gray" aria-labelledby="${id}-label">
      <HugeiconsIcon icon={${iconName}} strokeWidth={1.75} />
      <VisuallyHidden id="${id}-label">${label}</VisuallyHidden>
    </Button>`,
      )
      .join('\n');

    return `<Flex align="center" justify="between" gap="3">
  <Flex align="center" gap="2">
    <Text size="2" weight="medium">roadmap.pdf</Text>
    <Text color="${current.color}">
      <AccessibleIcon label="${current.label}">
        <HugeiconsIcon icon={${current.iconName}} strokeWidth={1.75} />
      </AccessibleIcon>
    </Text>
  </Flex>
  <Flex gap="1">
${buttons}
  </Flex>
</Flex>`;
  };

  const revealed = (text: string) =>
    reveal ? (
      <Code variant="soft" color="gray" size="1" aria-hidden>
        {text}
      </Code>
    ) : null;

  return (
    <Playground
      component={
        <Card size="2">
          <Flex align="start" justify="between" gap="5">
            <Flex direction="column" gap="2">
              <Flex align="center" gap="2" height="32px">
                <Text size="2" weight="medium">
                  roadmap.pdf
                </Text>
                <Text color={current.color}>
                  <AccessibleIcon label={current.label}>
                    <HugeiconsIcon icon={current.icon} strokeWidth={1.75} />
                  </AccessibleIcon>
                </Text>
              </Flex>
              {revealed(current.label)}
            </Flex>
            <Flex gap="1" align="start">
              {actions.map(({ id, label, icon }) => (
                <Flex key={id} direction="column" align="center" gap="2">
                  <Button iconOnly variant="ghost" color="gray" aria-labelledby={`utilities-${id}-label`}>
                    <HugeiconsIcon icon={icon} strokeWidth={1.75} />
                    <VisuallyHidden id={`utilities-${id}-label`}>{label}</VisuallyHidden>
                  </Button>
                  {revealed(label)}
                </Flex>
              ))}
            </Flex>
          </Flex>
        </Card>
      }
      code={generateCode()}
      items={items}
      showControls={showControls}
      showToolbar={showToolbar}
      height={height}
    />
  );
}
