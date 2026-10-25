import { AlertDialog, Button, Flex } from '@kushagradhawan/kookie-ui';

export default function DeleteProjectDialog() {
  return (
    <AlertDialog.Root>
      <AlertDialog.Trigger>
        <Button color="red">Delete project</Button>
      </AlertDialog.Trigger>
      <AlertDialog.Content size="1">
        <AlertDialog.Title>Delete Atlas?</AlertDialog.Title>
        <AlertDialog.Description>
          Its files and history are removed for everyone. You can't undo this.
        </AlertDialog.Description>
        <Flex gap="2" justify="end" mt="5">
          <AlertDialog.Cancel>
            <Button emphasis="quiet" color="gray">Cancel</Button>
          </AlertDialog.Cancel>
          <AlertDialog.Action>
            <Button color="red">Delete project</Button>
          </AlertDialog.Action>
        </Flex>
      </AlertDialog.Content>
    </AlertDialog.Root>
  );
}
