import * as React from 'react';
import { Box, Flex, Slider, Text } from '@kushagradhawan/kookie-ui';

export default function BrightnessSetting() {
  const [brightness, setBrightness] = React.useState(60);
  const [saved, setSaved] = React.useState(60);

  return (
    <Box width="100%" maxWidth="320px">
      <Flex direction="column" gap="3">
        <Slider
          value={[brightness]}
          onValueChange={([value]) => setBrightness(value)}
          onValueCommit={([value]) => setSaved(value)}
          aria-label="Brightness"
        />
        <Text size="2" emphasis="medium">Showing {brightness}%, saved {saved}%</Text>
      </Flex>
    </Box>
  );
}
