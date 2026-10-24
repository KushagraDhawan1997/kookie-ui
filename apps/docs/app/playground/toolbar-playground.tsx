'use client';

import React from 'react';
import { Box, Flex, Text, Toolbar } from '@kushagradhawan/kookie-ui';
import { HugeiconsIcon } from '@hugeicons/react';
import { Redo02Icon, TextBoldIcon, TextItalicIcon, TextUnderlineIcon, Undo02Icon } from '@hugeicons/core-free-icons';
import Playground from '@/components/playground';

const sizes = ['1', '2', '3', '4'] as const;
const orientations = ['horizontal', 'vertical'] as const;

const styles = [
  { id: 'bold', label: 'Bold', icon: TextBoldIcon, iconName: 'TextBoldIcon' },
  { id: 'italic', label: 'Italic', icon: TextItalicIcon, iconName: 'TextItalicIcon' },
  { id: 'underline', label: 'Underline', icon: TextUnderlineIcon, iconName: 'TextUnderlineIcon' },
] as const;

type StyleId = (typeof styles)[number]['id'];

const DEFAULT_HEIGHT = '24rem';

type ToolbarPlaygroundProps = {
  showControls?: boolean;
  showToolbar?: boolean;
  height?: string;
};

export default function ToolbarPlayground({ showControls = false, showToolbar = true, height = DEFAULT_HEIGHT }: ToolbarPlaygroundProps = {}) {
  const [size, setSize] = React.useState<(typeof sizes)[number]>('2');
  const [orientation, setOrientation] = React.useState<(typeof orientations)[number]>('horizontal');
  const [backdrop, setBackdrop] = React.useState(false);
  const [title, setTitle] = React.useState(true);
  const [locked, setLocked] = React.useState(false);
  const [pressed, setPressed] = React.useState<Record<StyleId, boolean>>({ bold: true, italic: false, underline: false });

  const vertical = orientation === 'vertical';
  // A title reads along a row; a vertical strip has no room for it.
  const showTitle = title && !vertical;

  const toggle = (id: StyleId) => setPressed((prev) => ({ ...prev, [id]: !prev[id] }));

  const generateCode = () => {
    const rootProps = ['aria-label="Formatting"'];
    if (size !== '2') rootProps.push(`size="${size}"`);
    if (vertical) rootProps.push('orientation="vertical"');
    if (backdrop) rootProps.push('backdrop');

    const groupProps = ['aria-label="Text style"'];
    if (locked) groupProps.push('disabled');

    const buttons = styles
      .map(
        (style) => `        <Toolbar.Button
          iconOnly
          aria-label="${style.label}"
          aria-pressed={${style.id}}
          onClick={() => set${style.label}(!${style.id})}
        >
          <HugeiconsIcon icon={${style.iconName}} strokeWidth={1.75} />
        </Toolbar.Button>`,
      )
      .join('\n');

    const state = styles.map((style) => `  const [${style.id}, set${style.label}] = React.useState(${pressed[style.id]});`).join('\n');

    return `import React from 'react';
import { Flex, Toolbar } from '@kushagradhawan/kookie-ui';
import { HugeiconsIcon } from '@hugeicons/react';
import { Redo02Icon, TextBoldIcon, TextItalicIcon, TextUnderlineIcon, Undo02Icon } from '@hugeicons/core-free-icons';

export function EditorToolbar() {
${state}

  return (
    <Toolbar ${rootProps.join(' ')}>${showTitle ? '\n      <Toolbar.Title>Meeting notes</Toolbar.Title>' : ''}
      <Flex ${vertical ? 'direction="column" ' : ''}gap="3" align="center">
        <Toolbar.Button iconOnly aria-label="Undo">
          <HugeiconsIcon icon={Undo02Icon} strokeWidth={1.75} />
        </Toolbar.Button>
        <Toolbar.Button iconOnly aria-label="Redo">
          <HugeiconsIcon icon={Redo02Icon} strokeWidth={1.75} />
        </Toolbar.Button>
        <Toolbar.Separator />
        <Toolbar.Group ${groupProps.join(' ')}>
${buttons.replace(/^/gm, '  ')}
        </Toolbar.Group>${vertical ? '' : '\n        <Toolbar.Button emphasis="loud">Share</Toolbar.Button>'}
      </Flex>
    </Toolbar>
  );
}`;
  };

  const toolbar = (
    <Toolbar aria-label="Formatting" size={size} orientation={orientation} backdrop={backdrop}>
      {showTitle ? <Toolbar.Title>Meeting notes</Toolbar.Title> : null}
      <Flex direction={vertical ? 'column' : 'row'} gap="3" align="center">
        <Toolbar.Button iconOnly aria-label="Undo">
          <HugeiconsIcon icon={Undo02Icon} strokeWidth={1.75} />
        </Toolbar.Button>
        <Toolbar.Button iconOnly aria-label="Redo">
          <HugeiconsIcon icon={Redo02Icon} strokeWidth={1.75} />
        </Toolbar.Button>
        <Toolbar.Separator />
        <Toolbar.Group aria-label="Text style" disabled={locked}>
          {styles.map((style) => (
            <Toolbar.Button key={style.id} iconOnly aria-label={style.label} aria-pressed={pressed[style.id]} onClick={() => toggle(style.id)}>
              <HugeiconsIcon icon={style.icon} strokeWidth={1.75} />
            </Toolbar.Button>
          ))}
        </Toolbar.Group>
        {vertical ? null : <Toolbar.Button emphasis="loud">Share</Toolbar.Button>}
      </Flex>
    </Toolbar>
  );

  const component = (
    <Box width="100%" maxWidth="640px" style={{ border: '1px solid var(--neutral-a4)', borderRadius: 'var(--radius-4)' }} overflow="hidden">
      <Flex direction={vertical ? 'row' : 'column'} gap="4" p="4" style={{ background: 'var(--neutral-a2)' }}>
        {toolbar}
        <Flex direction="column" gap="2" flexGrow="1" p="2">
          <Text
            size="3"
            weight={pressed.bold ? 'semibold' : 'regular'}
            style={{ fontStyle: pressed.italic ? 'italic' : undefined, textDecoration: pressed.underline ? 'underline' : undefined }}
          >
            Agenda for Thursday
          </Text>
          <Text size="2" emphasis="medium">
            {locked ? 'This document is locked, so the text style tools are off.' : 'Select a style to apply it to the heading.'}
          </Text>
        </Flex>
      </Flex>
    </Box>
  );

  const items = [
    {
      id: 'size',
      label: 'Size',
      type: 'select' as const,
      value: size,
      onChange: (next: string) => setSize(next as (typeof sizes)[number]),
      options: sizes.map((option) => ({ label: option, value: option })),
      placeholder: 'Size',
    },
    {
      id: 'orientation',
      label: 'Orientation',
      type: 'select' as const,
      value: orientation,
      onChange: (next: string) => setOrientation(next as (typeof orientations)[number]),
      options: orientations.map((option) => ({ label: option, value: option })),
      placeholder: 'Orientation',
    },
    {
      id: 'backdrop',
      label: 'Backdrop',
      type: 'switch' as const,
      value: backdrop,
      onChange: setBackdrop,
    },
    {
      id: 'title',
      label: 'Title',
      type: 'switch' as const,
      value: title,
      onChange: setTitle,
    },
    {
      id: 'locked',
      label: 'Group disabled',
      type: 'switch' as const,
      value: locked,
      onChange: setLocked,
    },
  ];

  return <Playground component={component} code={generateCode()} items={items} showControls={showControls} showToolbar={showToolbar} height={height} />;
}
