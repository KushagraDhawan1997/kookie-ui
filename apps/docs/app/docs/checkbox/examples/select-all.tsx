import * as React from 'react';
import { Checkbox, Flex, Text } from '@kushagradhawan/kookie-ui';

const invoices = ['INV-1042', 'INV-1043', 'INV-1044'];

export default function InvoiceSelection() {
  const [selected, setSelected] = React.useState(['INV-1042']);
  const allChecked = selected.length === invoices.length;
  const someChecked = selected.length > 0 && !allChecked;

  function toggle(id: string, checked: boolean) {
    setSelected(checked ? [...selected, id] : selected.filter((item) => item !== id));
  }

  return (
    <Flex direction="column" gap="2">
      <Text as="label" size="2" weight="medium">
        <Flex gap="2">
          <Checkbox
            checked={allChecked ? true : someChecked ? 'indeterminate' : false}
            onCheckedChange={(checked) => setSelected(checked === true ? invoices : [])}
          />
          Select all invoices
        </Flex>
      </Text>
      {invoices.map((id) => (
        <Text key={id} as="label" size="2">
          <Flex gap="2" pl="5">
            <Checkbox checked={selected.includes(id)} onCheckedChange={(checked) => toggle(id, checked === true)} />
            {id}
          </Flex>
        </Text>
      ))}
    </Flex>
  );
}
