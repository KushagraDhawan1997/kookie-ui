import { Accordion, Flex, Text } from '@kushagradhawan/kookie-ui';

export default function WorkspaceSettings() {
  return (
    <Flex direction="column" gap="2" width="100%">
      <Accordion.Root type="single" defaultValue="general">
        <Accordion.Item value="general">
          <Accordion.Header>
            <Accordion.Trigger>General</Accordion.Trigger>
          </Accordion.Header>
          <Accordion.Content>Name, icon and default language.</Accordion.Content>
        </Accordion.Item>
        <Accordion.Item value="sso" disabled>
          <Accordion.Header>
            <Accordion.Trigger>Single sign-on</Accordion.Trigger>
          </Accordion.Header>
          <Accordion.Content>Connect your identity provider.</Accordion.Content>
        </Accordion.Item>
      </Accordion.Root>
      <Text size="1" emphasis="medium">Single sign-on is part of the Business plan.</Text>
    </Flex>
  );
}
