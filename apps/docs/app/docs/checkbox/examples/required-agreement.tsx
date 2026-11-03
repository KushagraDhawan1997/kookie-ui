import { Button, Checkbox, Flex, Text } from '@kushagradhawan/kookie-ui';

export default function SignUpTerms() {
  return (
    <form onSubmit={(event) => event.preventDefault()}>
      <Flex direction="column" gap="3" align="start">
        <Text as="label" size="2">
          <Flex gap="2">
            <Checkbox name="terms" required />
            I agree to the terms of service
          </Flex>
        </Text>
        <Button type="submit" emphasis="loud">Create account</Button>
      </Flex>
    </form>
  );
}
