import * as React from 'react';
import { Box, Tabs, TextArea, TextField } from '@kushagradhawan/kookie-ui';

export default function IssueFormTabs() {
  const [tab, setTab] = React.useState('summary');

  return (
    <Tabs.Root value={tab} onValueChange={setTab}>
      <Tabs.List aria-label="New issue">
        <Tabs.Trigger value="summary">Summary</Tabs.Trigger>
        <Tabs.Trigger value="details">Details</Tabs.Trigger>
      </Tabs.List>
      <Box pt="3" width="320px" maxWidth="100%">
        <Tabs.Content value="summary" forceMount hidden={tab !== 'summary'}>
          <TextField.Root aria-label="Title" placeholder="Title" />
        </Tabs.Content>
        <Tabs.Content value="details" forceMount hidden={tab !== 'details'}>
          <TextArea aria-label="Description" placeholder="Steps to reproduce" />
        </Tabs.Content>
      </Box>
    </Tabs.Root>
  );
}
