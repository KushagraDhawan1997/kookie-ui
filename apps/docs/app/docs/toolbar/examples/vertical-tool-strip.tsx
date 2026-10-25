import * as React from 'react';
import { Toolbar } from '@kushagradhawan/kookie-ui';
import { HugeiconsIcon } from '@hugeicons/react';
import { Cursor01Icon, PencilEdit01Icon } from '@hugeicons/core-free-icons';

export default function CanvasTools() {
  const [tool, setTool] = React.useState('select');

  return (
    <Toolbar orientation="vertical" aria-label="Tools">
      <Toolbar.Group aria-label="Draw">
        <Toolbar.Button iconOnly aria-label="Select" aria-pressed={tool === 'select'} onClick={() => setTool('select')}>
          <HugeiconsIcon icon={Cursor01Icon} strokeWidth={1.75} />
        </Toolbar.Button>
        <Toolbar.Button iconOnly aria-label="Pen" aria-pressed={tool === 'pen'} onClick={() => setTool('pen')}>
          <HugeiconsIcon icon={PencilEdit01Icon} strokeWidth={1.75} />
        </Toolbar.Button>
      </Toolbar.Group>
    </Toolbar>
  );
}
