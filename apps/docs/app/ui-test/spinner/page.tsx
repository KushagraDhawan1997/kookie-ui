'use client';

import React from 'react';
import { Spinner, Text, Flex, Box, Heading, Code, Separator, Container, Button } from '@kushagradhawan/kookie-ui';

export default function SpinnerTest() {
  const [showMany, setShowMany] = React.useState(false);

  return (
    <Container size="2" px="8" py="8">
      <Flex direction="column" gap="8">
        {/* Header */}
        <Flex direction="column" gap="3">
          <Heading size="9" weight="medium">Spinner</Heading>
          <Text size="2" color="gray">
            Testing spinner performance with single GPU-composited rotation animation
          </Text>
        </Flex>

        <Separator size="4" />

        {/* Test 1: All Sizes */}
        <Flex direction="column" gap="5">
          <Box>
            <Heading size="6" weight="medium" mb="2">1. All Sizes</Heading>
            <Text size="2" color="gray">
              Spinner scales correctly across all sizes
            </Text>
          </Box>

          <Flex gap="6" align="center">
            <Flex direction="column" align="center" gap="2">
              <Spinner size="1" />
              <Code size="1" variant="soft">size="1"</Code>
            </Flex>

            <Flex direction="column" align="center" gap="2">
              <Spinner size="2" />
              <Code size="1" variant="soft">size="2"</Code>
            </Flex>

            <Flex direction="column" align="center" gap="2">
              <Spinner size="3" />
              <Code size="1" variant="soft">size="3"</Code>
            </Flex>
          </Flex>

          <Box p="4" style={{ background: 'var(--gray-a2)', borderRadius: 'var(--radius-3)' }}>
            <Text size="2" color="gray">
              All sizes use the same <Code variant="soft">steps(8, end)</Code> rotation animation
            </Text>
          </Box>
        </Flex>

        <Separator size="4" />

        {/* Test 2: With Colors */}
        <Flex direction="column" gap="5">
          <Box>
            <Heading size="6" weight="medium" mb="2">2. Color Inheritance</Heading>
            <Text size="2" color="gray">
              Spinner inherits color from parent context
            </Text>
          </Box>

          <Flex gap="6" align="center">
            <Flex direction="column" align="center" gap="2">
              <Box style={{ color: 'var(--crimson-9)' }}>
                <Spinner size="3" />
              </Box>
              <Code size="1" variant="soft" color="crimson">crimson</Code>
            </Flex>

            <Flex direction="column" align="center" gap="2">
              <Box style={{ color: 'var(--blue-9)' }}>
                <Spinner size="3" />
              </Box>
              <Code size="1" variant="soft" color="blue">blue</Code>
            </Flex>

            <Flex direction="column" align="center" gap="2">
              <Box style={{ color: 'var(--green-9)' }}>
                <Spinner size="3" />
              </Box>
              <Code size="1" variant="soft" color="green">green</Code>
            </Flex>

            <Flex direction="column" align="center" gap="2">
              <Box style={{ color: 'var(--orange-9)' }}>
                <Spinner size="3" />
              </Box>
              <Code size="1" variant="soft" color="orange">orange</Code>
            </Flex>
          </Flex>

          <Box p="4" style={{ background: 'var(--gray-a2)', borderRadius: 'var(--radius-3)' }}>
            <Text size="2" color="gray">
              Uses <Code variant="soft">currentColor</Code> for leaf backgrounds
            </Text>
          </Box>
        </Flex>

        <Separator size="4" />

        {/* Test 3: With Loading State */}
        <Flex direction="column" gap="5">
          <Box>
            <Heading size="6" weight="medium" mb="2">3. Loading State</Heading>
            <Text size="2" color="gray">
              Spinner wrapping content shows/hides based on loading prop
            </Text>
          </Box>

          <Flex gap="4" align="center">
            <Spinner loading={true}>
              <Text>This text is hidden while loading</Text>
            </Spinner>

            <Spinner loading={false}>
              <Text>This text is visible (not loading)</Text>
            </Spinner>
          </Flex>

          <Box p="4" style={{ background: 'var(--gray-a2)', borderRadius: 'var(--radius-3)' }}>
            <Text size="2" color="gray">
              When <Code variant="soft">loading=true</Code>, spinner replaces children
            </Text>
          </Box>
        </Flex>

        <Separator size="4" />

        {/* Test 4: In Buttons */}
        <Flex direction="column" gap="5">
          <Box>
            <Heading size="6" weight="medium" mb="2">4. Inside Buttons</Heading>
            <Text size="2" color="gray">
              Spinner maintains proper sizing inside buttons
            </Text>
          </Box>

          <Flex gap="3" wrap="wrap">
            <Button size="1" disabled>
              <Spinner size="1" />
              Loading
            </Button>

            <Button size="2" disabled>
              <Spinner size="1" />
              Loading
            </Button>

            <Button size="3" disabled>
              <Spinner size="2" />
              Loading
            </Button>

            <Button size="2" variant="soft" color="gray" highContrast disabled>
              <Spinner size="1" />
              Processing
            </Button>
          </Flex>

          <Box p="4" style={{ background: 'var(--gray-a2)', borderRadius: 'var(--radius-3)' }}>
            <Text size="2" color="gray">
              Use smaller spinner sizes inside buttons for proper proportions
            </Text>
          </Box>
        </Flex>

        <Separator size="4" />

        {/* Test 5: Performance Stress Test */}
        <Flex direction="column" gap="5">
          <Box>
            <Heading size="6" weight="medium" mb="2">5. Performance Stress Test</Heading>
            <Text size="2" color="gray">
              Multiple spinners to test GPU-composited animation performance
            </Text>
          </Box>

          <Flex direction="column" gap="4">
            <Button
              variant="soft"
              color="gray"
              highContrast
              onClick={() => setShowMany(!showMany)}
            >
              {showMany ? 'Hide' : 'Show'} 50 Spinners
            </Button>

            {showMany && (
              <Flex gap="3" wrap="wrap" p="4" style={{ background: 'var(--gray-a2)', borderRadius: 'var(--radius-3)' }}>
                {Array.from({ length: 50 }).map((_, i) => (
                  <Spinner key={i} size="2" />
                ))}
              </Flex>
            )}
          </Flex>

          <Box p="4" style={{ background: 'var(--gray-a2)', borderRadius: 'var(--radius-3)' }}>
            <Text size="2" color="gray">
              Open DevTools → Performance tab to verify smooth 60fps with minimal CPU usage. Each spinner uses a single <Code variant="soft">transform: rotate()</Code> animation instead of 8 opacity animations.
            </Text>
          </Box>
        </Flex>

        <Separator size="4" />

        {/* Test 6: Animation Details */}
        <Flex direction="column" gap="5">
          <Box>
            <Heading size="6" weight="medium" mb="2">6. Animation Implementation</Heading>
            <Text size="2" color="gray">
              Technical details of the optimized spinner
            </Text>
          </Box>

          <Flex gap="6" align="start">
            <Box>
              <Heading size="3" weight="medium" mb="3">Before (Slow)</Heading>
              <Flex direction="column" gap="2">
                <Text size="2">• 8 separate opacity animations</Text>
                <Text size="2">• Opacity changes → CPU repaints</Text>
                <Text size="2">• ~480 opacity calcs/second</Text>
                <Text size="2">• New compositor layers per leaf</Text>
              </Flex>
            </Box>

            <Box>
              <Heading size="3" weight="medium" mb="3">After (Fast)</Heading>
              <Flex direction="column" gap="2">
                <Text size="2">• 1 transform rotation animation</Text>
                <Text size="2">• Transform → GPU composited</Text>
                <Text size="2">• Static opacity values on leaves</Text>
                <Text size="2">• Single compositor layer</Text>
              </Flex>
            </Box>
          </Flex>

          <Box p="4" style={{ background: 'var(--green-a2)', borderRadius: 'var(--radius-3)' }}>
            <Text size="2" color="green">
              Using <Code variant="soft">steps(8, end)</Code> creates the classic "tick" effect while keeping animation on the GPU
            </Text>
          </Box>
        </Flex>

        <Separator size="4" />

        {/* Test 7: Side by Side */}
        <Flex direction="column" gap="5">
          <Box>
            <Heading size="6" weight="medium" mb="2">7. Visual Consistency</Heading>
            <Text size="2" color="gray">
              Spinner appearance matches the classic iOS-style spinner
            </Text>
          </Box>

          <Flex justify="center" p="8" style={{ background: 'var(--gray-a2)', borderRadius: 'var(--radius-3)' }}>
            <Spinner size="3" />
          </Flex>

          <Box p="4" style={{ background: 'var(--gray-a2)', borderRadius: 'var(--radius-3)' }}>
            <Text size="2" color="gray">
              8 leaves with static decreasing opacity (1.0 → 0.2), rotated with stepped animation
            </Text>
          </Box>
        </Flex>
      </Flex>
    </Container>
  );
}
