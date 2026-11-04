'use client';

import React from 'react';
import { Box, Table, Text } from '@kushagradhawan/kookie-ui';
import Playground from '@/components/playground';

const sizes = ['1', '2', '3', '4'] as const;
const variants = ['surface', 'ghost'] as const;
const layouts = ['auto', 'fixed'] as const;

const people = [
  { name: 'Ana Rivera', email: 'ana@acme.co', role: 'Owner' },
  { name: 'Leo Park', email: 'leo@acme.co', role: 'Admin' },
  { name: 'Mia Chen', email: 'mia@acme.co', role: 'Member' },
];

type TablePlaygroundProps = {
  showControls?: boolean;
  showToolbar?: boolean;
  height?: string;
};

export default function TablePlayground({ showControls = false, showToolbar = true, height }: TablePlaygroundProps = {}) {
  const [variant, setVariant] = React.useState<string>('surface');
  const [size, setSize] = React.useState<string>('2');
  const [layout, setLayout] = React.useState<string>('auto');

  const items = [
    {
      id: 'variant',
      label: 'Variant',
      type: 'select' as const,
      value: variant,
      onChange: setVariant,
      options: variants.map((v) => ({ label: v, value: v })),
      placeholder: 'Select variant',
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
    {
      id: 'layout',
      label: 'Layout',
      type: 'select' as const,
      value: layout,
      onChange: setLayout,
      options: layouts.map((l) => ({ label: l, value: l })),
      placeholder: 'Select layout',
    },
  ];

  const generateCode = () => {
    const props = [`variant="${variant}"`, `size="${size}"`];
    if (layout !== 'auto') props.push(`layout="${layout}"`);

    return `<Table.Root ${props.join(' ')}>
  <Table.Header>
    <Table.Row>
      <Table.ColumnHeaderCell>Name</Table.ColumnHeaderCell>
      <Table.ColumnHeaderCell>Email</Table.ColumnHeaderCell>
      <Table.ColumnHeaderCell justify="end">Role</Table.ColumnHeaderCell>
    </Table.Row>
  </Table.Header>
  <Table.Body>
    {people.map((person) => (
      <Table.Row key={person.email}>
        <Table.RowHeaderCell>{person.name}</Table.RowHeaderCell>
        <Table.Cell>{person.email}</Table.Cell>
        <Table.Cell justify="end">{person.role}</Table.Cell>
      </Table.Row>
    ))}
  </Table.Body>
</Table.Root>`;
  };

  return (
    <Playground
      component={
        <Box width="100%" maxWidth="520px" px="4">
          <Table.Root variant={variant as any} size={size as any} layout={layout as any}>
            <Table.Header>
              <Table.Row>
                <Table.ColumnHeaderCell>Name</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell>Email</Table.ColumnHeaderCell>
                <Table.ColumnHeaderCell justify="end">Role</Table.ColumnHeaderCell>
              </Table.Row>
            </Table.Header>
            <Table.Body>
              {people.map((person) => (
                <Table.Row key={person.email}>
                  <Table.RowHeaderCell>{person.name}</Table.RowHeaderCell>
                  <Table.Cell>
                    <Text emphasis="medium">{person.email}</Text>
                  </Table.Cell>
                  <Table.Cell justify="end">{person.role}</Table.Cell>
                </Table.Row>
              ))}
            </Table.Body>
          </Table.Root>
        </Box>
      }
      code={generateCode()}
      items={items}
      showControls={showControls}
      showToolbar={showToolbar}
      height={height}
    />
  );
}
