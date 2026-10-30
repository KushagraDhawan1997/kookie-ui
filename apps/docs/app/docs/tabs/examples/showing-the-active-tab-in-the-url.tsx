import * as React from 'react';
import { Box, Tabs, Text } from '@kushagradhawan/kookie-ui';

export default function ProjectTabs() {
  const [tab, setTab] = React.useState('overview');

  // Read the tab from the address once, so a link or a reload opens the same tab.
  React.useEffect(() => {
    setTab(new URLSearchParams(window.location.search).get('tab') ?? 'overview');
  }, []);

  function change(next: string) {
    setTab(next);
    const url = new URL(window.location.href);
    url.searchParams.set('tab', next);
    window.history.replaceState(null, '', url);
  }

  return (
    <Tabs.Root value={tab} onValueChange={change}>
      <Tabs.List aria-label="Project">
        <Tabs.Trigger value="overview">Overview</Tabs.Trigger>
        <Tabs.Trigger value="activity">Activity</Tabs.Trigger>
      </Tabs.List>
      <Box pt="3">
        <Tabs.Content value="overview"><Text size="2">Three tasks are due this week.</Text></Tabs.Content>
        <Tabs.Content value="activity"><Text size="2">Maya closed two issues today.</Text></Tabs.Content>
      </Box>
    </Tabs.Root>
  );
}
