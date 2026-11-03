import * as React from 'react';
import { Button, DropdownMenu } from '@kushagradhawan/kookie-ui';

export default function TaskViewMenu() {
  const [showDone, setShowDone] = React.useState(true);
  const [sort, setSort] = React.useState('due');

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger>
        <Button emphasis="quiet" color="gray">
          View
          <DropdownMenu.TriggerIcon />
        </Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content>
        <DropdownMenu.Label>Show</DropdownMenu.Label>
        <DropdownMenu.CheckboxItem checked={showDone} onCheckedChange={setShowDone}>
          Completed tasks
        </DropdownMenu.CheckboxItem>
        <DropdownMenu.Separator />
        <DropdownMenu.Label>Sort by</DropdownMenu.Label>
        <DropdownMenu.RadioGroup value={sort} onValueChange={setSort}>
          <DropdownMenu.RadioItem value="due">Due date</DropdownMenu.RadioItem>
          <DropdownMenu.RadioItem value="priority">Priority</DropdownMenu.RadioItem>
        </DropdownMenu.RadioGroup>
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  );
}
