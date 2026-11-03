import { Box, Button, Flex, Popover, Separator, Text } from '@kushagradhawan/kookie-ui';

const members = ['Ana Ruiz', 'Ben Okafor', 'Chen Wei'];

export default function TeamPopover() {
  return (
    <Popover.Root>
      <Popover.Trigger>
        <Button>Team</Button>
      </Popover.Trigger>
      <Popover.Content width="260px">
        <Text as="p" size="2" weight="medium">3 members</Text>
        <Box mx="bleed" my="3">
          <Separator />
        </Box>
        <Flex direction="column" gap="2">
          {members.map((name) => (
            <Text key={name} size="2">{name}</Text>
          ))}
        </Flex>
      </Popover.Content>
    </Popover.Root>
  );
}
