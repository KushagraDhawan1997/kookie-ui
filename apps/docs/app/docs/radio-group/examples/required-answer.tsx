import * as React from 'react';
import { Button, Flex, RadioGroup, Text } from '@kushagradhawan/kookie-ui';

export default function InviteRoleForm() {
  const [role, setRole] = React.useState<string | null>(null);

  function submit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setRole(String(new FormData(event.currentTarget).get('role')));
  }

  return (
    <form onSubmit={submit}>
      <Flex direction="column" gap="3" align="start">
        <Text id="role-label" size="2" weight="medium">Role</Text>
        <RadioGroup.Root name="role" required aria-labelledby="role-label">
          <RadioGroup.Item value="admin">Admin</RadioGroup.Item>
          <RadioGroup.Item value="member">Member</RadioGroup.Item>
        </RadioGroup.Root>
        <Button type="submit" emphasis="loud">Send invite</Button>
        {role && <Text size="2" emphasis="medium">Invited as {role}</Text>}
      </Flex>
    </form>
  );
}
