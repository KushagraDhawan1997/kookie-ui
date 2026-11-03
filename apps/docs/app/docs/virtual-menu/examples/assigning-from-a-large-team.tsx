import * as React from 'react';
import { Avatar, Button, DropdownMenu, Text, VirtualMenu, type VirtualMenuRenderItemProps } from '@kushagradhawan/kookie-ui';

type Person = { name: string; initials: string };

const first = ['Maya', 'Leo', 'Aisha', 'Tom', 'Priya', 'Jonas', 'Sofia', 'Ravi', 'Emma', 'Kenji', 'Lena', 'Omar', 'Chloe', 'Hugo', 'Nina'];
const last = ['Patel', 'Brandt', 'Okafor', 'Silva', 'Nguyen', 'Larsen', 'Rossi', 'Kim', 'Cohen', 'Haddad', 'Moreau', 'Novak', 'Ito', 'Reyes', 'Berg'];
const members: Person[] = first.flatMap((f) => last.map((l) => ({ name: `${f} ${l}`, initials: f[0] + l[0] })));

const PersonRow = React.memo(function PersonRow({ item, isHighlighted, index, ...props }: VirtualMenuRenderItemProps<Person>) {
  return (
    <VirtualMenu.Item {...props}>
      <Avatar size="1" fallback={item.initials} />
      <Text size="2">{item.name}</Text>
    </VirtualMenu.Item>
  );
});

export default function AssigneePicker() {
  const [assignee, setAssignee] = React.useState('Assign');

  return (
    <DropdownMenu.Root>
      <DropdownMenu.Trigger>
        <Button>{assignee}<DropdownMenu.TriggerIcon /></Button>
      </DropdownMenu.Trigger>
      <DropdownMenu.Content virtualized>
        <VirtualMenu
          items={members}
          renderItem={PersonRow}
          aria-label="Team members"
          onSelect={(person) => setAssignee(person.name)}
          style={{ height: 320 }}
        />
      </DropdownMenu.Content>
    </DropdownMenu.Root>
  );
}
