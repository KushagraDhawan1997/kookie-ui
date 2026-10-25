import * as React from 'react';
import { Combobox } from '@kushagradhawan/kookie-ui';

// Stands in for your API.
const people = ['Ana Ruiz', 'Ben Okafor', 'Chen Wei', 'Dana Levi'];
const search = (query: string) => people.filter((name) => name.toLowerCase().includes(query.toLowerCase()));

export default function AssigneePicker() {
  const [query, setQuery] = React.useState('');

  return (
    <Combobox.Root shouldFilter={false} searchValue={query} onSearchValueChange={setQuery}>
      <Combobox.Trigger aria-label="Assignee" placeholder="Unassigned" />
      <Combobox.Content>
        <Combobox.Input placeholder="Search people" />
        <Combobox.List>
          <Combobox.Empty>No one matches "{query}"</Combobox.Empty>
          {search(query).map((name) => (
            <Combobox.Item key={name} value={name}>{name}</Combobox.Item>
          ))}
        </Combobox.List>
      </Combobox.Content>
    </Combobox.Root>
  );
}
