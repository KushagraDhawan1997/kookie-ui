import * as React from 'react';
import { Flex, Select, Text } from '@kushagradhawan/kookie-ui';

export default function PlanField() {
  const [plan, setPlan] = React.useState('');

  return (
    <Flex direction="column" gap="1">
      <Text as="label" htmlFor="plan" size="2" weight="medium">
        Plan
      </Text>
      <Select.Root value={plan} onValueChange={setPlan}>
        <Select.Trigger id="plan" error={!plan} placeholder="Choose a plan" />
        <Select.Content>
          <Select.Item value="free">Free</Select.Item>
          <Select.Item value="pro">Pro</Select.Item>
        </Select.Content>
      </Select.Root>
      {!plan && (
        <Text size="1" color="red">
          Choose a plan to continue.
        </Text>
      )}
    </Flex>
  );
}
