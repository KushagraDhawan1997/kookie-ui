import { Tabs } from '@kushagradhawan/kookie-ui';
import { HugeiconsIcon } from '@hugeicons/react';
import { Activity01Icon, Folder01Icon, UserGroupIcon } from '@hugeicons/core-free-icons';

export default function WorkspaceTabs() {
  return (
    <Tabs.Root defaultValue="files">
      <Tabs.List aria-label="Workspace">
        <Tabs.Trigger value="files">
          <HugeiconsIcon icon={Folder01Icon} strokeWidth={1.75} />
          Files
        </Tabs.Trigger>
        <Tabs.Trigger value="activity">
          <HugeiconsIcon icon={Activity01Icon} strokeWidth={1.75} />
          Activity
        </Tabs.Trigger>
        <Tabs.Trigger value="members">
          <HugeiconsIcon icon={UserGroupIcon} strokeWidth={1.75} />
          Members
        </Tabs.Trigger>
      </Tabs.List>
    </Tabs.Root>
  );
}
