import { Flex, Text, TextField } from '@kushagradhawan/kookie-ui';

export default function ContactFields() {
  return (
    <Flex direction="column" gap="4" width="100%" maxWidth="400px">
      <Flex direction="column" gap="1">
        <Text as="label" htmlFor="contact-name" size="2" weight="medium">Name</Text>
        <TextField.Root id="contact-name" />
      </Flex>
      <Flex direction="column" gap="1">
        <Text as="label" htmlFor="contact-email" size="2" weight="medium">Email</Text>
        <TextField.Root id="contact-email" type="email" />
      </Flex>
    </Flex>
  );
}
