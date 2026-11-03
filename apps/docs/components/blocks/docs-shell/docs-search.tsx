'use client';

import * as React from 'react';
import { Command, CommandContent, CommandEmpty, CommandInput, CommandItem, CommandList, Text, ToolbarButton } from '@kushagradhawan/kookie-ui';
import { HugeiconsIcon } from '@hugeicons/react';
import { Search01Icon } from '@hugeicons/core-free-icons';
import type { DocsLinkComponent, DocsNavigationConfig } from './types';

interface Entry {
  href: string;
  title: string;
  /** The group the page sits in, shown after its title. */
  context: string;
}

/** Every page in the navigation, nested pages included, with the group it sits in. */
function entriesOf(navigation: DocsNavigationConfig): Entry[] {
  return navigation.groups.flatMap((group) =>
    group.items.flatMap((item) => [{ href: item.href, title: item.title, context: group.label }, ...(item.items ?? []).map((sub) => ({ href: sub.href, title: sub.title, context: item.title }))]),
  );
}

/** An exact title over a title that starts with the query, over one that contains it, over a group that does. */
function rank(entries: Entry[], query: string): Entry[] {
  const q = query.trim().toLowerCase();
  if (q.length === 0) return [];
  const score = (entry: Entry) => {
    const title = entry.title.toLowerCase();
    if (title === q) return 0;
    if (title.startsWith(q)) return 1;
    if (title.includes(q)) return 2;
    if (entry.context.toLowerCase().includes(q)) return 3;
    return -1;
  };
  return entries
    .map((entry) => ({ entry, score: score(entry) }))
    .filter((hit) => hit.score >= 0)
    .sort((a, b) => a.score - b.score)
    .slice(0, 12)
    .map((hit) => hit.entry);
}

/**
 * Search, as v2's docs have it: a toolbar button that opens the package's Command, and ⌘K from
 * anywhere. The app narrows and ranks the pages itself, so the palette's own filter is off, and
 * each result is a link, so Enter, a press and a middle-click all go where a link goes.
 */
export function DocsSearch({ navigation, linkComponent: LinkComponent }: { navigation: DocsNavigationConfig; linkComponent: DocsLinkComponent }) {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState('');
  const entries = React.useMemo(() => entriesOf(navigation), [navigation]);
  const results = React.useMemo(() => rank(entries, query), [entries, query]);

  // ⌘K / Ctrl-K opens it from anywhere; Chrome's own ⌘K would take the address bar.
  React.useEffect(() => {
    const onKey = (event: KeyboardEvent) => {
      if (event.key?.toLowerCase() === 'k' && (event.metaKey || event.ctrlKey)) {
        event.preventDefault();
        setOpen((value) => !value);
      }
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, []);

  return (
    <>
      <ToolbarButton iconOnly aria-label="Search the documentation" onClick={() => setOpen(true)}>
        <HugeiconsIcon icon={Search01Icon} strokeWidth={1.75} />
      </ToolbarButton>
      {/* Size 3, as v2's docs: a title and its group fit on one line at its width. */}
      <Command size="3" items={results} open={open} onOpenChange={setOpen}>
        <CommandContent aria-label="Search the documentation" filter={null} onQueryChange={setQuery}>
          <CommandInput aria-label="Search query" placeholder="Type to search" leading={<HugeiconsIcon icon={Search01Icon} strokeWidth={1.75} />} />
          <CommandList>
            {(entry: Entry) => (
              <CommandItem key={entry.href} value={entry.href} asChild>
                <LinkComponent href={entry.href}>
                  {entry.title}{' '}
                  <Text emphasis="medium" size="2">
                    {entry.context}
                  </Text>
                </LinkComponent>
              </CommandItem>
            )}
          </CommandList>
          {/* Only once something has been typed: an untouched field has no results by design. */}
          {query.trim().length > 0 ? <CommandEmpty>Nothing matches. Search covers the page titles in the sidebar.</CommandEmpty> : null}
        </CommandContent>
      </Command>
    </>
  );
}
