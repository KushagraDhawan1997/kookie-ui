import * as React from 'react';
import { Flex, Separator, Text } from '@kushagradhawan/kookie-ui';

const rows = [
  { label: 'Plan', value: 'Pro' },
  { label: 'Seats', value: '12' },
  { label: 'Renews', value: '1 March' },
];

export default function BillingSummary() {
  return (
    <Flex direction="column" gap="2" width="100%" maxWidth="280px">
      {rows.map((row, index) => (
        <React.Fragment key={row.label}>
          {index > 0 && <Separator light />}
          <Flex justify="between">
            <Text size="2" emphasis="medium">{row.label}</Text>
            <Text size="2">{row.value}</Text>
          </Flex>
        </React.Fragment>
      ))}
    </Flex>
  );
}
