import { Box, Slider } from '@kushagradhawan/kookie-ui';

export default function ExportQuality() {
  return (
    <Box width="100%" maxWidth="320px">
      <Slider
        defaultValue={[50]}
        ticks={[
          { value: 0, label: 'Low' },
          { value: 50, label: 'Medium' },
          { value: 100, label: 'High' },
        ]}
        snapToTicks
        aria-label="Quality"
      />
    </Box>
  );
}
