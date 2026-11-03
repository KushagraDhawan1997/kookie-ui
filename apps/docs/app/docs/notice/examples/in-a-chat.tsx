import { Button, Chatbar, Notice } from '@kushagradhawan/kookie-ui';

export default function ChatComposer() {
  return (
    <Chatbar.Root
      maxWidth="560px"
      notices={
        <Notice action={<Button emphasis="loud">Add credits</Button>}>
          You have 3 messages left this month.
        </Notice>
      }
    >
      <Chatbar.Textarea aria-label="Message" placeholder="Ask anything" submitOnEnter />
      <Chatbar.InlineEnd>
        <Chatbar.Send />
      </Chatbar.InlineEnd>
    </Chatbar.Root>
  );
}
