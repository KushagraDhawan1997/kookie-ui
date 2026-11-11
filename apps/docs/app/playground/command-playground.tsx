'use client';

import React from 'react';
import { Button, Command, CommandCollection, CommandContent, CommandEmpty, CommandGroup, CommandGroupLabel, CommandInput, CommandItem, CommandList, Flex, Kbd, Text } from '@kushagradhawan/kookie-ui';
import { HugeiconsIcon } from '@hugeicons/react';
import { Delete02Icon, FileAddIcon, Search01Icon, Settings01Icon, UserAdd01Icon } from '@hugeicons/core-free-icons';
import Playground from '@/components/playground';

const sizes = ['1', '2', '3', '4'] as const;

type Action = { label: string; icon: typeof FileAddIcon; shortcut?: string; destructive?: boolean };
type Group = { label: string; items: Action[] };

const PROJECT: Action[] = [
  { label: 'New file', icon: FileAddIcon, shortcut: '⌘N' },
  { label: 'Invite a teammate', icon: UserAdd01Icon },
  { label: 'Delete project', icon: Delete02Icon, destructive: true },
];
const APP: Action[] = [{ label: 'Open settings', icon: Settings01Icon, shortcut: '⌘,' }];

const FLAT: Action[] = [...PROJECT, ...APP];
const GROUPED: Group[] = [
  { label: 'Project', items: PROJECT },
  { label: 'App', items: APP },
];

type CommandPlaygroundProps = {
  showControls?: boolean;
  showToolbar?: boolean;
  height?: string;
};

export default function CommandPlayground({ showControls = false, showToolbar = true, height }: CommandPlaygroundProps = {}) {
  const [size, setSize] = React.useState<string>('2');
  const [grouped, setGrouped] = React.useState(false);
  const [open, setOpen] = React.useState(false);
  const [last, setLast] = React.useState<string | null>(null);

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
      id: 'grouped',
      label: 'Groups',
      type: 'switch' as const,
      value: grouped,
      onChange: setGrouped,
    },
  ];

  const row = (action: Action) => (
    <CommandItem
      key={action.label}
      value={action.label}
      leading={<HugeiconsIcon icon={action.icon} strokeWidth={1.75} />}
      trailing={action.shortcut ? <Kbd>{action.shortcut}</Kbd> : undefined}
      tone={action.destructive ? 'destructive' : undefined}
      onSelect={() => setLast(action.label)}
    >
      {action.label}
    </CommandItem>
  );

  const generateCode = () => {
    const sizeProp = size !== '2' ? ` size="${size}"` : '';
    const rowCode = `<CommandItem
              key={action.label}
              value={action.label}
              leading={<HugeiconsIcon icon={action.icon} strokeWidth={1.75} />}
              trailing={action.shortcut ? <Kbd>{action.shortcut}</Kbd> : undefined}
              onSelect={action.run}
            >
              {action.label}
            </CommandItem>`;
    const list = grouped
      ? `<CommandList>
        {(group: Group) => (
          <CommandGroup key={group.label} items={group.items}>
            <CommandGroupLabel>{group.label}</CommandGroupLabel>
            <CommandCollection>
              {(action: Action) => (
            ${rowCode}
              )}
            </CommandCollection>
          </CommandGroup>
        )}
      </CommandList>`
      : `<CommandList>
        {(action: Action) => (
          ${rowCode}
        )}
      </CommandList>`;

    return `<Command${sizeProp} items={${grouped ? 'groups' : 'actions'}} open={open} onOpenChange={setOpen}>
  <CommandContent aria-label="Run a command">
    <CommandInput
      aria-label="Search commands"
      placeholder="Search commands"
      leading={<HugeiconsIcon icon={Search01Icon} strokeWidth={1.75} />}
    />
      ${list}
    <CommandEmpty>No command matches.</CommandEmpty>
  </CommandContent>
</Command>`;
  };

  return (
    <Playground
      component={
        <Flex direction="column" align="center" gap="3">
          <Button variant="soft" color="gray" onClick={() => setOpen(true)}>
            Open the palette
          </Button>
          <Text size="2" emphasis="medium">
            {last ? `Ran: ${last}` : 'Run a command and it shows here.'}
          </Text>
          <Command size={size as (typeof sizes)[number]} items={grouped ? GROUPED : FLAT} open={open} onOpenChange={setOpen}>
            <CommandContent aria-label="Run a command">
              <CommandInput aria-label="Search commands" placeholder="Search commands" leading={<HugeiconsIcon icon={Search01Icon} strokeWidth={1.75} />} />
              {grouped ? (
                <CommandList>
                  {(group: Group) => (
                    <CommandGroup key={group.label} items={group.items}>
                      <CommandGroupLabel>{group.label}</CommandGroupLabel>
                      <CommandCollection>{row}</CommandCollection>
                    </CommandGroup>
                  )}
                </CommandList>
              ) : (
                <CommandList>{row}</CommandList>
              )}
              <CommandEmpty>No command matches.</CommandEmpty>
            </CommandContent>
          </Command>
        </Flex>
      }
      code={generateCode()}
      items={items}
      showControls={showControls}
      showToolbar={showToolbar}
      height={height}
    />
  );
}
