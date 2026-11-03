import { Box, Toolbar } from '@kushagradhawan/kookie-ui';
import { HugeiconsIcon } from '@hugeicons/react';
import { TextBoldIcon, TextItalicIcon } from '@hugeicons/core-free-icons';

export default function NotesToolbar() {
  return (
    <Box width="100%" maxWidth="280px">
      <Toolbar aria-label="Formatting">
        <Toolbar.Title>Meeting notes</Toolbar.Title>
        <Toolbar.Overflow>
          <Toolbar.Button iconOnly aria-label="Bold">
            <HugeiconsIcon icon={TextBoldIcon} strokeWidth={1.75} />
          </Toolbar.Button>
          <Toolbar.Button iconOnly aria-label="Italic">
            <HugeiconsIcon icon={TextItalicIcon} strokeWidth={1.75} />
          </Toolbar.Button>
          <Toolbar.Button>Export</Toolbar.Button>
          <Toolbar.Button>Share</Toolbar.Button>
        </Toolbar.Overflow>
      </Toolbar>
    </Box>
  );
}
