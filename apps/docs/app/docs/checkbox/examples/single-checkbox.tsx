import { Checkbox, Flex, Text } from '@kushagradhawan/kookie-ui';

export default function RememberDevice() {
  return (
    <Text as="label" size="2">
      <Flex gap="2">
        <Checkbox defaultChecked />
        Remember me on this device
      </Flex>
    </Text>
  );
}
