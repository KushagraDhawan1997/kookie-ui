import * as React from 'react';
import { Card, Chip, Flex, Grid, Heading, Shell, Sidebar, Text, Toolbar, ToolbarButton } from '@kushagradhawan/kookie-ui';
import { useScene, useVersion } from '../harness';

/** An app frame: a sidebar of 200 rows with floating toolbars, beside a grid of 60 cards. */
export function ShellScene() {
  const [version, rerender] = useVersion();
  const scroller = React.useRef<HTMLDivElement>(null);
  const api = React.useMemo(
    () => ({ rerender, scroller: () => scroller.current?.closest('.kui-ScrollAreaViewport') as HTMLElement | null }),
    [rerender],
  );
  useScene(api);

  return (
    <Shell.Root height="100vh">
      <Shell.Sidebar defaultState="expanded" presentation="fixed">
        <Shell.PaneHeader float>
          <Toolbar backdrop size="3" aria-label="App" style={{ flex: 1 }}>
            <Text weight="medium">Workspace</Text>
            <ToolbarButton iconOnly aria-label="Search">
              ⌕
            </ToolbarButton>
          </Toolbar>
        </Shell.PaneHeader>
        <Shell.Scroll ref={scroller} fade role="navigation" aria-label="Main">
          {Array.from({ length: 10 }, (_, g) => (
            <Sidebar.Group key={g}>
              <Sidebar.GroupLabel>Section {g}</Sidebar.GroupLabel>
              <Sidebar.GroupContent>
                <Sidebar.Menu>
                  {Array.from({ length: 20 }, (_, i) => (
                    <Sidebar.MenuItem key={i}>
                      <Sidebar.MenuButton isActive={i === (version % 20)}>
                        <span className="kui-SidebarMenuLabel">Page {g * 20 + i}</span>
                      </Sidebar.MenuButton>
                    </Sidebar.MenuItem>
                  ))}
                </Sidebar.Menu>
              </Sidebar.GroupContent>
            </Sidebar.Group>
          ))}
        </Shell.Scroll>
      </Shell.Sidebar>
      <Shell.Content>
        <Flex direction="column" gap="5" p="6">
          <Heading>Dashboard {version}</Heading>
          <Grid columns="3" gap="5">
            {Array.from({ length: 60 }, (_, i) => (
              <Card key={i}>
                <Flex direction="column" gap="2">
                  <Text weight="medium">Metric {i}</Text>
                  <Heading size="6">{(i * 37 + version) % 1000}</Heading>
                  <Chip color={i % 2 ? 'green' : 'red'}>{i % 2 ? '+' : '-'}{i % 9}%</Chip>
                </Flex>
              </Card>
            ))}
          </Grid>
        </Flex>
      </Shell.Content>
    </Shell.Root>
  );
}
