import * as React from 'react';
import { Shell, Sidebar } from '@kushagradhawan/kookie-ui';

const pages = ['Overview', 'Billing', 'Members', 'Integrations', 'Security'];

export default function SettingsNav() {
  const [query, setQuery] = React.useState('');
  const shown = pages.filter((page) => page.toLowerCase().includes(query.toLowerCase()));

  return (
    <Shell.Root height="320px">
      <Shell.Sidebar aria-label="Settings">
        <Shell.PaneHeader>
          <Sidebar.Search value={query} onValueChange={setQuery} placeholder="Search pages..." />
        </Shell.PaneHeader>
        <Shell.Scroll>
          <Sidebar.Menu>
            {shown.map((page) => (
              <Sidebar.MenuItem key={page}>
                <Sidebar.MenuButton isActive={page === 'Overview'}>{page}</Sidebar.MenuButton>
              </Sidebar.MenuItem>
            ))}
          </Sidebar.Menu>
        </Shell.Scroll>
      </Shell.Sidebar>
      <Shell.Content />
    </Shell.Root>
  );
}
