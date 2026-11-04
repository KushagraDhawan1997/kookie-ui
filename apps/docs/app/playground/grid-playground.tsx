'use client';

import React from 'react';
import { Box, Card, Flex, Grid, Text } from '@kushagradhawan/kookie-ui';
import Playground from '@/components/playground';

const columnOptions = ['1', '2', '3', '4'] as const;
const gaps = ['0', '1', '2', '3', '4', '5', '6'] as const;
const aligns = ['start', 'center', 'end', 'stretch'] as const;

const stats = [
  { label: 'Visitors', value: '12,480', note: 'Up 8% this week' },
  { label: 'Sign-ups', value: '312' },
  { label: 'Revenue', value: '$4,920', note: 'From 41 orders' },
  { label: 'Churn', value: '1.2%' },
];

type GridPlaygroundProps = {
  showControls?: boolean;
  showToolbar?: boolean;
  height?: string;
};

export default function GridPlayground({ showControls = false, showToolbar = true, height }: GridPlaygroundProps = {}) {
  const [columns, setColumns] = React.useState<string>('2');
  const [gap, setGap] = React.useState<string>('3');
  const [align, setAlign] = React.useState<string>('stretch');

  const items = [
    {
      id: 'columns',
      label: 'Columns',
      type: 'select' as const,
      value: columns,
      onChange: setColumns,
      options: columnOptions.map((c) => ({ label: c, value: c })),
      placeholder: 'Select columns',
    },
    {
      id: 'gap',
      label: 'Gap',
      type: 'select' as const,
      value: gap,
      onChange: setGap,
      options: gaps.map((g) => ({ label: g, value: g })),
      placeholder: 'Select gap',
    },
    {
      id: 'align',
      label: 'Align',
      type: 'select' as const,
      value: align,
      onChange: setAlign,
      options: aligns.map((a) => ({ label: a, value: a })),
      placeholder: 'Select align',
    },
  ];

  const generateCode = () => {
    const props = [`columns="${columns}"`, `gap="${gap}"`];
    if (align !== 'stretch') props.push(`align="${align}"`);

    return `<Grid ${props.join(' ')}>
  {stats.map((stat) => (
    <Card key={stat.label} size="1">
      <Flex direction="column" gap="1">
        <Text size="1" emphasis="medium">{stat.label}</Text>
        <Text size="5" weight="semibold">{stat.value}</Text>
        {stat.note && <Text size="1" emphasis="quiet">{stat.note}</Text>}
      </Flex>
    </Card>
  ))}
</Grid>`;
  };

  return (
    <Playground
      component={
        <Box width="100%" maxWidth="480px" px="4">
          <Grid columns={columns as any} gap={gap as any} align={align as any}>
            {stats.map((stat) => (
              <Card key={stat.label} size="1">
                <Flex direction="column" gap="1">
                  <Text size="1" emphasis="medium">
                    {stat.label}
                  </Text>
                  <Text size="5" weight="semibold">
                    {stat.value}
                  </Text>
                  {stat.note && (
                    <Text size="1" emphasis="quiet">
                      {stat.note}
                    </Text>
                  )}
                </Flex>
              </Card>
            ))}
          </Grid>
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
