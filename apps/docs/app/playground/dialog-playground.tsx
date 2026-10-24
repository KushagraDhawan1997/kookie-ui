'use client';

import React from 'react';
import { Button, Dialog, Flex, Text, TextField } from '@kushagradhawan/kookie-ui';
import Playground from '@/components/playground';

const sizes = ['1', '2', '3', '4'] as const;
const aligns = ['center', 'start'] as const;
const maxWidths = ['default', '360px', '480px', '640px'] as const;

type DialogPlaygroundProps = {
  showControls?: boolean;
  showToolbar?: boolean;
  height?: string;
};

export default function DialogPlayground({
  showControls = false,
  showToolbar = true,
  height,
}: DialogPlaygroundProps = {}) {
  const [size, setSize] = React.useState<(typeof sizes)[number]>('2');
  const [align, setAlign] = React.useState<(typeof aligns)[number]>('center');
  const [maxWidth, setMaxWidth] = React.useState<(typeof maxWidths)[number]>('default');
  const [showDescription, setShowDescription] = React.useState(true);

  const generateCode = () => {
    const contentProps: string[] = [];
    if (size !== '2') contentProps.push(`size="${size}"`);
    if (align !== 'center') contentProps.push(`align="${align}"`);
    if (maxWidth !== 'default') contentProps.push(`maxWidth="${maxWidth}"`);
    const contentOpen = contentProps.length > 0 ? `<Dialog.Content ${contentProps.join(' ')}>` : '<Dialog.Content>';
    const description = showDescription
      ? `\n        <Dialog.Description>People in the project see the new name.</Dialog.Description>`
      : '';

    return `import { Button, Dialog, Flex, Text, TextField } from '@kushagradhawan/kookie-ui';

export function RenameProject() {
  return (
    <Dialog.Root>
      <Dialog.Trigger>
        <Button>Rename</Button>
      </Dialog.Trigger>
      ${contentOpen}
        <Dialog.Title>Rename project</Dialog.Title>${description}
        <Flex direction="column" gap="2" mt="4">
          <Text as="label" htmlFor="project-name" size="2" weight="medium">
            Project name
          </Text>
          <TextField.Root id="project-name" defaultValue="Northwind" />
        </Flex>
        <Flex gap="2" justify="end" mt="5">
          <Dialog.Close>
            <Button emphasis="quiet" color="gray">Cancel</Button>
          </Dialog.Close>
          <Dialog.Close>
            <Button emphasis="loud">Save</Button>
          </Dialog.Close>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  );
}`;
  };

  const component = (
    <Dialog.Root>
      <Dialog.Trigger>
        <Button>Rename</Button>
      </Dialog.Trigger>
      <Dialog.Content size={size} align={align} maxWidth={maxWidth === 'default' ? undefined : maxWidth}>
        <Dialog.Title>Rename project</Dialog.Title>
        {showDescription ? <Dialog.Description>People in the project see the new name.</Dialog.Description> : null}
        <Flex direction="column" gap="2" mt="4">
          <Text as="label" htmlFor="playground-project-name" size="2" weight="medium">
            Project name
          </Text>
          <TextField.Root id="playground-project-name" defaultValue="Northwind" />
        </Flex>
        <Flex gap="2" justify="end" mt="5">
          <Dialog.Close>
            <Button emphasis="quiet" color="gray">
              Cancel
            </Button>
          </Dialog.Close>
          <Dialog.Close>
            <Button emphasis="loud">Save</Button>
          </Dialog.Close>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
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
      id: 'description',
      label: 'Description',
      type: 'switch' as const,
      value: showDescription,
      onChange: setShowDescription,
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
