import * as React from 'react';
import { Box, Text, TextField } from '@kushagradhawan/kookie-ui';

export default function WidthField() {
  const [width, setWidth] = React.useState(320);

  return (
    <Box width="140px">
      <TextField.Root
        type="number"
        value={width}
        onChange={(event) => setWidth(Number(event.target.value) || 0)}
        aria-label="Width"
      >
        <TextField.Slot
          scrub
          scrubValue={width}
          scrubMin={0}
          scrubMax={2000}
          onScrub={(delta) => setWidth((value) => value + delta)}
        >
          <Text size="2" emphasis="medium">W</Text>
        </TextField.Slot>
        <TextField.Slot side="right">
          <Text size="2" emphasis="medium">px</Text>
        </TextField.Slot>
      </TextField.Root>
    </Box>
  );
}
