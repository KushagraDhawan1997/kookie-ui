import * as React from 'react';
import { Chatbar } from '@kushagradhawan/kookie-ui';

const report = new File(['quarterly numbers'], 'q3-report.pdf', { type: 'application/pdf' });

export default function UploadingComposer() {
  const [attachments, setAttachments] = React.useState<Chatbar.ChatbarAttachment[]>([
    { id: 'q3', name: report.name, size: 2400000, type: report.type, file: report, status: 'uploading' },
  ]);

  return (
    <Chatbar.Root attachments={attachments} onAttachmentsChange={setAttachments} width="100%" maxWidth="520px">
      <Chatbar.AttachmentsRow />
      <Chatbar.Textarea aria-label="Message" placeholder="Ask about this report" />
      <Chatbar.Row>
        <Chatbar.RowEnd>
          <Chatbar.Send />
        </Chatbar.RowEnd>
      </Chatbar.Row>
    </Chatbar.Root>
  );
}
