import { Flex, Tabs, Text } from '@kushagradhawan/kookie-ui';

export default function BillingTabs() {
  return (
    <Tabs.Root defaultValue="invoices">
      <Tabs.List aria-label="Billing">
        <Tabs.Trigger value="invoices">Invoices</Tabs.Trigger>
        <Tabs.Trigger value="usage">Usage</Tabs.Trigger>
        <Tabs.Trigger value="reports" disabled>
          Reports
        </Tabs.Trigger>
      </Tabs.List>
      <Flex direction="column" gap="2" pt="3">
        <Tabs.Content value="invoices"><Text size="2">No unpaid invoices.</Text></Tabs.Content>
        <Tabs.Content value="usage"><Text size="2">1,240 of 5,000 requests used.</Text></Tabs.Content>
        <Text size="1" emphasis="medium">
          Reports open once your first billing month closes.
        </Text>
      </Flex>
    </Tabs.Root>
  );
}
