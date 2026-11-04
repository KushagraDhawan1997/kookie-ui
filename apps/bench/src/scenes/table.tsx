import * as React from 'react';
import { Avatar, Button, Checkbox, Chip, DropdownMenu, Flex, ScrollArea, Table, Text } from '@kushagradhawan/kookie-ui';
import { useScene, useVersion } from '../harness';

const STATUSES = ['Active', 'Invited', 'Paused', 'Archived'] as const;
const COLORS = ['green', 'blue', 'amber', 'gray'] as const;

/** A data table: 500 rows, each with an avatar, a badge, a checkbox and a row menu. */
export function TableScene() {
  const [version, rerender] = useVersion();
  const scroller = React.useRef<HTMLDivElement>(null);
  const api = React.useMemo(() => ({ rerender, scroller: () => scroller.current }), [rerender]);
  useScene(api);

  return (
    <ScrollArea ref={scroller} style={{ height: '100vh' }}>
      <Table.Root>
        <Table.Header>
          <Table.Row>
            <Table.ColumnHeaderCell />
            <Table.ColumnHeaderCell>Name</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>Email</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>Status</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell>Seats</Table.ColumnHeaderCell>
            <Table.ColumnHeaderCell />
          </Table.Row>
        </Table.Header>
        <Table.Body>
          {Array.from({ length: 500 }, (_, i) => {
            const n = (i + version) % 4;
            return (
              <Table.Row key={i}>
                <Table.Cell>
                  <Checkbox aria-label={`Select row ${i}`} defaultChecked={n === 0} />
                </Table.Cell>
                <Table.RowHeaderCell>
                  <Flex align="center" gap="3">
                    <Avatar size="1" fallback={String.fromCharCode(65 + (i % 26))} />
                    <Text>Person {i + version}</Text>
                  </Flex>
                </Table.RowHeaderCell>
                <Table.Cell>person{i}@example.com</Table.Cell>
                <Table.Cell>
                  <Chip color={COLORS[n]}>{STATUSES[n]}</Chip>
                </Table.Cell>
                <Table.Cell>{(i * 7 + version) % 50}</Table.Cell>
                <Table.Cell>
                  <DropdownMenu.Root>
                    <DropdownMenu.Trigger>
                      <Button iconOnly variant="ghost" aria-label={`Actions for row ${i}`}>
                        …
                      </Button>
                    </DropdownMenu.Trigger>
                    <DropdownMenu.Content>
                      <DropdownMenu.Item>Edit</DropdownMenu.Item>
                      <DropdownMenu.Item>Duplicate</DropdownMenu.Item>
                      <DropdownMenu.Separator />
                      <DropdownMenu.Item color="red">Delete</DropdownMenu.Item>
                    </DropdownMenu.Content>
                  </DropdownMenu.Root>
                </Table.Cell>
              </Table.Row>
            );
          })}
        </Table.Body>
      </Table.Root>
      <Button data-bench="rerender" onClick={rerender} style={{ position: 'fixed', top: 8, right: 8 }}>
        Shuffle
      </Button>
    </ScrollArea>
  );
}
