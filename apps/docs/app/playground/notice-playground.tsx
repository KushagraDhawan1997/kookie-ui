'use client';

import React from 'react';
import { Button, Confirmation, Flex, Notice } from '@kushagradhawan/kookie-ui';
import { HugeiconsIcon } from '@hugeicons/react';
import { Alert02Icon } from '@hugeicons/core-free-icons';
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

type NoticePlaygroundProps = {
  showControls?: boolean;
  showToolbar?: boolean;
  height?: string;
};

export default function NoticePlayground({ showControls = false, showToolbar = true, height }: NoticePlaygroundProps = {}) {
  const [kind, setKind] = React.useState<string>('notice');
  const [color, setColor] = React.useState<string>('gray');
  const [size, setSize] = React.useState<string>('2');
  const [hasAction, setHasAction] = React.useState(true);
  const [dismissible, setDismissible] = React.useState(true);
  const [hidden, setHidden] = React.useState(false);
  const [busy, setBusy] = React.useState(false);

  React.useEffect(() => {
    if (!busy) return;
    const timeout = window.setTimeout(() => {
      setBusy(false);
      setHidden(true);
    }, 1500);
    return () => window.clearTimeout(timeout);
  }, [busy]);

  const items = [
    {
      id: 'kind',
      label: 'Component',
      type: 'select' as const,
      value: kind,
      onChange: (next: string) => {
        setKind(next);
        setHidden(false);
        setBusy(false);
      },
      options: [
        { label: 'Notice', value: 'notice' },
        { label: 'Confirmation', value: 'confirmation' },
      ],
      placeholder: 'Select component',
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
      id: 'size',
      label: 'Size',
      type: 'select' as const,
      value: size,
      onChange: setSize,
      options: sizes.map((s) => ({ label: s, value: s })),
      placeholder: 'Select size',
    },
    ...(kind === 'notice'
      ? [
          {
            id: 'action',
            label: 'Action',
            type: 'switch' as const,
            value: hasAction,
            onChange: setHasAction,
          },
          {
            id: 'dismissible',
            label: 'Dismissible',
            type: 'switch' as const,
            value: dismissible,
            onChange: (next: boolean) => {
              setDismissible(next);
              setHidden(false);
            },
          },
        ]
      : []),
  ];

  const generateCode = () => {
    const colorProp = color !== 'gray' ? `\n  color="${color}"` : '';

    if (kind === 'confirmation') {
      return `<Confirmation
  size="${size}"${colorProp}
  confirmLabel="Allow up to $18"
  onConfirm={onAllow}
  onCancel={onDecline}
  busy={allowing}
>
  This run may use more than your daily budget.
</Confirmation>`;
    }

    const props = [`size="${size}"`];
    if (color !== 'gray') props.push(`color="${color}"`);
    props.push('icon={<HugeiconsIcon icon={Alert02Icon} strokeWidth={1.75} />}');
    if (hasAction) props.push(`action={<Button size="${size}" variant="soft" color="gray" onClick={onAddCredits}>Add credits</Button>}`);
    if (dismissible) props.push('onDismiss={onDismiss}');

    return `<Notice
  ${props.join('\n  ')}
>
  You have used 90% of this month's credits.
</Notice>`;
  };

  const noticeSize = size as any;
  const noticeColor = color as any;

  const component = hidden ? (
    <Button size="2" variant="soft" color="gray" onClick={() => setHidden(false)}>
      Show again
    </Button>
  ) : kind === 'confirmation' ? (
    <Confirmation size={noticeSize} color={noticeColor} confirmLabel="Allow up to $18" onConfirm={() => setBusy(true)} onCancel={() => setHidden(true)} busy={busy}>
      This run may use more than your daily budget.
    </Confirmation>
  ) : (
    <Notice
      size={noticeSize}
      color={noticeColor}
      icon={<HugeiconsIcon icon={Alert02Icon} strokeWidth={1.75} />}
      action={
        hasAction ? (
          <Button size={noticeSize} variant="soft" color="gray" onClick={() => setHidden(true)}>
            Add credits
          </Button>
        ) : undefined
      }
      onDismiss={dismissible ? () => setHidden(true) : undefined}
    >
      You have used 90% of this month&apos;s credits.
    </Notice>
  );

  return (
    <Playground
      component={
        <Flex direction="column" align="center" width="520px" maxWidth="100%" px="4">
          <Flex direction="column" width="100%" align={hidden ? 'center' : 'stretch'}>
            {component}
          </Flex>
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
