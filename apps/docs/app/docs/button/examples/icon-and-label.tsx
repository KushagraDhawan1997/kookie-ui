import { Button } from '@kushagradhawan/kookie-ui';
import { HugeiconsIcon } from '@hugeicons/react';
import { Add01Icon } from '@hugeicons/core-free-icons';

export default function NewProjectButton() {
  return (
    <Button>
      <HugeiconsIcon icon={Add01Icon} strokeWidth={1.75} />
      New project
    </Button>
  );
}
