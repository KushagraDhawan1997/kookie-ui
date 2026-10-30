import * as React from 'react';
import { Toolbar } from '@kushagradhawan/kookie-ui';
import { HugeiconsIcon } from '@hugeicons/react';
import { TextBoldIcon, TextItalicIcon } from '@hugeicons/core-free-icons';

export default function LockableToolbar() {
  const [locked, setLocked] = React.useState(true);

  return (
    <Toolbar aria-label="Formatting">
      <Toolbar.Group aria-label="Text style" disabled={locked}>
        <Toolbar.Button iconOnly aria-label="Bold">
          <HugeiconsIcon icon={TextBoldIcon} strokeWidth={1.75} />
        </Toolbar.Button>
        <Toolbar.Button iconOnly aria-label="Italic">
          <HugeiconsIcon icon={TextItalicIcon} strokeWidth={1.75} />
        </Toolbar.Button>
      </Toolbar.Group>
      <Toolbar.Button aria-pressed={locked} onClick={() => setLocked(!locked)}>
        Locked
      </Toolbar.Button>
    </Toolbar>
  );
}
