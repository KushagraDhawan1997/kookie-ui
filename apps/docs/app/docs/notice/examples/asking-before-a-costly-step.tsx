import * as React from 'react';
import { Box, Confirmation, Text } from '@kushagradhawan/kookie-ui';

export default function BudgetConfirmation() {
  const [answer, setAnswer] = React.useState<'pending' | 'allowing' | 'allowed' | 'declined'>('pending');

  function allow() {
    setAnswer('allowing');
    setTimeout(() => setAnswer('allowed'), 1500);
  }

  if (answer === 'allowed' || answer === 'declined') {
    return <Text size="2" emphasis="medium">{answer === 'allowed' ? 'Running with a $18 limit.' : 'The run is paused.'}</Text>;
  }

  return (
    <Box width="100%" maxWidth="480px">
      <Confirmation
        confirmLabel="Allow up to $18"
        onConfirm={allow}
        onCancel={() => setAnswer('declined')}
        busy={answer === 'allowing'}
      >
        This run may use more than your daily budget.
      </Confirmation>
    </Box>
  );
}
