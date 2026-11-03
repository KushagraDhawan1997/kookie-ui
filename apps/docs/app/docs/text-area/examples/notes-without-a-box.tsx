import { Flex, Heading, Text, TextArea } from '@kushagradhawan/kookie-ui';

export default function MeetingNotes() {
  return (
    <Flex direction="column" gap="2" width="100%" maxWidth="420px">
      <Heading as="h3" size="4">
        Design review
      </Heading>
      <Text size="2" emphasis="medium">
        Thursday, 12 March
      </Text>
      <TextArea
        variant="ghost"
        aria-label="Notes"
        placeholder="Start typing your notes"
        rows={6}
      />
    </Flex>
  );
}
