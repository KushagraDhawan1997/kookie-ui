import { Button, Chatbar, Flex, Heading } from '@kushagradhawan/kookie-ui';
import { HugeiconsIcon } from '@hugeicons/react';
import { AiBrain01Icon } from '@hugeicons/core-free-icons';

export default function AssistantStart() {
  return (
    <Flex direction="column" gap="4" width="100%" maxWidth="560px">
      <Heading as="h2" size="6">What are you working on today?</Heading>
      <Chatbar.Root open variant="soft" sendMode="always" width="100%">
        <Chatbar.Textarea aria-label="Ask anything" placeholder="Ask about a project, a file or an idea" submitOnEnter />
        <Chatbar.Row>
          <Chatbar.RowStart>
            <Chatbar.AttachTrigger />
            <Button iconOnly emphasis="quiet" color="gray" aria-label="Choose a model" tooltip="Choose a model">
              <HugeiconsIcon icon={AiBrain01Icon} strokeWidth={1.75} />
            </Button>
          </Chatbar.RowStart>
          <Chatbar.RowEnd>
            <Chatbar.Send />
          </Chatbar.RowEnd>
        </Chatbar.Row>
      </Chatbar.Root>
    </Flex>
  );
}
