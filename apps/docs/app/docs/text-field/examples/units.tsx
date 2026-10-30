import { Box, Text, TextField } from '@kushagradhawan/kookie-ui';

export default function FontSizeField() {
  return (
    <Box width="120px">
      <TextField.Root type="number" defaultValue="16" aria-label="Font size">
        <TextField.Slot side="right">
          <Text size="2" emphasis="medium">px</Text>
        </TextField.Slot>
      </TextField.Root>
    </Box>
  );
}
