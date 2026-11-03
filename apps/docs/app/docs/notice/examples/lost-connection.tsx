import { Box, Notice } from '@kushagradhawan/kookie-ui';
import { HugeiconsIcon } from '@hugeicons/react';
import { WifiDisconnected01Icon } from '@hugeicons/core-free-icons';

export default function OfflineNotice() {
  return (
    <Box width="100%" maxWidth="480px">
      <Notice icon={<HugeiconsIcon icon={WifiDisconnected01Icon} strokeWidth={1.75} />}>
        You're offline. Changes will sync when you reconnect.
      </Notice>
    </Box>
  );
}
