import { Flex, Heading, Text } from '@kushagradhawan/kookie-ui';

export default function SettingsPage() {
  return (
    <Flex direction="column" gap="5">
      <Heading as="h1" size="7">Settings</Heading>
      <Flex direction="column" gap="2">
        <Heading as="h2" size="5">Profile</Heading>
        <Text as="p" size="2" emphasis="medium">Your name and photo appear on everything you share.</Text>
      </Flex>
    </Flex>
  );
}
