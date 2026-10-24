'use client';

import React from 'react';
import { Button, DropdownMenu, VirtualMenu } from '@kushagradhawan/kookie-ui';
import Playground from '@/components/playground';

const sizes = ['1', '2', '3', '4'] as const;
const counts = ['100', '1000', '10000'] as const;
const listHeights = ['240', '320'] as const;
const overscans = ['5', '10', '20'] as const;

type Branch = { id: string; name: string };

const prefixes = ['feature', 'fix', 'release', 'chore', 'docs'];
const allBranches: Branch[] = Array.from({ length: 10000 }, (_, index) => ({
  id: `branch-${index}`,
  name: index === 0 ? 'main' : `${prefixes[index % prefixes.length]}/task-${index}`,
}));

type VirtualMenuPlaygroundProps = {
  showControls?: boolean;
  showToolbar?: boolean;
  height?: string;
};

export default function VirtualMenuPlayground({
  showControls = false,
  showToolbar = true,
  height,
}: VirtualMenuPlaygroundProps = {}) {
  const [size, setSize] = React.useState<(typeof sizes)[number]>('2');
  const [count, setCount] = React.useState<(typeof counts)[number]>('1000');
  const [listHeight, setListHeight] = React.useState<(typeof listHeights)[number]>('320');
  const [overscan, setOverscan] = React.useState<(typeof overscans)[number]>('5');
  const [open, setOpen] = React.useState(false);
  const [current, setCurrent] = React.useState('main');

  const branches = React.useMemo(() => allBranches.slice(0, Number(count)), [count]);

  const generateCode = () => {
    const contentProps = ['virtualized'];
    if (size !== '2') contentProps.push(`size="${size}"`);
    const menuProps = ['items={branches}', 'itemLabel="name"', 'aria-label="Branches"'];
    if (overscan !== '5') menuProps.push(`overscan={${overscan}}`);

    return `import * as React from 'react';
import { Button, DropdownMenu, VirtualMenu } from '@kushagradhawan/kookie-ui';

// ${Number(count).toLocaleString('en-US')} branches
const branches = Array.from({ length: ${count} }, (_, index) => ({
  id: \`branch-\${index}\`,
  name: \`feature/task-\${index}\`,
}));

export function BranchPicker() {
  const [open, setOpen] = React.useState(false);
  const [current, setCurrent] = React.useState('main');

  return (
    <DropdownMenu.Root open={open} onOpenChange={setOpen}>
      <DropdownMenu.Trigger>
        <Button>
          {current}
          <DropdownMenu.TriggerIcon />
        </Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content ${contentProps.join(' ')}>
        <VirtualMenu
          ${menuProps.join('\n          ')}
          onSelect={(branch) => {
            setCurrent(branch.name);
            setOpen(false);
          }}
          style={{ height: ${listHeight} }}
        />
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  );
}`;
  };

  const component = (
    <DropdownMenu.Root open={open} onOpenChange={setOpen}>
      <DropdownMenu.Trigger>
        <Button>
          {current}
          <DropdownMenu.TriggerIcon />
        </Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content virtualized size={size}>
        <VirtualMenu
          items={branches}
          itemLabel="name"
          aria-label="Branches"
          overscan={Number(overscan)}
          onSelect={(branch) => {
            setCurrent(branch.name);
            setOpen(false);
          }}
          // VirtualMenu has no height prop; the list needs a fixed height to measure.
          style={{ height: Number(listHeight) }}
        />
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
      id: 'count',
      label: 'Items',
      type: 'select' as const,
      value: count,
      onChange: (next: string) => setCount(next as (typeof counts)[number]),
      options: counts.map((option) => ({ label: Number(option).toLocaleString('en-US'), value: option })),
      placeholder: 'Item count',
    },
    {
      id: 'height',
      label: 'List height',
      type: 'select' as const,
      value: listHeight,
      onChange: (next: string) => setListHeight(next as (typeof listHeights)[number]),
      options: listHeights.map((option) => ({ label: `${option}px`, value: option })),
      placeholder: 'Height',
    },
    {
      id: 'overscan',
      label: 'Overscan',
      type: 'select' as const,
      value: overscan,
      onChange: (next: string) => setOverscan(next as (typeof overscans)[number]),
      options: overscans.map((option) => ({ label: option, value: option })),
      placeholder: 'Overscan',
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
