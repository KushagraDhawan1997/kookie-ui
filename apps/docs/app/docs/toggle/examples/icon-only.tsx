import { Toggle } from '@kushagradhawan/kookie-ui';
import { HugeiconsIcon } from '@hugeicons/react';
import { MicOff01Icon } from '@hugeicons/core-free-icons';

export default function MuteToggle() {
  return (
    <Toggle iconOnly emphasis="quiet" aria-label="Mute" tooltip="Mute">
      <HugeiconsIcon icon={MicOff01Icon} strokeWidth={1.75} />
    </Toggle>
  );
}
