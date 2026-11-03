import { Chip, Tabs } from '@kushagradhawan/kookie-ui';

export default function InboxTabs() {
  return (
    <Tabs.Root defaultValue="inbox">
      <Tabs.List>
        <Tabs.Trigger value="inbox">
          Inbox
          <Chip size="1" variant="solid">12</Chip>
        </Tabs.Trigger>
        <Tabs.Trigger value="archive">Archive</Tabs.Trigger>
      </Tabs.List>
    </Tabs.Root>
  );
}
