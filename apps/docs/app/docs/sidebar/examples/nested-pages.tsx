import Link from 'next/link';
import { Shell, Sidebar } from '@kushagradhawan/kookie-ui';

const projects = ['Atlas', 'Beacon', 'Comet'];

export default function ProjectsNav() {
  return (
    <Shell.Root height="240px">
      <Shell.Sidebar aria-label="Main">
        <Shell.Scroll>
          <Sidebar.Menu>
            <Sidebar.MenuItem>
              <Sidebar.MenuSub defaultOpen>
                <Sidebar.MenuSubTrigger>Projects</Sidebar.MenuSubTrigger>
                <Sidebar.MenuSubContent>
                  {projects.map((name) => (
                    <Sidebar.MenuItem key={name}>
                      <Sidebar.MenuButton asChild isActive={name === 'Atlas'}>
                        <Link href="/docs/sidebar">{name}</Link>
                      </Sidebar.MenuButton>
                    </Sidebar.MenuItem>
                  ))}
                </Sidebar.MenuSubContent>
              </Sidebar.MenuSub>
            </Sidebar.MenuItem>
          </Sidebar.Menu>
        </Shell.Scroll>
      </Shell.Sidebar>
      <Shell.Content />
    </Shell.Root>
  );
}
