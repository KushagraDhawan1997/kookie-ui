import { Flex, Switch, Text } from '@kushagradhawan/kookie-ui';

export default function SingleSignOnSetting() {
  return (
    <Text as="label" size="2">
      <Flex justify="between" align="center" gap="6">
        <Flex direction="column">
          <Text weight="medium">Single sign-on</Text>
          <Text emphasis="medium">Managed by your organisation</Text>
        </Flex>
        <Switch disabled defaultChecked />
      </Flex>
    </Text>
  );
}
