import { Avatar, Flex, Text } from '@kushagradhawan/kookie-ui';

export default function WorkspaceLogo() {
  return (
    <Flex gap="3" align="center">
      <Avatar
        size="4"
        src="/logos/kookie-ui/kookie-ui-spaced-bg.png"
        alt=""
        fallback="KU"
        fit="contain"
        radius="medium"
      />
      <Text size="2" weight="medium">Kookie UI</Text>
    </Flex>
  );
}
