import * as React from 'react';
import { Box, Button, Flex, Progress } from '@kushagradhawan/kookie-ui';

export default function ExportProgress() {
  const [total, setTotal] = React.useState<number | null>(null);
  const done = 18;

  return (
    <Box width="100%" maxWidth="320px">
      <Flex direction="column" gap="3" align="start">
        <Progress value={total ? (done / total) * 100 : null} aria-label="Preparing export" />
        <Button size="1" emphasis="quiet" onClick={() => setTotal(total ? null : 40)}>
          {total ? 'Reset' : 'Total arrives: 40 rows'}
        </Button>
      </Flex>
    </Box>
  );
}
