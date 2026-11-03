import { Avatar, Flex, Shell, Sidebar, Text, Toolbar } from '@kushagradhawan/kookie-ui';

const projects = ['Atlas', 'Beacon', 'Comet', 'Delta', 'Echo', 'Falcon', 'Galaxy', 'Harbor', 'Iris', 'Juno'];

export default function WorkspaceNav() {
  return (
    <Shell.Root height="360px">
      <Shell.Sidebar aria-label="Main">
        <Shell.PaneHeader float>
          <Toolbar backdrop aria-label="Workspace">
            <Toolbar.Title>Acme</Toolbar.Title>
          </Toolbar>
        </Shell.PaneHeader>
        <Shell.Scroll fade>
          <Sidebar.Menu>
            {projects.map((name) => (
              <Sidebar.MenuItem key={name}>
                <Sidebar.MenuButton isActive={name === 'Atlas'}>{name}</Sidebar.MenuButton>
              </Sidebar.MenuItem>
            ))}
          </Sidebar.Menu>
        </Shell.Scroll>
        <Shell.PaneFooter>
          <Flex align="center" gap="2">
            <Avatar size="1" fallback="MJ" />
            <Text size="2">Maya Jones</Text>
          </Flex>
        </Shell.PaneFooter>
      </Shell.Sidebar>
      <Shell.Content />
    </Shell.Root>
  );
}
