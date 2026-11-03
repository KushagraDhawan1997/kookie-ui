import { Box, TextField } from '@kushagradhawan/kookie-ui';
import { HugeiconsIcon } from '@hugeicons/react';
import { Search01Icon } from '@hugeicons/core-free-icons';

export default function ProjectSearch() {
  return (
    <Box width="100%" maxWidth="320px">
      <TextField.Root type="search" placeholder="Search projects" aria-label="Search projects">
        <TextField.Slot>
          <HugeiconsIcon icon={Search01Icon} strokeWidth={1.75} />
        </TextField.Slot>
      </TextField.Root>
    </Box>
  );
}
