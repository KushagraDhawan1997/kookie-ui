import * as React from 'react';
import { Chatbar } from '@kushagradhawan/kookie-ui';
import { HugeiconsIcon } from '@hugeicons/react';
import { Layers01Icon } from '@hugeicons/core-free-icons';

export default function DesignAssistantComposer() {
  const [selection, setSelection] = React.useState<string | null>('Header frame');

  return (
    <Chatbar.Root width="100%" maxWidth="520px">
      <Chatbar.AttachmentsRow>
        {selection && (
          <Chatbar.Item
            icon={<HugeiconsIcon icon={Layers01Icon} strokeWidth={1.75} />}
            onRemove={() => setSelection(null)}
          >
            {selection}
          </Chatbar.Item>
        )}
      </Chatbar.AttachmentsRow>
      <Chatbar.Textarea aria-label="Message" placeholder="Change the selected layer" />
      <Chatbar.InlineEnd>
        <Chatbar.Send />
      </Chatbar.InlineEnd>
    </Chatbar.Root>
  );
}
