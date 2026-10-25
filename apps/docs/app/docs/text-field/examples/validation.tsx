import * as React from 'react';
import { Flex, Text, TextField } from '@kushagradhawan/kookie-ui';

export default function EmailField() {
  const [email, setEmail] = React.useState('');
  const [checked, setChecked] = React.useState(false);
  const invalid = checked && !email.includes('@');

  return (
    <Flex direction="column" gap="1" width="100%" maxWidth="320px">
      <Text as="label" htmlFor="invite-email" size="2" weight="medium">
        Email
      </Text>
      <TextField.Root
        id="invite-email"
        type="email"
        value={email}
        onChange={(event) => setEmail(event.target.value)}
        onBlur={() => setChecked(true)}
        error={invalid}
        errorMessage={invalid ? 'Enter an email address with an @ sign' : undefined}
      />
    </Flex>
  );
}
