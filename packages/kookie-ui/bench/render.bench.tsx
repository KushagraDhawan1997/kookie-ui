import * as React from 'react';
import { renderToString } from 'react-dom/server';
import { bench, describe } from 'vitest';

import { Theme } from '../src/components/theme.js';
import { Flex } from '../src/components/flex.js';
import { Box } from '../src/components/box.js';
import { Text } from '../src/components/text.js';
import { Heading } from '../src/components/heading.js';
import { Button } from '../src/components/button.js';
import { Card } from '../src/components/card.js';
import { Badge } from '../src/components/badge.js';

// A list of cards is the shape most app screens actually are: a lot of layout
// primitives wrapping a little content. Rendering it end to end measures the
// prop-extraction path at the density it is really used.
function Row({ index }: { index: number }) {
  return (
    <Card variant="classic" size="2">
      <Flex direction="column" gap="2" p="3">
        <Flex align="center" justify="between" gap="3">
          <Heading size="3">Item {index}</Heading>
          <Badge color="gray" variant="soft">
            Active
          </Badge>
        </Flex>
        <Text size="2" color="gray">
          A description line that sits under the heading.
        </Text>
        <Flex gap="2" mt="2">
          <Button size="2" variant="soft" color="gray" highContrast>
            Cancel
          </Button>
          <Button size="2" variant="classic" highContrast>
            Save
          </Button>
        </Flex>
      </Flex>
    </Card>
  );
}

function Screen({ rows }: { rows: number }) {
  return (
    <Theme>
      <Box p="4">
        <Flex direction="column" gap="3">
          {Array.from({ length: rows }, (_, i) => (
            <Row key={i} index={i} />
          ))}
        </Flex>
      </Box>
    </Theme>
  );
}

describe('renderToString', () => {
  bench('50-row screen (~800 elements)', () => {
    renderToString(<Screen rows={50} />);
  });

  bench('bare layout primitives x500', () => {
    renderToString(
      <Theme>
        <Flex direction="column" gap="2">
          {Array.from({ length: 500 }, (_, i) => (
            <Flex key={i} align="center" gap="2" px="3">
              <Text size="2">row {i}</Text>
            </Flex>
          ))}
        </Flex>
      </Theme>,
    );
  });
});
