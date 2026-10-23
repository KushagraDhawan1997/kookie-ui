import * as React from 'react';
import { Button, DropdownMenu, Flex } from '@kushagradhawan/kookie-ui';
import { useScene, useVersion } from '../harness';

/** A menu of 300 items in 10 groups, opened and walked with the keyboard. */
export function MenuScene() {
  const [version, rerender] = useVersion();
  const api = React.useMemo(() => ({ rerender }), [rerender]);
  useScene(api);

  return (
    <Flex p="6">
      <DropdownMenu.Root>
        <DropdownMenu.Trigger>
          <Button data-bench="open">Open menu {version}</Button>
        </DropdownMenu.Trigger>
        <DropdownMenu.Content>
          {Array.from({ length: 10 }, (_, g) => (
            <DropdownMenu.Group key={g}>
              <DropdownMenu.Label>Group {g}</DropdownMenu.Label>
              {Array.from({ length: 30 }, (_, i) => (
                <DropdownMenu.Item key={i} shortcut={i < 9 ? `⌘${i + 1}` : undefined}>
                  Item {g * 30 + i + version}
                </DropdownMenu.Item>
              ))}
              <DropdownMenu.Separator />
            </DropdownMenu.Group>
          ))}
        </DropdownMenu.Content>
      </DropdownMenu.Root>
    </Flex>
  );
}
