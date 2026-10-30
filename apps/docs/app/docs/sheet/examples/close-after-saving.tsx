import * as React from 'react';
import { Button, Flex, Sheet, TextField } from '@kushagradhawan/kookie-ui';

export default function RenameProjectSheet() {
  const [open, setOpen] = React.useState(false);
  const [saving, setSaving] = React.useState(false);

  function save() {
    setSaving(true);
    setTimeout(() => (setSaving(false), setOpen(false)), 800);
  }

  return (
    <Sheet.Root open={open} onOpenChange={setOpen}>
      <Sheet.Trigger>
        <Button>Rename project</Button>
      </Sheet.Trigger>
      <Sheet.Content side="end" width="360px">
        <Flex direction="column" gap="4">
          <Sheet.Title>Rename project</Sheet.Title>
          <TextField.Root defaultValue="Atlas" aria-label="Project name" />
          <Button emphasis="loud" loading={saving} onClick={save}>Save</Button>
        </Flex>
      </Sheet.Content>
    </Sheet.Root>
  );
}
