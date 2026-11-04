import * as React from 'react';
import { Button, Dialog, Flex, Popover, Text, TextField, Tooltip } from '@kushagradhawan/kookie-ui';
import { useScene, useVersion } from '../harness';

/** Overlays opened and closed many times: a dialog with a form, a popover and a tooltip. */
export function DialogsScene() {
  const [version, rerender] = useVersion();
  const api = React.useMemo(() => ({ rerender }), [rerender]);
  useScene(api);

  return (
    <Flex p="6" gap="4">
      <Dialog.Root>
        <Dialog.Trigger>
          <Button data-bench="dialog">Edit profile</Button>
        </Dialog.Trigger>
        <Dialog.Content>
          <Dialog.Title>Edit profile {version}</Dialog.Title>
          <Dialog.Description>Change your name and email.</Dialog.Description>
          <Flex direction="column" gap="4" mt="4">
            <TextField.Root defaultValue="Ada" aria-label="Name" />
            <TextField.Root defaultValue="ada@example.com" aria-label="Email" />
            <Flex gap="3" justify="end">
              <Dialog.Close>
                <Button variant="soft" color="gray">
                  Cancel
                </Button>
              </Dialog.Close>
              <Dialog.Close>
                <Button data-bench="dialog-close">Save</Button>
              </Dialog.Close>
            </Flex>
          </Flex>
        </Dialog.Content>
      </Dialog.Root>
      <Popover.Root>
        <Popover.Trigger>
          <Button data-bench="popover" variant="soft">
            Share
          </Button>
        </Popover.Trigger>
        <Popover.Content>
          <Text>Anyone with the link can view.</Text>
        </Popover.Content>
      </Popover.Root>
      <Tooltip content="Saved two minutes ago">
        <Button variant="ghost">Status</Button>
      </Tooltip>
    </Flex>
  );
}
