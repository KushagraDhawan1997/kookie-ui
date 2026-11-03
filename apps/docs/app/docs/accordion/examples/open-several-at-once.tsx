import { Accordion } from '@kushagradhawan/kookie-ui';

const sections = [
  { id: 'shipping', title: 'How long does shipping take?', body: 'Orders arrive in 3 to 5 working days.' },
  { id: 'returns', title: 'Can I return an order?', body: 'Send it back within 30 days for a full refund.' },
  { id: 'tracking', title: 'Where is my tracking link?', body: 'It is in the email we send when the order ships.' },
];

export default function DeliveryFaq() {
  return (
    <Accordion.Root type="multiple" defaultValue={['shipping', 'returns']} variant="ghost">
      {sections.map((item) => (
        <Accordion.Item key={item.id} value={item.id}>
          <Accordion.Header>
            <Accordion.Trigger>{item.title}</Accordion.Trigger>
          </Accordion.Header>
          <Accordion.Content>{item.body}</Accordion.Content>
        </Accordion.Item>
      ))}
    </Accordion.Root>
  );
}
