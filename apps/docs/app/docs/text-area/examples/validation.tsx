import * as React from 'react';
import { Box, TextArea } from '@kushagradhawan/kookie-ui';

export default function StepsToReproduceField() {
  const [steps, setSteps] = React.useState('');
  const [touched, setTouched] = React.useState(false);
  const missing = touched && steps.trim() === '';

  return (
    <Box width="100%" maxWidth="360px">
      <TextArea
        aria-label="Steps to reproduce"
        placeholder="What did you do before the error appeared?"
        value={steps}
        onChange={(event) => setSteps(event.target.value)}
        onBlur={() => setTouched(true)}
        error={missing}
        errorMessage={missing ? 'Describe what you did before the error appeared' : undefined}
      />
    </Box>
  );
}
