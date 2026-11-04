'use client';

import React from 'react';
import { Box, Button, Card, Flex } from '@kushagradhawan/kookie-ui';
import Playground from '@/components/playground';

const directions = ['row', 'column', 'row-reverse', 'column-reverse'] as const;
const aligns = ['start', 'center', 'end', 'baseline', 'stretch'] as const;
const justifies = ['start', 'center', 'end', 'between'] as const;
const gaps = ['0', '1', '2', '3', '4', '5', '6'] as const;

type FlexPlaygroundProps = {
  showControls?: boolean;
  showToolbar?: boolean;
  height?: string;
};

export default function FlexPlayground({ showControls = false, showToolbar = true, height }: FlexPlaygroundProps = {}) {
  const [direction, setDirection] = React.useState<string>('row');
  const [align, setAlign] = React.useState<string>('center');
  const [justify, setJustify] = React.useState<string>('end');
  const [gap, setGap] = React.useState<string>('3');

  const items = [
    {
      id: 'direction',
      label: 'Direction',
      type: 'select' as const,
      value: direction,
      onChange: setDirection,
      options: directions.map((d) => ({ label: d, value: d })),
      placeholder: 'Select direction',
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
    {
      id: 'justify',
      label: 'Justify',
      type: 'select' as const,
      value: justify,
      onChange: setJustify,
      options: justifies.map((j) => ({ label: j, value: j })),
      placeholder: 'Select justify',
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
  ];

  const generateCode = () => {
    return `<Flex
  direction="${direction}"
  align="${align}"
  justify="${justify}"
  gap="${gap}"
  height="160px"
>
  <Button size="1" variant="ghost" color="gray">Cancel</Button>
  <Button size="2" variant="soft">Save draft</Button>
  <Button size="3" variant="solid">Publish</Button>
</Flex>`;
  };

  return (
    <Playground
      component={
        <Box width="100%" maxWidth="420px" px="4">
          <Card size="2" variant="surface">
            <Flex direction={direction as any} align={align as any} justify={justify as any} gap={gap as any} height="160px">
              <Button size="1" variant="ghost" color="gray">
                Cancel
              </Button>
              <Button size="2" variant="soft">
                Save draft
              </Button>
              <Button size="3" variant="solid">
                Publish
              </Button>
            </Flex>
          </Card>
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
