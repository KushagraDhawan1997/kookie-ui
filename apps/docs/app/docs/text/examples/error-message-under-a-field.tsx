import { Checkbox, Flex, Text } from '@kushagradhawan/kookie-ui';

export default function TermsField() {
  return (
    <Flex direction="column" gap="1">
      <Text as="label" size="2">
        <Flex align="center" gap="2">
          <Checkbox aria-describedby="terms-error" />
          I agree to the terms of service
        </Flex>
      </Text>
      <Text as="p" id="terms-error" size="1" color="red">
        Accept the terms to create your account.
      </Text>
    </Flex>
  );
}
