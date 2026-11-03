import { Box, Button, Flex, Popover, Text, TextField } from '@kushagradhawan/kookie-ui';
import { HugeiconsIcon } from '@hugeicons/react';
import { FilterIcon } from '@hugeicons/core-free-icons';

export default function SearchWithFilters() {
  return (
    <Popover.Root>
      <Popover.Anchor asChild>
        <Box width="100%" maxWidth="360px">
          <TextField.Root aria-label="Search issues" placeholder="Search issues">
            <TextField.Slot side="right">
              <Popover.Trigger>
                <Button iconOnly emphasis="quiet" size="1" aria-label="Filters">
                  <HugeiconsIcon icon={FilterIcon} strokeWidth={1.75} />
                </Button>
              </Popover.Trigger>
            </TextField.Slot>
          </TextField.Root>
        </Box>
      </Popover.Anchor>
      <Popover.Content width="360px">
        <Flex direction="column" gap="1">
          <Text size="2" weight="medium">Filters</Text>
          <Text size="2" emphasis="medium">The panel lines up with the field, not the button.</Text>
        </Flex>
      </Popover.Content>
    </Popover.Root>
  );
}
