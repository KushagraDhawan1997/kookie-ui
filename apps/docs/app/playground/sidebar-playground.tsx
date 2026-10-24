'use client';

import React from 'react';
import { Box, Flex, Heading, Shell, Sidebar, Text } from '@kushagradhawan/kookie-ui';
import { HugeiconsIcon } from '@hugeicons/react';
import { Analytics01Icon, Calendar03Icon, Folder01Icon, Home01Icon, InboxIcon, Settings01Icon, UserGroupIcon } from '@hugeicons/core-free-icons';
import Playground from '@/components/playground';

const sizes = ['1', '2', '3'] as const;

type Row = {
  id: string;
  label: string;
  icon: typeof Home01Icon;
  iconName: string;
  badge?: string;
  shortcut?: string;
};

const workspaceRows: Row[] = [
  { id: 'home', label: 'Home', icon: Home01Icon, iconName: 'Home01Icon', shortcut: '⌘1' },
  { id: 'inbox', label: 'Inbox', icon: InboxIcon, iconName: 'InboxIcon', badge: '3' },
  { id: 'calendar', label: 'Calendar', icon: Calendar03Icon, iconName: 'Calendar03Icon', shortcut: '⌘2' },
];

const projectRows = [
  { id: 'atlas', label: 'Atlas' },
  { id: 'beacon', label: 'Beacon' },
  { id: 'cobalt', label: 'Cobalt' },
];

const settingsRows: Row[] = [
  { id: 'reports', label: 'Reports', icon: Analytics01Icon, iconName: 'Analytics01Icon' },
  { id: 'team', label: 'Team', icon: UserGroupIcon, iconName: 'UserGroupIcon', badge: '12' },
  { id: 'settings', label: 'Settings', icon: Settings01Icon, iconName: 'Settings01Icon' },
];

const allLabels: Record<string, string> = Object.fromEntries([...workspaceRows, ...projectRows, ...settingsRows].map((row) => [row.id, row.label]));

const DEFAULT_HEIGHT = '34rem';

type SidebarPlaygroundProps = {
  showControls?: boolean;
  showToolbar?: boolean;
  height?: string;
};

