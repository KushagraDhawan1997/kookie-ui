'use client';

import React from 'react';
import { AlertDialog, Button, Flex } from '@kushagradhawan/kookie-ui';
import Playground from '@/components/playground';

const sizes = ['1', '2', '3', '4'] as const;
const aligns = ['center', 'start'] as const;
const maxWidths = ['default', '360px', '480px'] as const;
const actionColors = ['red', 'theme'] as const;

type AlertDialogPlaygroundProps = {
  showControls?: boolean;
  showToolbar?: boolean;
  height?: string;
};

export default function AlertDialogPlayground({
  showControls = false,
  showToolbar = true,
  height,
}: AlertDialogPlaygroundProps = {}) {
  const [size, setSize] = React.useState<(typeof sizes)[number]>('1');
  const [align, setAlign] = React.useState<(typeof aligns)[number]>('center');
  const [maxWidth, setMaxWidth] = React.useState<(typeof maxWidths)[number]>('default');
  const [actionColor, setActionColor] = React.useState<(typeof actionColors)[number]>('red');

  const colorProp = actionColor === 'red' ? ' color="red"' : '';

  const generateCode = () => {
    const contentProps: string[] = [];
    if (size !== '2') contentProps.push(`size="${size}"`);
    if (align !== 'center') contentProps.push(`align="${align}"`);
    if (maxWidth !== 'default') contentProps.push(`maxWidth="${maxWidth}"`);
    const contentOpen = contentProps.length > 0 ? `<AlertDialog.Content ${contentProps.join(' ')}>` : '<AlertDialog.Content>';

    return `import { AlertDialog, Button, Flex } from '@kushagradhawan/kookie-ui';

export function DeleteProject({ onDelete }: { onDelete: () => void }) {
  return (
    <AlertDialog.Root>
      <AlertDialog.Trigger>
        <Button${colorProp}>Delete project</Button>
      </AlertDialog.Trigger>
      ${contentOpen}
        <AlertDialog.Title>Delete Northwind?</AlertDialog.Title>
        <AlertDialog.Description>
          The project and its files are removed for everyone. This can't be undone.
        </AlertDialog.Description>
        <Flex gap="2" justify="end" mt="5">
          <AlertDialog.Cancel>
            <Button emphasis="quiet" color="gray">Cancel</Button>
          </AlertDialog.Cancel>
          <AlertDialog.Action>
            <Button${colorProp} onClick={onDelete}>Delete project</Button>
          </AlertDialog.Action>
        </Flex>
      </AlertDialog.Content>
    </AlertDialog.Root>
  );
}`;
  };

  const buttonColor = actionColor === 'red' ? 'red' : undefined;

  const component = (
    <AlertDialog.Root>
      <AlertDialog.Trigger>
        <Button color={buttonColor}>Delete project</Button>
      </AlertDialog.Trigger>
      <AlertDialog.Content size={size} align={align} maxWidth={maxWidth === 'default' ? undefined : maxWidth}>
        <AlertDialog.Title>Delete Northwind?</AlertDialog.Title>
        <AlertDialog.Description>The project and its files are removed for everyone. This can&apos;t be undone.</AlertDialog.Description>
        <Flex gap="2" justify="end" mt="5">
          <AlertDialog.Cancel>
            <Button emphasis="quiet" color="gray">
              Cancel
            </Button>
          </AlertDialog.Cancel>
          <AlertDialog.Action>
            <Button color={buttonColor}>Delete project</Button>
          </AlertDialog.Action>
        </Flex>
      </AlertDialog.Content>
    </AlertDialog.Root>
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
      id: 'align',
      label: 'Align',
      type: 'select' as const,
      value: align,
      onChange: (next: string) => setAlign(next as (typeof aligns)[number]),
      options: aligns.map((option) => ({ label: option, value: option })),
      placeholder: 'Select align',
    },
    {
      id: 'maxWidth',
      label: 'Max width',
      type: 'select' as const,
      value: maxWidth,
      onChange: (next: string) => setMaxWidth(next as (typeof maxWidths)[number]),
      options: maxWidths.map((option) => ({ label: option === 'default' ? 'Size default' : option, value: option })),
      placeholder: 'Size default',
    },
    {
      id: 'actionColor',
      label: 'Action color',
      type: 'select' as const,
      value: actionColor,
      onChange: (next: string) => setActionColor(next as (typeof actionColors)[number]),
      options: actionColors.map((option) => ({ label: option, value: option })),
      placeholder: 'Theme',
      appearance: 'swatch' as const,
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
