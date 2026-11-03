import * as React from 'react';
import { Flex, Radio, Text } from '@kushagradhawan/kookie-ui';

const plans = ['Free', 'Pro', 'Team'];

export default function PlanPicker() {
  const [plan, setPlan] = React.useState('Free');

  return (
    <Flex direction="column" gap="2">
      {plans.map((name) => (
        <Text key={name} as="label" size="2">
          <Flex gap="2">
            <Radio name="plan" value={name} checked={plan === name} onValueChange={setPlan} />
            {name}
          </Flex>
        </Text>
      ))}
      <Text size="2" emphasis="medium">Selected: {plan}</Text>
    </Flex>
  );
}
