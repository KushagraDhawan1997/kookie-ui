import { Button, Flex, Popover, TextField } from '@kushagradhawan/kookie-ui';
import { HugeiconsIcon } from '@hugeicons/react';
import { Cancel01Icon, Link01Icon } from '@hugeicons/core-free-icons';

const shareUrl = 'https://acme.com/s/atlas';

export default function SharePopover() {
  return (
    <Popover.Root>
      <Popover.Trigger>
        <Button>Share</Button>
      </Popover.Trigger>
      <Popover.Content width="320px">
        <Popover.Toolbar>
          <Popover.Toolbar.Left>
            <Popover.Toolbar.Title>Share</Popover.Toolbar.Title>
          </Popover.Toolbar.Left>
          <Popover.Toolbar.Right>
            <Popover.Close>
              <Button iconOnly emphasis="quiet" size="1" aria-label="Close">
                <HugeiconsIcon icon={Cancel01Icon} strokeWidth={1.75} />
              </Button>
            </Popover.Close>
          </Popover.Toolbar.Right>
        </Popover.Toolbar>
        <Flex gap="2">
          <TextField.Root aria-label="Link" readOnly value={shareUrl} />
          <Button emphasis="loud" onClick={() => navigator.clipboard.writeText(shareUrl)}>
            <HugeiconsIcon icon={Link01Icon} strokeWidth={1.75} />
            Copy
          </Button>
        </Flex>
      </Popover.Content>
    </Popover.Root>
  );
}
