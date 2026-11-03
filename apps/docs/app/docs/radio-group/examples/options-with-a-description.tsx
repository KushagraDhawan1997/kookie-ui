import { Flex, RadioGroup, Text } from '@kushagradhawan/kookie-ui';

const periods = [
  { value: 'monthly', label: 'Monthly', detail: 'Billed every month, cancel any time' },
  { value: 'yearly', label: 'Yearly', detail: 'Two months free, billed once a year' },
];

export default function BillingPeriodChoice() {
  return (
    <RadioGroup.Root defaultValue="monthly" aria-label="Billing period">
      {periods.map((period) => (
        <RadioGroup.Item key={period.value} value={period.value}>
          <Flex direction="column">
            <Text weight="medium">{period.label}</Text>
            <Text emphasis="medium">{period.detail}</Text>
          </Flex>
        </RadioGroup.Item>
      ))}
    </RadioGroup.Root>
  );
}
