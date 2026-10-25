import { Shell, Sidebar } from '@kushagradhawan/kookie-ui';
import { HugeiconsIcon } from '@hugeicons/react';
import { Add01Icon, Search01Icon } from '@hugeicons/core-free-icons';

export default function CommandRows() {
  return (
    <Shell.Root height="200px">
      <Shell.Sidebar aria-label="Main">
        <Shell.Scroll>
          <Sidebar.Menu>
            <Sidebar.MenuItem>
              <Sidebar.MenuButton shortcut="⌘K">
                <HugeiconsIcon icon={Search01Icon} strokeWidth={1.75} />
                Search
              </Sidebar.MenuButton>
            </Sidebar.MenuItem>
            <Sidebar.MenuItem>
              <Sidebar.MenuButton shortcut="⌘N">
                <HugeiconsIcon icon={Add01Icon} strokeWidth={1.75} />
                New page
              </Sidebar.MenuButton>
            </Sidebar.MenuItem>
          </Sidebar.Menu>
        </Shell.Scroll>
      </Shell.Sidebar>
      <Shell.Content />
    </Shell.Root>
  );
}
