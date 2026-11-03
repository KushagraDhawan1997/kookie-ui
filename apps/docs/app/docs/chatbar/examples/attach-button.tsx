import { Chatbar } from '@kushagradhawan/kookie-ui';
import { HugeiconsIcon } from '@hugeicons/react';
import { Attachment01Icon } from '@hugeicons/core-free-icons';

export default function SupportComposer() {
  return (
    <Chatbar.Root accept="image/*,.pdf" width="100%" maxWidth="520px" defaultOpen>
      <Chatbar.AttachmentsRow />
      <Chatbar.Textarea aria-label="Message" placeholder="Describe the problem" submitOnEnter />
      <Chatbar.Row>
        <Chatbar.RowStart>
          <Chatbar.AttachTrigger>
            <HugeiconsIcon icon={Attachment01Icon} strokeWidth={1.75} />
          </Chatbar.AttachTrigger>
        </Chatbar.RowStart>
        <Chatbar.RowEnd>
          <Chatbar.Send />
        </Chatbar.RowEnd>
      </Chatbar.Row>
    </Chatbar.Root>
  );
}
