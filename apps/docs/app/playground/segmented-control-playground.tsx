'use client';

import React from 'react';
import { SegmentedControl } from '@kushagradhawan/kookie-ui';
import { HugeiconsIcon } from '@hugeicons/react';
import { Menu01Icon, Grid02Icon, LayoutIcon } from '@hugeicons/core-free-icons';
import Playground from '@/components/playground';

const sizes = ['1', '2', '3', '4'] as const;
const radiusOptions = ['none', 'small', 'medium', 'large', 'full'] as const;
const orientations = ['horizontal', 'vertical'] as const;

type SegmentedControlPlaygroundProps = {
  showControls?: boolean;
  showToolbar?: boolean;
  height?: string;
};

export default function SegmentedControlPlayground({
  showControls = false,
  showToolbar = true,
  height,
}: SegmentedControlPlaygroundProps = {}) {
  const [size, setSize] = React.useState<string>('2');
  const [radius, setRadius] = React.useState<string>('theme');
  const [orientation, setOrientation] = React.useState<string>('horizontal');
  const [disabled, setDisabled] = React.useState<boolean>(false);
  const [iconOnly, setIconOnly] = React.useState<boolean>(false);
  const [value, setValue] = React.useState<string>('grid');

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
      id: 'radius',
      label: 'Radius',
      type: 'select' as const,
      value: radius,
      onChange: setRadius,
      options: [{ label: 'Theme', value: 'theme' }, ...radiusOptions.map((r) => ({ label: r, value: r }))],
      placeholder: 'Theme',
    },
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
      id: 'disabled',
      label: 'Disabled',
      type: 'switch' as const,
      value: disabled,
      onChange: setDisabled,
    },
    {
      id: 'icon-only',
      label: 'Icon Only',
      type: 'switch' as const,
      value: iconOnly,
      onChange: setIconOnly,
    },
  ];

  const generateCode = () => {
    const props = [`size="${size}"`, 'defaultValue="grid"'];

    if (radius !== 'theme') props.push(`radius="${radius}"`);
    if (orientation !== 'horizontal') props.push(`orientation="${orientation}"`);
    if (disabled) props.push('disabled');

    const propsString = props.length > 0 ? `\n  ${props.join('\n  ')}` : '';

    if (iconOnly) {
      return `import { SegmentedControl } from '@kushagradhawan/kookie-ui';
import { HugeiconsIcon } from '@hugeicons/react';
import { Menu01Icon, Grid02Icon, LayoutIcon } from '@hugeicons/core-free-icons';

<SegmentedControl.Root${propsString}>
  <SegmentedControl.Item value="list" iconOnly aria-label="List view">
    <HugeiconsIcon icon={Menu01Icon} strokeWidth={1.75} />
  </SegmentedControl.Item>
  <SegmentedControl.Item value="grid" iconOnly aria-label="Grid view">
    <HugeiconsIcon icon={Grid02Icon} strokeWidth={1.75} />
  </SegmentedControl.Item>
  <SegmentedControl.Item value="board" iconOnly aria-label="Board view">
    <HugeiconsIcon icon={LayoutIcon} strokeWidth={1.75} />
  </SegmentedControl.Item>
</SegmentedControl.Root>`;
    }

    return `<SegmentedControl.Root${propsString}>
  <SegmentedControl.Item value="list">List</SegmentedControl.Item>
  <SegmentedControl.Item value="grid">Grid</SegmentedControl.Item>
  <SegmentedControl.Item value="board">Board</SegmentedControl.Item>
</SegmentedControl.Root>`;
  };

  return (
    <Playground
      component={
        <SegmentedControl.Root
          size={size as any}
          radius={radius === 'theme' ? undefined : (radius as any)}
          orientation={orientation as any}
          disabled={disabled}
          value={value}
          onValueChange={setValue}
        >
          {iconOnly ? (
            <>
              <SegmentedControl.Item value="list" iconOnly aria-label="List view">
                <HugeiconsIcon icon={Menu01Icon} strokeWidth={1.75} />
              </SegmentedControl.Item>
              <SegmentedControl.Item value="grid" iconOnly aria-label="Grid view">
                <HugeiconsIcon icon={Grid02Icon} strokeWidth={1.75} />
              </SegmentedControl.Item>
              <SegmentedControl.Item value="board" iconOnly aria-label="Board view">
                <HugeiconsIcon icon={LayoutIcon} strokeWidth={1.75} />
              </SegmentedControl.Item>
            </>
          ) : (
            <>
              <SegmentedControl.Item value="list">List</SegmentedControl.Item>
              <SegmentedControl.Item value="grid">Grid</SegmentedControl.Item>
              <SegmentedControl.Item value="board">Board</SegmentedControl.Item>
            </>
          )}
        </SegmentedControl.Root>
      }
      code={generateCode()}
      items={items}
      showControls={showControls}
      showToolbar={showToolbar}
      height={height}
    />
  );
}
