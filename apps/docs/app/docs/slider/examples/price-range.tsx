import * as React from 'react';
import { Box, Flex, Slider, Text } from '@kushagradhawan/kookie-ui';

export default function PriceRangeFilter() {
  const [range, setRange] = React.useState([200, 800]);

  return (
    <Box width="100%" maxWidth="320px">
      <Flex direction="column" gap="3">
        <Text size="2" emphasis="medium">${range[0]} to ${range[1]}</Text>
        <Slider
          value={range}
          onValueChange={setRange}
          min={0}
          max={1000}
          step={50}
          minStepsBetweenThumbs={1}
          aria-label="Price range"
        />
      </Flex>
    </Box>
  );
}
