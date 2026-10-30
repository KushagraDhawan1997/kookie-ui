import * as React from 'react';
import { Button, DropdownMenu, Flex, Text, VirtualMenu, type VirtualMenuRenderItemProps } from '@kushagradhawan/kookie-ui';

type Command = { id: number; name: string; hint?: string };

const commands: Command[] = Array.from({ length: 300 }, (_, index) => ({
  id: index,
  name: `Command ${index + 1}`,
  hint: index % 3 === 0 ? 'Runs on every file in the project' : undefined,
}));

const CommandRow = React.memo(function CommandRow({ item, isHighlighted, index, ...props }: VirtualMenuRenderItemProps<Command>) {
  return (
    <VirtualMenu.Item {...props}>
      <Flex direction="column">
        <Text size="2">{item.name}</Text>
        {item.hint && <Text size="1" emphasis="medium">{item.hint}</Text>}
      </Flex>
    </VirtualMenu.Item>
  );
});

export default function CommandPicker() {
  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger>
        <Button>Run command<DropdownMenu.TriggerIcon /></Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content virtualized>
        <VirtualMenu
          items={commands}
          renderItem={CommandRow}
          estimatedItemSize={(index) => (commands[index].hint ? 48 : 32)}
          aria-label="Commands"
          style={{ height: 320 }}
        />
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  );
}
