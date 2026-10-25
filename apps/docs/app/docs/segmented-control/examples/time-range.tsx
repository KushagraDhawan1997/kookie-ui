import * as React from 'react';
import { Flex, SegmentedControl, Text } from '@kushagradhawan/kookie-ui';

const visitors: Record<string, string> = { day: '1,204', week: '8,930', month: '36,412', year: '412,880' };

export default function VisitorsRange() {
  const [range, setRange] = React.useState('week');

  return (
    <Flex direction="column" gap="3" align="start">
      <SegmentedControl.Root value={range} onValueChange={setRange} aria-label="Time range">
        <SegmentedControl.Item value="day">Day</SegmentedControl.Item>
        <SegmentedControl.Item value="week">Week</SegmentedControl.Item>
        <SegmentedControl.Item value="month">Month</SegmentedControl.Item>
        <SegmentedControl.Item value="year">Year</SegmentedControl.Item>
      </SegmentedControl.Root>
      <Text size="2" emphasis="medium">{visitors[range]} visitors</Text>
    </Flex>
  );
}
