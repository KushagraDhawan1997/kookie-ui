import { Chatbar } from '@kushagradhawan/kookie-ui';

export default function ReportComposer() {
  return (
    <Chatbar.Root
      accept=".pdf,.csv"
      pasteAccept="image/*"
      maxFileSize={10 * 1024 * 1024}
      width="100%"
      maxWidth="520px"
    >
      <Chatbar.AttachmentsRow />
      <Chatbar.Textarea aria-label="Message" placeholder="Drop a report or paste a screenshot" />
      <Chatbar.InlineEnd>
        <Chatbar.Send />
      </Chatbar.InlineEnd>
    </Chatbar.Root>
  );
}
