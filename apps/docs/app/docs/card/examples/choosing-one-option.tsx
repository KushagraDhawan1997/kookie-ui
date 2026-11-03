import { Card, Flex, Radio, Text } from '@kushagradhawan/kookie-ui';

const plans = [
  { value: 'free', label: 'Free, with 3 projects' },
  { value: 'pro', label: 'Pro, with unlimited projects' },
];

export default function PlanChoice() {
  return (
    <Flex direction="column" gap="2" width="100%" maxWidth="320px">
      {plans.map((plan) => (
        <Card key={plan.value} asChild>
          <label>
            <Flex gap="3" align="center">
              <Radio name="plan" value={plan.value} defaultChecked={plan.value === 'pro'} />
              <Text size="2">{plan.label}</Text>
            </Flex>
          </label>
        </Card>
      ))}
    </Flex>
  );
}
