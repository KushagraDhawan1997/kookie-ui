import { Box, Tabs, Text } from '@kushagradhawan/kookie-ui';

export default function SettingsTabs() {
  return (
    <Tabs.Root defaultValue="general" orientation="vertical">
      <Tabs.List aria-label="Settings">
        <Tabs.Trigger value="general">General</Tabs.Trigger>
        <Tabs.Trigger value="billing">Billing</Tabs.Trigger>
        <Tabs.Trigger value="members">Members</Tabs.Trigger>
      </Tabs.List>
      <Box pl="5">
        <Tabs.Content value="general"><Text size="2">Workspace name and time zone.</Text></Tabs.Content>
        <Tabs.Content value="billing"><Text size="2">Plan, invoices and payment method.</Text></Tabs.Content>
        <Tabs.Content value="members"><Text size="2">Who can open this workspace.</Text></Tabs.Content>
      </Box>
    </Tabs.Root>
  );
}
