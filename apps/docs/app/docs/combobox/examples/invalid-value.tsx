import * as React from 'react';
import { Combobox, Flex, Text } from '@kushagradhawan/kookie-ui';

export default function TimeZoneField() {
  const [zone, setZone] = React.useState<string | null>(null);

  return (
    <Flex direction="column" gap="1">
      <Text as="label" htmlFor="time-zone" size="2" weight="medium">Time zone</Text>
      <Combobox.Root value={zone} onValueChange={setZone} placeholder="Choose a time zone">
        <Combobox.Trigger id="time-zone" error={!zone} />
        <Combobox.Content>
          <Combobox.Input placeholder="Search time zones" />
          <Combobox.List>
            <Combobox.Empty>No time zones found</Combobox.Empty>
            <Combobox.Item value="Europe/London">Europe/London</Combobox.Item>
            <Combobox.Item value="Asia/Tokyo">Asia/Tokyo</Combobox.Item>
          </Combobox.List>
        </Combobox.Content>
      </Combobox.Root>
      {!zone && <Text size="1" color="red">Choose a time zone to continue.</Text>}
    </Flex>
  );
}
