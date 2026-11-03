import * as React from 'react';
import { Box, Button, Flex, Select, Text } from '@kushagradhawan/kookie-ui';

export default function RoleForm() {
  const [sent, setSent] = React.useState<string | null>(null);

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSent(String(new FormData(event.currentTarget).get('role')));
  }

  return (
    <form onSubmit={submit}>
      <Flex gap="2" align="center">
        <Select.Root name="role" required>
          <Select.Trigger aria-label="Role" placeholder="Choose a role" />
          <Select.Content>
            <Select.Item value="editor">Editor</Select.Item>
            <Select.Item value="viewer">Viewer</Select.Item>
          </Select.Content>
        </Select.Root>
        <Button type="submit" emphasis="loud">Invite</Button>
      </Flex>
      {sent && (
        <Box mt="2">
          <Text as="p" size="2" emphasis="medium">Sent role: {sent}</Text>
        </Box>
      )}
    </form>
  );
}
