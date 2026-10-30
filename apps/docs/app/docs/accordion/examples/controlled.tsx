import * as React from 'react';
import { Accordion, Button, Flex } from '@kushagradhawan/kookie-ui';

export default function RefundHelp() {
  const [open, setOpen] = React.useState('');

  return (
    <Flex direction="column" gap="3" width="100%">
      <Flex>
        <Button emphasis="quiet" onClick={() => setOpen('refunds')}>
          How do refunds work?
        </Button>
      </Flex>
      <Accordion.Root type="single" value={open} onValueChange={setOpen}>
        <Accordion.Item value="refunds">
          <Accordion.Header>
            <Accordion.Trigger>Refunds</Accordion.Trigger>
          </Accordion.Header>
          <Accordion.Content>Refunds reach your card within 5 working days.</Accordion.Content>
        </Accordion.Item>
        <Accordion.Item value="invoices">
          <Accordion.Header>
            <Accordion.Trigger>Invoices</Accordion.Trigger>
          </Accordion.Header>
          <Accordion.Content>Download every invoice from Billing.</Accordion.Content>
        </Accordion.Item>
      </Accordion.Root>
    </Flex>
  );
}
