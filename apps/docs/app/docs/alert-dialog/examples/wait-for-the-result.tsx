import * as React from 'react';
import { AlertDialog, Button, Flex } from '@kushagradhawan/kookie-ui';

export default function DeleteProjectRequest() {
  const [open, setOpen] = React.useState(false);
  const [deleting, setDeleting] = React.useState(false);

  function remove() {
    setDeleting(true);
    setTimeout(() => {
      setDeleting(false);
      setOpen(false);
    }, 1500);
  }

  return (
    <AlertDialog.Root open={open} onOpenChange={setOpen}>
      <AlertDialog.Trigger>
        <Button color="red">Delete project</Button>
      </AlertDialog.Trigger>
      <AlertDialog.Content size="1">
        <AlertDialog.Title>Delete Atlas?</AlertDialog.Title>
        <AlertDialog.Description>Its files are removed for everyone.</AlertDialog.Description>
        <Flex gap="2" justify="end" mt="5">
          <AlertDialog.Cancel>
            <Button emphasis="quiet" color="gray" disabled={deleting}>Cancel</Button>
          </AlertDialog.Cancel>
          <Button color="red" loading={deleting} onClick={remove}>Delete project</Button>
        </Flex>
      </AlertDialog.Content>
    </AlertDialog.Root>
  );
}
