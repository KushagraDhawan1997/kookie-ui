import { Button, Dialog, Flex, Text } from '@kushagradhawan/kookie-ui';

const clauses = Array.from({ length: 12 }, (_, index) => `Clause ${index + 1}`);

export default function TermsDialog() {
  return (
    <Dialog.Root>
      <Dialog.Trigger>
        <Button>Read the terms</Button>
      </Dialog.Trigger>
      <Dialog.Content>
        <Dialog.Title>Terms of service</Dialog.Title>
        <Dialog.Description>Read every clause before you accept.</Dialog.Description>
        <Flex direction="column" gap="4" mt="4">
          {clauses.map((clause) => (
            <Text as="p" size="2" key={clause}>
              <Text weight="medium">{clause}.</Text> Each clause explains one part of the agreement in plain words,
              so you know what you agree to and what you can change later.
            </Text>
          ))}
        </Flex>
        <Flex justify="end" mt="5">
          <Dialog.Close>
            <Button emphasis="loud">Accept</Button>
          </Dialog.Close>
        </Flex>
      </Dialog.Content>
    </Dialog.Root>
  );
}
