import * as React from 'react';
import { Button, Dialog, Flex } from '@kushagradhawan/kookie-ui';

// Stands in for your request.
const publishPost = () => new Promise((resolve) => setTimeout(resolve, 1500));

export default function PublishDialog() {
  const [open, setOpen] = React.useState(false);
  const [saving, setSaving] = React.useState(false);

  async function publish() {
    setSaving(true);
    await publishPost();
    setSaving(false);
    setOpen(false);
  }

  return (
    <Dialog.Root open={open} onOpenChange={setOpen}>
      <Dialog.Trigger>
        <Button>Publish</Button>
      </Dialog.Trigger>
      <Dialog.Content size="1">
        <Dialog.Title>Publish post</Dialog.Title>
        <Dialog.Description>Everyone with the link can read it.</Dialog.Description>
        <Flex gap="2" justify="end" mt="5">
          <Dialog.Close>
            <Button emphasis="quiet" color="gray">Cancel</Button>
          </Dialog.Close>
          <Button emphasis="loud" loading={saving} onClick={publish}>Publish</Button>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  );
}
