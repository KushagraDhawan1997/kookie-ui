'use client';

import React from 'react';
import { Box, Button, Flex, Heading, Shell, Sidebar, Text } from '@kushagradhawan/kookie-ui';
import { HugeiconsIcon } from '@hugeicons/react';
import { Analytics01Icon, Folder01Icon, Home01Icon, InboxIcon, Settings01Icon, SidebarLeft01Icon } from '@hugeicons/core-free-icons';
import Playground from '@/components/playground';

const presentations = ['fixed', 'overlay', 'stacked'] as const;
const states = ['expanded', 'collapsed'] as const;
const sizes = ['1', '2', '3'] as const;

const pages = [
  { id: 'home', label: 'Home', icon: Home01Icon },
  { id: 'inbox', label: 'Inbox', icon: InboxIcon },
  { id: 'projects', label: 'Projects', icon: Folder01Icon },
  { id: 'reports', label: 'Reports', icon: Analytics01Icon },
  { id: 'settings', label: 'Settings', icon: Settings01Icon },
];

const DEFAULT_HEIGHT = '32rem';

type ShellPlaygroundProps = {
  showControls?: boolean;
  showToolbar?: boolean;
  height?: string;
};

export default function ShellPlayground({ showControls = false, showToolbar = true, height = DEFAULT_HEIGHT }: ShellPlaygroundProps = {}) {
  const [presentation, setPresentation] = React.useState<(typeof presentations)[number]>('fixed');
  const [state, setState] = React.useState<(typeof states)[number]>('expanded');
  const [size, setSize] = React.useState<(typeof sizes)[number]>('2');
  const [inset, setInset] = React.useState(false);
  const [resizable, setResizable] = React.useState(false);
  const [page, setPage] = React.useState('projects');

  // An overlay starts closed; switching to it from an open fixed sidebar would cover the frame at once.
  const changePresentation = (next: string) => {
    const value = next as (typeof presentations)[number];
    setPresentation(value);
    if (value !== 'fixed') setState('collapsed');
  };

  const current = pages.find((p) => p.id === page) ?? pages[0];

  const generateCode = () => {
    const rootProps = ['height="100%"'];
    if (size !== '2') rootProps.push(`size="${size}"`);

    const sidebarProps = [`presentation="${presentation}"`, 'state={state}', 'onStateChange={setState}'];
    if (inset) sidebarProps.push('inset');
    if (resizable) sidebarProps.push('resizable');

    return `import React from 'react';
import { Button, Flex, Heading, Shell, Sidebar, Text } from '@kushagradhawan/kookie-ui';
import { HugeiconsIcon } from '@hugeicons/react';
import { Folder01Icon, Home01Icon, InboxIcon, SidebarLeft01Icon } from '@hugeicons/core-free-icons';

export function AppFrame() {
  const [state, setState] = React.useState<'expanded' | 'collapsed'>('${state}');

  return (
    <Shell.Root ${rootProps.join(' ')}>
      <Shell.Header height={56}>
        <Flex align="center" gap="3" px="4" height="100%">
          <Button iconOnly emphasis="quiet" aria-label="Toggle navigation" asChild>
            <Shell.Trigger target="sidebar">
              <HugeiconsIcon icon={SidebarLeft01Icon} strokeWidth={1.75} />
            </Shell.Trigger>
          </Button>
          <Text weight="medium">Acme</Text>
        </Flex>
      </Shell.Header>
      <Shell.Sidebar
        ${sidebarProps.join('\n        ')}
      >
        <Shell.Scroll role="navigation" aria-label="Main">
          <Sidebar.Menu>
            <Sidebar.MenuItem>
              <Sidebar.MenuButton>
                <HugeiconsIcon icon={Home01Icon} strokeWidth={1.75} />
                Home
              </Sidebar.MenuButton>
            </Sidebar.MenuItem>
            <Sidebar.MenuItem>
              <Sidebar.MenuButton badge="4">
                <HugeiconsIcon icon={InboxIcon} strokeWidth={1.75} />
                Inbox
              </Sidebar.MenuButton>
            </Sidebar.MenuItem>
            <Sidebar.MenuItem>
              <Sidebar.MenuButton isActive>
                <HugeiconsIcon icon={Folder01Icon} strokeWidth={1.75} />
                Projects
              </Sidebar.MenuButton>
            </Sidebar.MenuItem>
          </Sidebar.Menu>
        </Shell.Scroll>
      </Shell.Sidebar>
      <Shell.Content${inset ? ' inset' : ''}>
        <Flex direction="column" gap="2" p="6">
          <Heading size="5">Projects</Heading>
          <Text emphasis="medium">Twelve projects, three due this week.</Text>
        </Flex>
      </Shell.Content>
    </Shell.Root>
  );
}`;
  };

  const component = (
    <Box width="100%" height={`calc(${height} - 2 * var(--preview-block-padding))`} overflow="hidden" style={{ border: '1px solid var(--neutral-a4)', borderRadius: 'var(--radius-4)' }}>
      <Shell.Root height="100%" size={size}>
        <Shell.Header height={56}>
          <Flex align="center" gap="3" px="4" height="100%">
            <Button iconOnly emphasis="quiet" aria-label="Toggle navigation" asChild>
              <Shell.Trigger target="sidebar">
                <HugeiconsIcon icon={SidebarLeft01Icon} strokeWidth={1.75} />
              </Shell.Trigger>
            </Button>
            <Text weight="medium">Acme</Text>
          </Flex>
        </Shell.Header>
        <Shell.Sidebar
          key={presentation}
          presentation={presentation}
          state={state}
          onStateChange={setState}
          inset={inset}
          resizable={resizable}
        >
          <Shell.Scroll role="navigation" aria-label="Main">
            <Sidebar.Menu>
              {pages.map((p) => (
                <Sidebar.MenuItem key={p.id}>
                  <Sidebar.MenuButton isActive={p.id === page} badge={p.id === 'inbox' ? '4' : undefined} onClick={() => setPage(p.id)}>
                    <HugeiconsIcon icon={p.icon} strokeWidth={1.75} />
                    {p.label}
                  </Sidebar.MenuButton>
                </Sidebar.MenuItem>
              ))}
            </Sidebar.Menu>
          </Shell.Scroll>
        </Shell.Sidebar>
        <Shell.Content inset={inset}>
          <Flex direction="column" gap="2" p="6">
            <Heading size="5">{current.label}</Heading>
            <Text emphasis="medium">Press the button in the header to open and close the sidebar.</Text>
          </Flex>
        </Shell.Content>
      </Shell.Root>
    </Box>
  );

  const items = [
    {
      id: 'presentation',
      label: 'Presentation',
      type: 'select' as const,
      value: presentation,
      onChange: changePresentation,
      options: presentations.map((option) => ({ label: option, value: option })),
      placeholder: 'Presentation',
    },
    {
      id: 'state',
      label: 'Sidebar state',
      type: 'select' as const,
      value: state,
      onChange: (next: string) => setState(next as (typeof states)[number]),
      options: states.map((option) => ({ label: option, value: option })),
      placeholder: 'State',
    },
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
      id: 'inset',
      label: 'Inset',
      type: 'switch' as const,
      value: inset,
      onChange: setInset,
    },
    {
      id: 'resizable',
      label: 'Resizable',
      type: 'switch' as const,
      value: resizable,
      onChange: setResizable,
    },
  ];

  return <Playground component={component} code={generateCode()} items={items} showControls={showControls} showToolbar={showToolbar} height={height} />;
}