export default function SidebarPlayground({ showControls = false, showToolbar = true, height = DEFAULT_HEIGHT }: SidebarPlaygroundProps = {}) {
  const [size, setSize] = React.useState<(typeof sizes)[number]>('2');
  const [icons, setIcons] = React.useState(true);
  const [groups, setGroups] = React.useState(true);
  const [extras, setExtras] = React.useState(true);
  const [search, setSearch] = React.useState(true);
  const [query, setQuery] = React.useState('');
  const [page, setPage] = React.useState('atlas');

  const q = query.trim().toLowerCase();
  const matches = (label: string) => !q || label.toLowerCase().includes(q);
  const visibleWorkspace = workspaceRows.filter((row) => matches(row.label));
  const visibleProjects = projectRows.filter((row) => matches(row.label) || matches('Projects'));
  const visibleSettings = settingsRows.filter((row) => matches(row.label));

  const renderRow = (row: Row) => (
    <Sidebar.MenuItem key={row.id}>
      <Sidebar.MenuButton
        isActive={page === row.id}
        badge={extras ? row.badge : undefined}
        shortcut={extras ? row.shortcut : undefined}
        onClick={() => setPage(row.id)}
      >
        {icons ? <HugeiconsIcon icon={row.icon} strokeWidth={1.75} /> : null}
        {row.label}
      </Sidebar.MenuButton>
    </Sidebar.MenuItem>
  );

  const renderGroup = (label: string, children: React.ReactNode, show: boolean) => {
    if (!show) return null;
    if (!groups) return <Sidebar.Menu>{children}</Sidebar.Menu>;
    return (
      <Sidebar.Group>
        <Sidebar.GroupLabel>{label}</Sidebar.GroupLabel>
        <Sidebar.GroupContent>
          <Sidebar.Menu>{children}</Sidebar.Menu>
        </Sidebar.GroupContent>
      </Sidebar.Group>
    );
  };

  const projectsSub = (
    <Sidebar.MenuItem>
      <Sidebar.MenuSub defaultOpen>
        <Sidebar.MenuSubTrigger>
          {icons ? <HugeiconsIcon icon={Folder01Icon} strokeWidth={1.75} /> : null}
          Projects
        </Sidebar.MenuSubTrigger>
        <Sidebar.MenuSubContent>
          {visibleProjects.map((row) => (
            <Sidebar.MenuItem key={row.id}>
              <Sidebar.MenuButton isActive={page === row.id} onClick={() => setPage(row.id)}>
                {row.label}
              </Sidebar.MenuButton>
            </Sidebar.MenuItem>
          ))}
        </Sidebar.MenuSubContent>
      </Sidebar.MenuSub>
    </Sidebar.MenuItem>
  );

  const generateCode = () => {
    const rowProps = (row: Row) => {
      const props: string[] = [];
      if (row.id === page) props.push('isActive');
      if (extras && row.badge) props.push(`badge="${row.badge}"`);
      if (extras && row.shortcut) props.push(`shortcut="${row.shortcut}"`);
      return props.length ? ` ${props.join(' ')}` : '';
    };
    const rows = (list: Row[], indent: string) =>
      list
        .map((row) =>
          [
            '<Sidebar.MenuItem>',
            `  <Sidebar.MenuButton${rowProps(row)}>`,
            icons ? `    <HugeiconsIcon icon={${row.iconName}} strokeWidth={1.75} />` : null,
            `    ${row.label}`,
            '  </Sidebar.MenuButton>',
            '</Sidebar.MenuItem>',
          ]
            .filter((line): line is string => line !== null)
            .map((line) => indent + line)
            .join('\n'),
        )
        .join('\n');

    const subRows = projectRows
      .map(
        (row) => `            <Sidebar.MenuItem>
              <Sidebar.MenuButton${row.id === page ? ' isActive' : ''}>${row.label}</Sidebar.MenuButton>
            </Sidebar.MenuItem>`,
      )
      .join('\n');

    const sub = `      <Sidebar.MenuItem>
        <Sidebar.MenuSub defaultOpen>
          <Sidebar.MenuSubTrigger>
            ${icons ? '<HugeiconsIcon icon={Folder01Icon} strokeWidth={1.75} />\n            ' : ''}Projects
          </Sidebar.MenuSubTrigger>
          <Sidebar.MenuSubContent>
${subRows}
          </Sidebar.MenuSubContent>
        </Sidebar.MenuSub>
      </Sidebar.MenuItem>`;

    const menu = (label: string, body: string) =>
      groups
        ? `    <Sidebar.Group>
      <Sidebar.GroupLabel>${label}</Sidebar.GroupLabel>
      <Sidebar.GroupContent>
        <Sidebar.Menu>
${body.replace(/^/gm, '    ')}
        </Sidebar.Menu>
      </Sidebar.GroupContent>
    </Sidebar.Group>`
        : `    <Sidebar.Menu>
${body}
    </Sidebar.Menu>`;

    const usedIcons = icons ? [...workspaceRows, ...settingsRows].map((row) => row.iconName).concat('Folder01Icon').sort() : [];

    return `import React from 'react';
import { Shell, Sidebar } from '@kushagradhawan/kookie-ui';${
      icons
        ? `
import { HugeiconsIcon } from '@hugeicons/react';
import { ${usedIcons.join(', ')} } from '@hugeicons/core-free-icons';`
        : ''
    }

export function MainNav() {${
      search
        ? `
  const [query, setQuery] = React.useState('');
`
        : ''
    }
  return (
    <Shell.Sidebar>${
      search
        ? `
      <Shell.PaneHeader>
        <Sidebar.Search value={query} onValueChange={setQuery} placeholder="Search pages..." />
      </Shell.PaneHeader>`
        : ''
    }
      <Shell.Scroll role="navigation" aria-label="Main">
${menu('Workspace', `${rows(workspaceRows, '      ')}\n${sub}`).replace(/^/gm, '    ')}
        <Sidebar.Separator />
${menu('Settings', rows(settingsRows, '      ')).replace(/^/gm, '    ')}
      </Shell.Scroll>
    </Shell.Sidebar>
  );
}

// Wrap the app in <Shell.Root size="${size}"> to set the row size.`;
  };

  const component = (
    <Box width="100%" height={`calc(${height} - 2 * var(--preview-block-padding))`} overflow="hidden" style={{ border: '1px solid var(--neutral-a4)', borderRadius: 'var(--radius-4)' }}>
      <Shell.Root height="100%" size={size}>
        <Shell.Sidebar presentation="fixed" defaultState="expanded" expandedSize={260}>
          {search ? (
            <Shell.PaneHeader>
              <Sidebar.Search value={query} onValueChange={setQuery} placeholder="Search pages..." />
            </Shell.PaneHeader>
          ) : null}
          <Shell.Scroll role="navigation" aria-label="Main">
            {renderGroup(
              'Workspace',
              <>
                {visibleWorkspace.map(renderRow)}
                {visibleProjects.length > 0 ? projectsSub : null}
              </>,
              visibleWorkspace.length > 0 || visibleProjects.length > 0,
            )}
            {visibleSettings.length > 0 && (visibleWorkspace.length > 0 || visibleProjects.length > 0) ? <Sidebar.Separator /> : null}
            {renderGroup('Settings', visibleSettings.map(renderRow), visibleSettings.length > 0)}
          </Shell.Scroll>
        </Shell.Sidebar>
        <Shell.Content>
          <Flex direction="column" gap="2" p="6">
            <Heading size="5">{allLabels[page]}</Heading>
            <Text emphasis="medium">Press a row to make it the current page.</Text>
          </Flex>
        </Shell.Content>
      </Shell.Root>
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
      id: 'icons',
      label: 'Icons',
      type: 'switch' as const,
      value: icons,
      onChange: setIcons,
    },
    {
      id: 'groups',
      label: 'Group labels',
      type: 'switch' as const,
      value: groups,
      onChange: setGroups,
    },
    {
      id: 'extras',
      label: 'Badges and shortcuts',
      type: 'switch' as const,
      value: extras,
      onChange: setExtras,
    },
    {
      id: 'search',
      label: 'Search',
      type: 'switch' as const,
      value: search,
      onChange: (next: boolean) => {
        setSearch(next);
        if (!next) setQuery('');
      },
    },
  ];

  return <Playground component={component} code={generateCode()} items={items} showControls={showControls} showToolbar={showToolbar} height={height} />;
}
