import { Shell, Sidebar } from '@kushagradhawan/kookie-ui';
import { HugeiconsIcon } from '@hugeicons/react';
import { InboxIcon, SparklesIcon } from '@hugeicons/core-free-icons';

export default function InboxNav() {
  return (
    <Shell.Root height="200px">
      <Shell.Sidebar aria-label="Main">
        <Shell.Scroll>
          <Sidebar.Menu>
            <Sidebar.MenuItem>
              <Sidebar.MenuButton isActive badge="12">
                <HugeiconsIcon icon={InboxIcon} strokeWidth={1.75} />
                Inbox
              </Sidebar.MenuButton>
            </Sidebar.MenuItem>
            <Sidebar.MenuItem>
              <Sidebar.MenuButton badge={{ content: 'New', variant: 'solid', color: 'crimson' }}>
                <HugeiconsIcon icon={SparklesIcon} strokeWidth={1.75} />
                Features
              </Sidebar.MenuButton>
            </Sidebar.MenuItem>
          </Sidebar.Menu>
        </Shell.Scroll>
      </Shell.Sidebar>
      <Shell.Content />
    </Shell.Root>
  );
}
