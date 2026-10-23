'use client';

import React from 'react';
import { Spinner, Text, Flex, Box, Heading, Code, Separator, Button } from '@kushagradhawan/kookie-ui';

export default function SpinnerTest() {
  const [showMany, setShowMany] = React.useState(false);

  return (
    <Box maxWidth="688px" mx="auto" px="9" py="9">
      <Flex direction="column" gap="9">
        {/* Header */}
        <Flex direction="column" gap="4">
          <Heading size="9" weight="medium">Spinner</Heading>
          <Text size="2" emphasis="medium">
            Testing spinner performance with single GPU-composited rotation animation
          </Text>
        </Flex>

        <Separator />

        {/* Test 1: With Colors */}
        <Flex direction="column" gap="6">
          <Box>
            <Box mb="3">
              <Heading size="6" weight="medium">1. Color Inheritance</Heading>
            </Box>
            <Text size="2" emphasis="medium">
              Spinner inherits color from parent context
            </Text>
          </Box>

          <Flex gap="7" align="center">
            <Flex direction="column" align="center" gap="3">
              <Box style={{ color: 'var(--crimson-9)' }}>
                <Spinner />
              </Box>
              <Code size="1" variant="soft" color="crimson">crimson</Code>
            </Flex>

            <Flex direction="column" align="center" gap="3">
              <Box style={{ color: 'var(--blue-9)' }}>
                <Spinner />
              </Box>
              <Code size="1" variant="soft" color="blue">blue</Code>
            </Flex>

            <Flex direction="column" align="center" gap="3">
              <Box style={{ color: 'var(--green-9)' }}>
                <Spinner />
              </Box>
              <Code size="1" variant="soft" color="green">green</Code>
            </Flex>

            <Flex direction="column" align="center" gap="3">
              <Box style={{ color: 'var(--orange-9)' }}>
                <Spinner />
              </Box>
              <Code size="1" variant="soft" color="orange">orange</Code>
            </Flex>
          </Flex>

          <Box p="5" style={{ background: 'var(--neutral-a2)', borderRadius: 'var(--radius-3)' }}>
            <Text size="2" emphasis="medium">
              Uses <Code variant="soft">currentColor</Code> for leaf backgrounds
            </Text>
          </Box>
        </Flex>

        <Separator />

        {/* Test 2: With Loading State */}
        <Flex direction="column" gap="6">
          <Box>
            <Box mb="3">
              <Heading size="6" weight="medium">2. Loading State</Heading>
            </Box>
            <Text size="2" emphasis="medium">
              Spinner wrapping content shows/hides based on loading prop
            </Text>
          </Box>

          <Flex gap="5" align="center">
            <Spinner loading={true}>
              <Text>This text is hidden while loading</Text>
            </Spinner>

            <Spinner loading={false}>
              <Text>This text is visible (not loading)</Text>
            </Spinner>
          </Flex>

          <Box p="5" style={{ background: 'var(--neutral-a2)', borderRadius: 'var(--radius-3)' }}>
            <Text size="2" emphasis="medium">
              When <Code variant="soft">loading=true</Code>, spinner replaces children
            </Text>
          </Box>
        </Flex>

        <Separator />

        {/* Test 3: In Buttons */}
        <Flex direction="column" gap="6">
          <Box>
            <Box mb="3">
              <Heading size="6" weight="medium">3. Inside Buttons</Heading>
            </Box>
            <Text size="2" emphasis="medium">
              Spinner is 16px at every button size
            </Text>
          </Box>

          <Flex gap="4" wrap="wrap">
            <Button size="1" disabled>
              <Spinner />
              Loading
            </Button>

            <Button size="2" disabled>
              <Spinner />
              Loading
            </Button>

            <Button size="3" disabled>
              <Spinner />
              Loading
            </Button>

            <Button size="2" variant="soft" color="gray" disabled>
              <Spinner />
              Processing
            </Button>
          </Flex>

          <Box p="5" style={{ background: 'var(--neutral-a2)', borderRadius: 'var(--radius-3)' }}>
            <Text size="2" emphasis="medium">
              Spinner has one size, 16px
            </Text>
          </Box>
        </Flex>

        <Separator />

        {/* Test 4: Performance Stress Test */}
        <Flex direction="column" gap="6">
          <Box>
            <Box mb="3">
              <Heading size="6" weight="medium">4. Performance Stress Test</Heading>
            </Box>
            <Text size="2" emphasis="medium">
              Multiple spinners to test GPU-composited animation performance
            </Text>
          </Box>

          <Flex direction="column" gap="5">
            <Button
              variant="soft"
              color="gray"
              onClick={() => setShowMany(!showMany)}
            >
              {showMany ? 'Hide' : 'Show'} 50 Spinners
            </Button>

            {showMany && (
              <Flex gap="4" wrap="wrap" p="5" style={{ background: 'var(--neutral-a2)', borderRadius: 'var(--radius-3)' }}>
                {Array.from({ length: 50 }).map((_, i) => (
                  <Spinner key={i} />
                ))}
              </Flex>
            )}
          </Flex>

          <Box p="5" style={{ background: 'var(--neutral-a2)', borderRadius: 'var(--radius-3)' }}>
            <Text size="2" emphasis="medium">
              Open DevTools → Performance tab to verify smooth 60fps with minimal CPU usage. Each spinner uses a single <Code variant="soft">transform: rotate()</Code> animation instead of 8 opacity animations.
            </Text>
          </Box>
        </Flex>

        <Separator />

        {/* Test 5: Animation Details */}
        <Flex direction="column" gap="6">
          <Box>
            <Box mb="3">
              <Heading size="6" weight="medium">5. Animation Implementation</Heading>
            </Box>
            <Text size="2" emphasis="medium">
              Technical details of the optimized spinner
            </Text>
          </Box>

          <Flex gap="7" align="start">
            <Box>
              <Box mb="4">
                <Heading size="3" weight="medium">Before (Slow)</Heading>
              </Box>
              <Flex direction="column" gap="3">
                <Text size="2">• 8 separate opacity animations</Text>
                <Text size="2">• Opacity changes → CPU repaints</Text>
                <Text size="2">• ~480 opacity calcs/second</Text>
                <Text size="2">• New compositor layers per leaf</Text>
              </Flex>
            </Box>

            <Box>
              <Box mb="4">
                <Heading size="3" weight="medium">After (Fast)</Heading>
              </Box>
              <Flex direction="column" gap="3">
                <Text size="2">• 1 transform rotation animation</Text>
                <Text size="2">• Transform → GPU composited</Text>
                <Text size="2">• Static opacity values on leaves</Text>
                <Text size="2">• Single compositor layer</Text>
              </Flex>
            </Box>
          </Flex>

          <Box p="5" style={{ background: 'var(--green-a2)', borderRadius: 'var(--radius-3)' }}>
            <Text size="2" color="green">
              Using <Code variant="soft">steps(8, end)</Code> creates the classic "tick" effect while keeping animation on the GPU
            </Text>
          </Box>
        </Flex>

        <Separator />

        {/* Test 6: Side by Side */}
        <Flex direction="column" gap="6">
          <Box>
            <Box mb="3">
              <Heading size="6" weight="medium">6. Visual Consistency</Heading>
            </Box>
            <Text size="2" emphasis="medium">
              Spinner appearance matches the classic iOS-style spinner
            </Text>
          </Box>

          <Flex justify="center" p="9" style={{ background: 'var(--neutral-a2)', borderRadius: 'var(--radius-3)' }}>
            <Spinner />
          </Flex>

          <Box p="5" style={{ background: 'var(--neutral-a2)', borderRadius: 'var(--radius-3)' }}>
            <Text size="2" emphasis="medium">
              8 leaves with static decreasing opacity (1.0 → 0.2), rotated with stepped animation
            </Text>
          </Box>
        </Flex>
      </Flex>
    </Box>
  );
}
