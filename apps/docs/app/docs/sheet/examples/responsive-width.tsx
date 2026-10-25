import { Button, Flex, Sheet, Text } from '@kushagradhawan/kookie-ui';

export default function InvoiceDetails() {
  return (
    <Sheet.Root>
      <Sheet.Trigger>
        <Button>View invoice</Button>
      </Sheet.Trigger>
      <Sheet.Content side="end" width={{ initial: '100%', md: '400px' }}>
        <Flex direction="column" gap="4">
          <Flex direction="column" gap="1">
            <Sheet.Title>Invoice 1042</Sheet.Title>
            <Sheet.Description>Paid on 3 March</Sheet.Description>
          </Flex>
          <Text size="2">Total: $1,280.00</Text>
          <Sheet.Close>
            <Button emphasis="quiet" color="gray">Close</Button>
          </Sheet.Close>
        </Flex>
      </Sheet.Content>
    </Sheet.Root>
  );
}
