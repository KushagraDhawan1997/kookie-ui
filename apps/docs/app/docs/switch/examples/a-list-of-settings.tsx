import { Flex, Switch, Text } from '@kushagradhawan/kookie-ui';

export default function NotificationSettings() {
  return (
    <Flex direction="column" gap="3" width="100%" maxWidth="320px">
      <Text as="label" size="2">
        <Flex justify="between" align="center" gap="4">
          Email notifications
          <Switch defaultChecked />
        </Flex>
      </Text>
      <Text as="label" size="2">
        <Flex justify="between" align="center" gap="4">
          Push notifications
          <Switch />
        </Flex>
      </Text>
      <Text as="label" size="2">
        <Flex justify="between" align="center" gap="4">
          Weekly summary
          <Switch defaultChecked />
        </Flex>
      </Text>
    </Flex>
  );
}
