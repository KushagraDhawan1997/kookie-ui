'use client';

import { PreviewBlock } from '@/components/blocks/preview-block/preview-block';
import { SectionHeader } from '@/components/blocks/section-header/section-header';
import { Hero } from '@/components/blocks/hero/hero';
import { Flex, Chatbar, IconButton, Separator, Text } from '@kushagradhawan/kookie-ui';
import { HugeiconsIcon } from '@hugeicons/react';
import { Attachment01Icon, SmileIcon, Mic01Icon, SparklesIcon, AiBrain01Icon } from '@hugeicons/core-free-icons';

// Submitted preview URLs belong to the consumer; revoke them once they are no longer shown
const releasePreviews = (attachments: Chatbar.ChatbarAttachment[]) => {
  attachments.forEach((a) => a.url && URL.revokeObjectURL(a.url));
};

export function ChatbarExamples() {
  return (
    <Flex direction="column" gap="9">
      {/* Example 1: File Upload Flow */}
      <Flex direction="column" gap="4">
        <SectionHeader.Root>
          <SectionHeader.Content>
            <SectionHeader.Title>File Upload Flow</SectionHeader.Title>
            <SectionHeader.Description>
              Drag files onto the chatbar or click the attach button to add files. The expanded row reveals additional actions like emoji picker when the input is focused.
            </SectionHeader.Description>
          </SectionHeader.Content>
        </SectionHeader.Root>
        <PreviewBlock
          background="none"
          height="30rem"
          code={`<Chatbar.Root
  variant="classic"
  size="2"
  sendMode="always"
  minLines={3}
  maxLines={16}
  accept="image/*,.pdf,.doc,.docx"
  maxAttachments={5}
  maxFileSize={10 * 1024 * 1024}
  width="100%"
  maxWidth="500px"
  onSubmit={async ({ value, attachments }) => {
    await sendMessage({ text: value, files: attachments });
    // Submitted preview URLs are yours to revoke
    attachments.forEach((a) => a.url && URL.revokeObjectURL(a.url));
  }}
>
  <Chatbar.AttachmentsRow />
  <Chatbar.Textarea
    aria-label="Message"
    placeholder="Type a message or drop files..."
    submitOnEnter
  />
  <Chatbar.InlineEnd>
    <Chatbar.Send />
  </Chatbar.InlineEnd>
  <Chatbar.Row>
    <Chatbar.RowStart>
      <Chatbar.AttachTrigger asChild>
        <IconButton
          variant="ghost"
          size="2"
          color="gray"
          highContrast
          aria-label="Attach file"
          tooltip="Attach file"
        >
          <HugeiconsIcon icon={Attachment01Icon} strokeWidth={1.75} />
        </IconButton>
      </Chatbar.AttachTrigger>
      <IconButton
        variant="ghost"
        size="2"
        color="gray"
        highContrast
        aria-label="Add emoji"
        tooltip="Add emoji"
      >
        <HugeiconsIcon icon={SmileIcon} strokeWidth={1.75} />
      </IconButton>
      <IconButton
        variant="ghost"
        size="2"
        color="gray"
        highContrast
        aria-label="Voice message"
        tooltip="Voice message"
      >
        <HugeiconsIcon icon={Mic01Icon} strokeWidth={1.75} />
      </IconButton>
    </Chatbar.RowStart>
    <Chatbar.RowEnd>
      <Text size="1" color="gray">Shift+Enter for new line</Text>
      <Chatbar.Send />
    </Chatbar.RowEnd>
  </Chatbar.Row>
</Chatbar.Root>`}
        >
          <Chatbar.Root
            variant="classic"
            size="2"
            sendMode="always"
            minLines={3}
            maxLines={16}
            accept="image/*,.pdf,.doc,.docx"
            maxAttachments={5}
            maxFileSize={10 * 1024 * 1024}
            width="100%"
            maxWidth="500px"
            onSubmit={({ value, attachments }) => {
              console.log('Sent:', value, attachments);
              releasePreviews(attachments);
            }}
          >
            <Chatbar.AttachmentsRow />
            <Chatbar.Textarea aria-label="Message" placeholder="Type a message or drop files..." submitOnEnter />
            <Chatbar.InlineEnd>
              <Chatbar.Send />
            </Chatbar.InlineEnd>
            <Chatbar.Row>
              <Chatbar.RowStart>
                <Chatbar.AttachTrigger asChild>
                  <IconButton variant="ghost" size="2" color="gray" highContrast aria-label="Attach file" tooltip="Attach file">
                    <HugeiconsIcon icon={Attachment01Icon} strokeWidth={1.75} />
                  </IconButton>
                </Chatbar.AttachTrigger>
                <IconButton variant="ghost" size="2" color="gray" highContrast aria-label="Add emoji" tooltip="Add emoji">
                  <HugeiconsIcon icon={SmileIcon} strokeWidth={1.75} />
                </IconButton>
                <IconButton variant="ghost" size="2" color="gray" highContrast aria-label="Voice message" tooltip="Voice message">
                  <HugeiconsIcon icon={Mic01Icon} strokeWidth={1.75} />
                </IconButton>
              </Chatbar.RowStart>
              <Chatbar.RowEnd>
                <Text size="1" color="gray">
                  Shift+Enter for new line
                </Text>
                <Chatbar.Send />
              </Chatbar.RowEnd>
            </Chatbar.Row>
          </Chatbar.Root>
        </PreviewBlock>
      </Flex>

      <Separator size="4" />

      {/* Example 2: AI Assistant Interface */}
      <Flex direction="column" gap="4">
        <SectionHeader.Root>
          <SectionHeader.Content>
            <SectionHeader.Title>AI Assistant Interface</SectionHeader.Title>
            <SectionHeader.Description>
              An always-open soft chatbar under a hero heading gives AI chat a clear starting point. With sendMode="always" the Send button stays visible but disabled until there is text or an
              attachment.
            </SectionHeader.Description>
          </SectionHeader.Content>
        </SectionHeader.Root>
        <PreviewBlock
          background="none"
          height="30rem"
          code={`<Hero.Root width="100%" maxWidth="600px">
  <Hero.Meta>
    <HugeiconsIcon icon={SparklesIcon} strokeWidth={1.75} />
  </Hero.Meta>
  <Flex direction="column" gap="2">
    <Hero.Title size="8">What are you working on today?</Hero.Title>
    <Hero.Description color="gray">
      Ask me anything about your projects, code, or ideas.
    </Hero.Description>
  </Flex>
  <Chatbar.Root
    open
    variant="soft"
    size="2"
    sendMode="always"
    minLines={3}
    maxLines={16}
    width="100%"
    onSubmit={handleSubmit}
  >
    <Chatbar.Textarea
      aria-label="Ask anything"
      placeholder="Ask me anything..."
      submitOnEnter
    />
    <Chatbar.Row>
      <Chatbar.RowStart>
        <Chatbar.AttachTrigger asChild>
          <IconButton
            variant="ghost"
            size="2"
            color="gray"
            highContrast
            aria-label="Attach file"
            tooltip="Attach file"
          >
            <HugeiconsIcon icon={Attachment01Icon} strokeWidth={1.75} />
          </IconButton>
        </Chatbar.AttachTrigger>
        <IconButton
          variant="ghost"
          size="2"
          color="gray"
          highContrast
          aria-label="Select model"
          tooltip="Select model"
        >
          <HugeiconsIcon icon={AiBrain01Icon} strokeWidth={1.75} />
        </IconButton>
      </Chatbar.RowStart>
      <Chatbar.RowEnd>
        <Chatbar.Send highContrast />
      </Chatbar.RowEnd>
    </Chatbar.Row>
  </Chatbar.Root>
</Hero.Root>`}
        >
          <Hero.Root width="100%" maxWidth="600px">
            <Hero.Meta>
              <HugeiconsIcon icon={SparklesIcon} strokeWidth={1.75} />
            </Hero.Meta>
            <Flex direction="column" gap="2">
              <Hero.Title size="8">What are you working on today?</Hero.Title>
              <Hero.Description color="gray">Ask me anything about your projects, code, or ideas.</Hero.Description>
            </Flex>
            <Chatbar.Root
              open
              variant="soft"
              size="2"
              sendMode="always"
              minLines={3}
              maxLines={16}
              width="100%"
              onSubmit={({ value, attachments }) => {
                console.log('Ask:', value);
                releasePreviews(attachments);
              }}
            >
              <Chatbar.Textarea aria-label="Ask anything" placeholder="Ask me anything..." submitOnEnter />
              <Chatbar.Row>
                <Chatbar.RowStart>
                  <Chatbar.AttachTrigger asChild>
                    <IconButton variant="ghost" size="2" color="gray" highContrast aria-label="Attach file" tooltip="Attach file">
                      <HugeiconsIcon icon={Attachment01Icon} strokeWidth={1.75} />
                    </IconButton>
                  </Chatbar.AttachTrigger>
                  <IconButton variant="ghost" size="2" color="gray" highContrast aria-label="Select model" tooltip="Select model">
                    <HugeiconsIcon icon={AiBrain01Icon} strokeWidth={1.75} />
                  </IconButton>
                </Chatbar.RowStart>
                <Chatbar.RowEnd>
                  <Chatbar.Send highContrast />
                </Chatbar.RowEnd>
              </Chatbar.Row>
            </Chatbar.Root>
          </Hero.Root>
        </PreviewBlock>
      </Flex>

      <Separator size="4" />

      {/* Example 3: Translucent Hero Chat */}
      <Flex direction="column" gap="4">
        <SectionHeader.Root>
          <SectionHeader.Content>
            <SectionHeader.Title>Translucent Hero</SectionHeader.Title>
            <SectionHeader.Description>
              The translucent material creates depth over dynamic backgrounds. Use classic variant with highContrast for maximum readability on complex surfaces.
            </SectionHeader.Description>
          </SectionHeader.Content>
        </SectionHeader.Root>
        <PreviewBlock
          showThemeToggle={false}
          appearance="dark"
          height="30rem"
          background={{
            backgroundImage:
              'url(https://images.unsplash.com/photo-1765684145185-387b6c69bef1?q=80&w=1287&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
          code={`<Theme appearance="dark">
  <Chatbar.Root
    open
    size="2"
    color="gray"
    material="translucent"
    sendMode="always"
    minLines={3}
    maxLines={16}
    width="100%"
    maxWidth="600px"
    onSubmit={handleSubmit}
  >
    <Chatbar.Textarea
      aria-label="Ask anything"
      placeholder="Ask me anything..."
      submitOnEnter
    />
    <Chatbar.Row>
      <Chatbar.RowStart>
        <Chatbar.AttachTrigger asChild>
          <IconButton
            variant="ghost"
            size="2"
            color="gray"
            highContrast
            aria-label="Attach file"
            tooltip="Attach file"
          >
            <HugeiconsIcon icon={Attachment01Icon} strokeWidth={1.75} />
          </IconButton>
        </Chatbar.AttachTrigger>
        <IconButton
          variant="ghost"
          size="2"
          color="gray"
          highContrast
          aria-label="Select model"
          tooltip="Select model"
        >
          <HugeiconsIcon icon={AiBrain01Icon} strokeWidth={1.75} />
        </IconButton>
      </Chatbar.RowStart>
      <Chatbar.RowEnd>
        <Chatbar.Send highContrast />
      </Chatbar.RowEnd>
    </Chatbar.Row>
  </Chatbar.Root>
</Theme>`}
        >
          <Chatbar.Root
            open
            variant="classic"
            size="2"
            color="gray"
            material="translucent"
            sendMode="always"
            minLines={3}
            maxLines={16}
            width="100%"
            maxWidth="600px"
            onSubmit={({ value, attachments }) => {
              console.log('Ask:', value);
              releasePreviews(attachments);
            }}
          >
            <Chatbar.Textarea aria-label="Ask anything" placeholder="Ask me anything..." submitOnEnter />
            <Chatbar.Row>
              <Chatbar.RowStart>
                <Chatbar.AttachTrigger asChild>
                  <IconButton variant="ghost" size="2" color="gray" highContrast aria-label="Attach file" tooltip="Attach file">
                    <HugeiconsIcon icon={Attachment01Icon} strokeWidth={1.75} />
                  </IconButton>
                </Chatbar.AttachTrigger>
                <IconButton variant="ghost" size="2" color="gray" highContrast aria-label="Select model" tooltip="Select model">
                  <HugeiconsIcon icon={AiBrain01Icon} strokeWidth={1.75} />
                </IconButton>
              </Chatbar.RowStart>
              <Chatbar.RowEnd>
                <Chatbar.Send highContrast />
              </Chatbar.RowEnd>
            </Chatbar.Row>
          </Chatbar.Root>
        </PreviewBlock>
      </Flex>
    </Flex>
  );
}
