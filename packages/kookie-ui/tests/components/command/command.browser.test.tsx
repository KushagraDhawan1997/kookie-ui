/**
 * Command, mounted (ported from v2, 2026-11-03).
 *
 * It opens with the caret in the field and a row highlighted; typing narrows without reordering;
 * Enter or a press runs the highlighted row and closes the palette; a link row navigates on
 * Enter; the empty state is inside the results pane; groups drop out when nothing in them matches.
 */
import * as React from 'react';
import { describe, expect, it, vi } from 'vitest';
import { render, waitFor } from '@testing-library/react';
import { userEvent } from 'vitest/browser';
import { Command, CommandCollection, CommandContent, CommandEmpty, CommandGroup, CommandGroupLabel, CommandInput, CommandItem, CommandList, Theme } from '../../../src/components/index';

const ITEMS = ['New file', 'Open file', 'Save', 'Close window'];

function Palette({
  onRun = () => {},
  onOpenChange = () => {},
  items = ITEMS,
}: {
  onRun?: (item: string) => void;
  onOpenChange?: (open: boolean, details: { reason: string }) => void;
  items?: string[];
}) {
  const [open, setOpen] = React.useState(true);
  return (
    <Theme>
      <Command
        items={items}
        open={open}
        onOpenChange={(next, details) => {
          onOpenChange(next, details);
          setOpen(next);
        }}
      >
        <CommandContent aria-label="Commands">
          <CommandInput aria-label="Search commands" placeholder="Type a command" />
          <CommandList>
            {(item: string) => (
              <CommandItem key={item} value={item} onSelect={() => onRun(item)}>
                {item}
              </CommandItem>
            )}
          </CommandList>
          <CommandEmpty>Nothing matches</CommandEmpty>
        </CommandContent>
      </Command>
    </Theme>
  );
}

const rows = () => [...document.querySelectorAll<HTMLElement>('.kui-CommandItem')];
const highlighted = () => document.querySelector<HTMLElement>('.kui-CommandItem[data-selected="true"]');

describe('opening', () => {
  it('opens with the caret in the field and the first row highlighted', async () => {
    render(<Palette />);
    await waitFor(() => expect(document.activeElement?.classList.contains('kui-CommandInput')).toBe(true));
    await waitFor(() => expect(highlighted()?.textContent).toBe('New file'));
    expect(document.querySelector('[role="dialog"]')?.getAttribute('aria-label')).toBe('Commands');
  });
});

describe('typing', () => {
  it('narrows the rows in their own order, and keeps a row highlighted', async () => {
    render(<Palette />);
    await waitFor(() => expect(document.activeElement?.classList.contains('kui-CommandInput')).toBe(true));
    await userEvent.keyboard('file');
    await waitFor(() => expect(rows().map((r) => r.textContent)).toEqual(['New file', 'Open file']));
    await waitFor(() => expect(highlighted()?.textContent).toBe('New file'));
  });

  it('shows the empty state inside the results pane when nothing matches', async () => {
    render(<Palette />);
    await waitFor(() => expect(document.activeElement?.classList.contains('kui-CommandInput')).toBe(true));
    await userEvent.keyboard('zzz');
    await waitFor(() => expect(document.querySelector('.kui-CommandPanel .kui-CommandEmpty')?.textContent).toBe('Nothing matches'));
    expect(rows()).toHaveLength(0);
  });
});

describe('running a row', () => {
  it('Enter runs the highlighted row and closes the palette', async () => {
    const onRun = vi.fn();
    const onOpenChange = vi.fn();
    render(<Palette onRun={onRun} onOpenChange={onOpenChange} />);
    await waitFor(() => expect(highlighted()).not.toBeNull());
    await userEvent.keyboard('{ArrowDown}{Enter}');
    expect(onRun).toHaveBeenCalledWith('Open file');
    expect(onOpenChange).toHaveBeenCalledWith(false, { reason: 'item-press' });
    await waitFor(() => expect(document.querySelector('.kui-CommandContent')).toBeNull());
  });

  it('a press runs the row once and closes the palette', async () => {
    const onRun = vi.fn();
    render(<Palette onRun={onRun} />);
    await waitFor(() => expect(rows()).toHaveLength(4));
    rows()[2]!.click();
    expect(onRun).toHaveBeenCalledTimes(1);
    expect(onRun).toHaveBeenCalledWith('Save');
    await waitFor(() => expect(document.querySelector('.kui-CommandContent')).toBeNull());
  });

  it('Escape closes it as a dismissal', async () => {
    const onOpenChange = vi.fn();
    render(<Palette onOpenChange={onOpenChange} />);
    await waitFor(() => expect(document.activeElement?.classList.contains('kui-CommandInput')).toBe(true));
    await userEvent.keyboard('{Escape}');
    expect(onOpenChange).toHaveBeenCalledWith(false, { reason: 'dismiss' });
  });
});

describe('a palette of places', () => {
  it('Enter follows the highlighted link row', async () => {
    const followed = vi.fn();
    const items = [{ title: 'Button', href: '#button' }];
    render(
      <Theme>
        <Command items={items} defaultOpen>
          <CommandContent aria-label="Search" filter={null}>
            <CommandInput aria-label="Search query" />
            <CommandList>
              {(item: { title: string; href: string }) => (
                <CommandItem key={item.href} asChild>
                  <a
                    href={item.href}
                    onClick={(event) => {
                      event.preventDefault();
                      followed(item.href);
                    }}
                  >
                    {item.title}
                  </a>
                </CommandItem>
              )}
            </CommandList>
          </CommandContent>
        </Command>
      </Theme>,
    );
    await waitFor(() => expect(highlighted()?.tagName).toBe('A'));
    await userEvent.keyboard('{Enter}');
    expect(followed).toHaveBeenCalledTimes(1);
    await waitFor(() => expect(document.querySelector('.kui-CommandContent')).toBeNull());
  });
});

describe('groups', () => {
  it('a group stays while any of its rows matches, and goes when none does', async () => {
    const groups = [
      { label: 'Files', items: ['New file', 'Open file'] },
      { label: 'Window', items: ['Close window'] },
    ];
    render(
      <Theme>
        <Command items={groups} defaultOpen>
          <CommandContent aria-label="Commands">
            <CommandInput aria-label="Search commands" />
            <CommandList>
              {(group: { label: string; items: string[] }) => (
                <CommandGroup key={group.label} items={group.items}>
                  <CommandGroupLabel>{group.label}</CommandGroupLabel>
                  <CommandCollection>
                    {(item: string) => (
                      <CommandItem key={item} value={item}>
                        {item}
                      </CommandItem>
                    )}
                  </CommandCollection>
                </CommandGroup>
              )}
            </CommandList>
          </CommandContent>
        </Command>
      </Theme>,
    );
    await waitFor(() => expect(document.querySelectorAll('.kui-CommandGroupLabel')).toHaveLength(2));
    await userEvent.keyboard('window');
    await waitFor(() => expect([...document.querySelectorAll('.kui-CommandGroupLabel')].map((l) => l.textContent)).toEqual(['Window']));
  });
});
