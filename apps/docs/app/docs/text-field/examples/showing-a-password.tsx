import * as React from 'react';
import { Box, Button, TextField } from '@kushagradhawan/kookie-ui';
import { HugeiconsIcon } from '@hugeicons/react';
import { ViewIcon, ViewOffIcon } from '@hugeicons/core-free-icons';

export default function PasswordField() {
  const [visible, setVisible] = React.useState(false);

  return (
    <Box width="100%" maxWidth="320px">
      <TextField.Root type={visible ? 'text' : 'password'} aria-label="Password" autoComplete="new-password">
        <TextField.Slot side="right">
          <Button
            iconOnly
            emphasis="quiet"
            color="gray"
            aria-label={visible ? 'Hide password' : 'Show password'}
            onClick={() => setVisible(!visible)}
          >
            <HugeiconsIcon icon={visible ? ViewOffIcon : ViewIcon} strokeWidth={1.75} />
          </Button>
        </TextField.Slot>
      </TextField.Root>
    </Box>
  );
}
