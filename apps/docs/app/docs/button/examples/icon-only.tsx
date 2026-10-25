import { Button } from '@kushagradhawan/kookie-ui';
import { HugeiconsIcon } from '@hugeicons/react';
import { Search01Icon } from '@hugeicons/core-free-icons';

export default function SearchButton() {
  return (
    <Button iconOnly emphasis="quiet" aria-label="Search" tooltip="Search">
      <HugeiconsIcon icon={Search01Icon} strokeWidth={1.75} />
    </Button>
  );
}
