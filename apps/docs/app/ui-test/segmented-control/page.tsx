'use client';

import React from 'react';
import { SegmentedControl, Text, Flex, Box, Heading, Code, Separator } from '@kushagradhawan/kookie-ui';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  Grid02Icon,
  Menu01Icon,
  LayoutIcon,
  LayoutBottomIcon,
  CodeIcon,
  Settings01Icon,
  ColorsIcon,
  Layers01Icon,
  SwatchIcon,
  Search01Icon,
  Copy01Icon,
  Download01Icon,
} from '@hugeicons/core-free-icons';

export default function SegmentedControlTest() {
  const [view, setView] = React.useState('grid');
  const [alignment, setAlignment] = React.useState('left');
  const [theme, setTheme] = React.useState('light');
  const [direction, setDirection] = React.useState('right');
  const [size1Value, setSize1Value] = React.useState('a');
  const [size2Value, setSize2Value] = React.useState('a');
  const [size3Value, setSize3Value] = React.useState('a');
  const [size4Value, setSize4Value] = React.useState('a');
  const [verticalView, setVerticalView] = React.useState('code');
  const [verticalTool, setVerticalTool] = React.useState('search');
  const [verticalText, setVerticalText] = React.useState('day');

  return (
    <Box maxWidth="688px" mx="auto" px="9" py="9">
      <Flex direction="column" gap="9">
        {/* Header */}
        <Flex direction="column" gap="4">
          <Heading size="9" weight="medium">SegmentedControl</Heading>
          <Text size="2" emphasis="medium">
            Testing icon-only mode and vertical orientation
          </Text>
        </Flex>

        <Separator />

        {/* Test 1: Basic Text vs Icon-Only Comparison */}
        <Flex direction="column" gap="6">
          <Box>
            <Box mb="3">
              <Heading size="6" weight="medium">1. Text vs Icon-Only Comparison</Heading>
            </Box>
            <Text size="2" emphasis="medium">
              Compare standard text segments with icon-only fixed-width segments
            </Text>
          </Box>
          
          <Flex direction="column" gap="5">
            <Box>
              <Box mb="3">
                <Text size="2" weight="medium">Text Labels (default)</Text>
              </Box>
              <SegmentedControl.Root defaultValue="grid">
                <SegmentedControl.Item value="list">List</SegmentedControl.Item>
                <SegmentedControl.Item value="grid">Grid</SegmentedControl.Item>
                <SegmentedControl.Item value="board">Board</SegmentedControl.Item>
              </SegmentedControl.Root>
            </Box>

            <Box>
              <Box mb="3">
                <Text size="2" weight="medium">Icon-Only (fixed width)</Text>
              </Box>
              <SegmentedControl.Root value={view} onValueChange={setView}>
                <SegmentedControl.Item value="list" iconOnly aria-label="List view">
                  <HugeiconsIcon icon={Menu01Icon} strokeWidth={1.75} />
                </SegmentedControl.Item>
                <SegmentedControl.Item value="grid" iconOnly aria-label="Grid view">
                  <HugeiconsIcon icon={Grid02Icon} strokeWidth={1.75} />
                </SegmentedControl.Item>
                <SegmentedControl.Item value="board" iconOnly aria-label="Board view">
                  <HugeiconsIcon icon={LayoutIcon} strokeWidth={1.75} />
                </SegmentedControl.Item>
              </SegmentedControl.Root>
            </Box>
          </Flex>

          <Box p="5" style={{ background: 'var(--neutral-a2)', borderRadius: 'var(--radius-3)' }}>
            <Text size="2" emphasis="medium">
              <Code variant="soft">iconOnly</Code> applies fixed square width = height, with no horizontal padding
            </Text>
          </Box>
        </Flex>

        <Separator />

        {/* Test 2: All Sizes Icon-Only */}
        <Flex direction="column" gap="6">
          <Box>
            <Box mb="3">
              <Heading size="6" weight="medium">2. Icon-Only Across All Sizes</Heading>
            </Box>
            <Text size="2" emphasis="medium">
              Each size maintains square aspect ratio
            </Text>
          </Box>
          
          <Flex direction="column" gap="5">
            <Flex align="center" gap="5">
              <Text size="2" style={{ width: 60 }}>Size 1</Text>
              <SegmentedControl.Root size="1" value={size1Value} onValueChange={setSize1Value}>
                <SegmentedControl.Item value="a" iconOnly aria-label="Option A">
                  <HugeiconsIcon icon={Menu01Icon} strokeWidth={1.75} />
                </SegmentedControl.Item>
                <SegmentedControl.Item value="b" iconOnly aria-label="Option B">
                  <HugeiconsIcon icon={Grid02Icon} strokeWidth={1.75} />
                </SegmentedControl.Item>
                <SegmentedControl.Item value="c" iconOnly aria-label="Option C">
                  <HugeiconsIcon icon={LayoutIcon} strokeWidth={1.75} />
                </SegmentedControl.Item>
              </SegmentedControl.Root>
              <Code size="1" variant="soft">24px × 24px</Code>
            </Flex>

            <Flex align="center" gap="5">
              <Text size="2" style={{ width: 60 }}>Size 2</Text>
              <SegmentedControl.Root size="2" value={size2Value} onValueChange={setSize2Value}>
                <SegmentedControl.Item value="a" iconOnly aria-label="Option A">
                  <HugeiconsIcon icon={Menu01Icon} strokeWidth={1.75} />
                </SegmentedControl.Item>
                <SegmentedControl.Item value="b" iconOnly aria-label="Option B">
                  <HugeiconsIcon icon={Grid02Icon} strokeWidth={1.75} />
                </SegmentedControl.Item>
                <SegmentedControl.Item value="c" iconOnly aria-label="Option C">
                  <HugeiconsIcon icon={LayoutIcon} strokeWidth={1.75} />
                </SegmentedControl.Item>
              </SegmentedControl.Root>
              <Code size="1" variant="soft">32px × 32px</Code>
            </Flex>

            <Flex align="center" gap="5">
              <Text size="2" style={{ width: 60 }}>Size 3</Text>
              <SegmentedControl.Root size="3" value={size3Value} onValueChange={setSize3Value}>
                <SegmentedControl.Item value="a" iconOnly aria-label="Option A">
                  <HugeiconsIcon icon={Menu01Icon} strokeWidth={1.75} />
                </SegmentedControl.Item>
                <SegmentedControl.Item value="b" iconOnly aria-label="Option B">
                  <HugeiconsIcon icon={Grid02Icon} strokeWidth={1.75} />
                </SegmentedControl.Item>
                <SegmentedControl.Item value="c" iconOnly aria-label="Option C">
                  <HugeiconsIcon icon={LayoutIcon} strokeWidth={1.75} />
                </SegmentedControl.Item>
              </SegmentedControl.Root>
              <Code size="1" variant="soft">40px × 40px</Code>
            </Flex>

            <Flex align="center" gap="5">
              <Text size="2" style={{ width: 60 }}>Size 4</Text>
              <SegmentedControl.Root size="4" value={size4Value} onValueChange={setSize4Value}>
                <SegmentedControl.Item value="a" iconOnly aria-label="Option A">
                  <HugeiconsIcon icon={Menu01Icon} strokeWidth={1.75} />
                </SegmentedControl.Item>
                <SegmentedControl.Item value="b" iconOnly aria-label="Option B">
                  <HugeiconsIcon icon={Grid02Icon} strokeWidth={1.75} />
                </SegmentedControl.Item>
                <SegmentedControl.Item value="c" iconOnly aria-label="Option C">
                  <HugeiconsIcon icon={LayoutIcon} strokeWidth={1.75} />
                </SegmentedControl.Item>
              </SegmentedControl.Root>
              <Code size="1" variant="soft">48px × 48px</Code>
            </Flex>
          </Flex>

          <Box p="5" style={{ background: 'var(--neutral-a2)', borderRadius: 'var(--radius-3)' }}>
            <Text size="2" emphasis="medium">
              Uses <Code variant="soft">--segmented-control-height</Code> for both width and height
            </Text>
          </Box>
        </Flex>

        <Separator />

        {/* Test 3: Real-World Use Cases */}
        <Flex direction="column" gap="6">
          <Box>
            <Box mb="3">
              <Heading size="6" weight="medium">3. Real-World Use Cases</Heading>
            </Box>
            <Text size="2" emphasis="medium">
              Common icon-only segmented control patterns
            </Text>
          </Box>
          
          <Flex direction="column" gap="5">
            <Box>
              <Box mb="3">
                <Text size="2" weight="medium">View Mode</Text>
              </Box>
              <SegmentedControl.Root value={alignment} onValueChange={setAlignment}>
                <SegmentedControl.Item value="left" iconOnly aria-label="Code view">
                  <HugeiconsIcon icon={CodeIcon} strokeWidth={1.75} />
                </SegmentedControl.Item>
                <SegmentedControl.Item value="center" iconOnly aria-label="Layout view">
                  <HugeiconsIcon icon={LayoutIcon} strokeWidth={1.75} />
                </SegmentedControl.Item>
                <SegmentedControl.Item value="right" iconOnly aria-label="Layers view">
                  <HugeiconsIcon icon={Layers01Icon} strokeWidth={1.75} />
                </SegmentedControl.Item>
                <SegmentedControl.Item value="justify" iconOnly aria-label="Settings">
                  <HugeiconsIcon icon={Settings01Icon} strokeWidth={1.75} />
                </SegmentedControl.Item>
              </SegmentedControl.Root>
            </Box>

            <Box>
              <Box mb="3">
                <Text size="2" weight="medium">Tool Picker</Text>
              </Box>
              <SegmentedControl.Root value={theme} onValueChange={setTheme}>
                <SegmentedControl.Item value="light" iconOnly aria-label="Search">
                  <HugeiconsIcon icon={Search01Icon} strokeWidth={1.75} />
                </SegmentedControl.Item>
                <SegmentedControl.Item value="dark" iconOnly aria-label="Copy">
                  <HugeiconsIcon icon={Copy01Icon} strokeWidth={1.75} />
                </SegmentedControl.Item>
                <SegmentedControl.Item value="system" iconOnly aria-label="Download">
                  <HugeiconsIcon icon={Download01Icon} strokeWidth={1.75} />
                </SegmentedControl.Item>
              </SegmentedControl.Root>
            </Box>

            <Box>
              <Box mb="3">
                <Text size="2" weight="medium">Style Picker</Text>
              </Box>
              <SegmentedControl.Root value={direction} onValueChange={setDirection}>
                <SegmentedControl.Item value="left" iconOnly aria-label="Colors">
                  <HugeiconsIcon icon={ColorsIcon} strokeWidth={1.75} />
                </SegmentedControl.Item>
                <SegmentedControl.Item value="up" iconOnly aria-label="Swatch">
                  <HugeiconsIcon icon={SwatchIcon} strokeWidth={1.75} />
                </SegmentedControl.Item>
                <SegmentedControl.Item value="down" iconOnly aria-label="Layout bottom">
                  <HugeiconsIcon icon={LayoutBottomIcon} strokeWidth={1.75} />
                </SegmentedControl.Item>
                <SegmentedControl.Item value="right" iconOnly aria-label="Grid">
                  <HugeiconsIcon icon={Grid02Icon} strokeWidth={1.75} />
                </SegmentedControl.Item>
              </SegmentedControl.Root>
            </Box>
          </Flex>

          <Box p="5" style={{ background: 'var(--neutral-a2)', borderRadius: 'var(--radius-3)' }}>
            <Text size="2" emphasis="medium">
              Always include <Code variant="soft">aria-label</Code> for accessibility when using icon-only segments
            </Text>
          </Box>
        </Flex>

        <Separator />

        {/* Test 4: Visual Preview */}
        <Flex direction="column" gap="6">
          <Box>
            <Box mb="3">
              <Heading size="6" weight="medium">4. Interactive Preview</Heading>
            </Box>
            <Text size="2" emphasis="medium">
              See the selected values reflected in real-time
            </Text>
          </Box>
          
          <Box 
            p="7" 
            style={{ 
              background: 'var(--neutral-a2)', 
              borderRadius: 'var(--radius-3)',
              minHeight: 120,
            }}
          >
            <Flex gap="5" wrap="wrap">
              <Code variant="soft">View: {view}</Code>
              <Code variant="soft">Mode: {alignment}</Code>
              <Code variant="soft">Tool: {theme}</Code>
              <Code variant="soft">Style: {direction}</Code>
            </Flex>
          </Box>
        </Flex>

        <Separator />

        {/* Test 5: Indicator Animation */}
        <Flex direction="column" gap="6">
          <Box>
            <Box mb="3">
              <Heading size="6" weight="medium">5. Indicator Animation</Heading>
            </Box>
            <Text size="2" emphasis="medium">
              The sliding indicator works correctly with equal-width icon-only items
            </Text>
          </Box>
          
          <Flex gap="5" wrap="wrap">
            <SegmentedControl.Root defaultValue="1" size="3">
              <SegmentedControl.Item value="1" iconOnly aria-label="Option 1">
                <Text size="3" weight="semibold">1</Text>
              </SegmentedControl.Item>
              <SegmentedControl.Item value="2" iconOnly aria-label="Option 2">
                <Text size="3" weight="semibold">2</Text>
              </SegmentedControl.Item>
              <SegmentedControl.Item value="3" iconOnly aria-label="Option 3">
                <Text size="3" weight="semibold">3</Text>
              </SegmentedControl.Item>
              <SegmentedControl.Item value="4" iconOnly aria-label="Option 4">
                <Text size="3" weight="semibold">4</Text>
              </SegmentedControl.Item>
              <SegmentedControl.Item value="5" iconOnly aria-label="Option 5">
                <Text size="3" weight="semibold">5</Text>
              </SegmentedControl.Item>
            </SegmentedControl.Root>
          </Flex>

          <Box p="5" style={{ background: 'var(--neutral-a2)', borderRadius: 'var(--radius-3)' }}>
            <Text size="2" emphasis="medium">
              Click different segments to see the smooth sliding animation
            </Text>
          </Box>
        </Flex>

        <Separator />

        {/* Test 6: Full Width Icon-Only */}
        <Flex direction="column" gap="6">
          <Box>
            <Box mb="3">
              <Heading size="6" weight="medium">6. Full Width Icon-Only</Heading>
            </Box>
            <Text size="2" emphasis="medium">
              Icon-only items grow to fill available space while keeping icons centered
            </Text>
          </Box>
          
          <Flex direction="column" gap="5">
            <Box>
              <Box mb="3">
                <Text size="2" weight="medium">Narrow container (default)</Text>
              </Box>
              <SegmentedControl.Root defaultValue="list" size="2">
                <SegmentedControl.Item value="list" iconOnly aria-label="List view">
                  <HugeiconsIcon icon={Menu01Icon} strokeWidth={1.75} />
                </SegmentedControl.Item>
                <SegmentedControl.Item value="grid" iconOnly aria-label="Grid view">
                  <HugeiconsIcon icon={Grid02Icon} strokeWidth={1.75} />
                </SegmentedControl.Item>
                <SegmentedControl.Item value="board" iconOnly aria-label="Board view">
                  <HugeiconsIcon icon={LayoutIcon} strokeWidth={1.75} />
                </SegmentedControl.Item>
              </SegmentedControl.Root>
            </Box>

            <Box>
              <Box mb="3">
                <Text size="2" weight="medium">Full width container</Text>
              </Box>
              <Box style={{ width: '100%' }}>
                <SegmentedControl.Root defaultValue="list" size="2" style={{ width: '100%' }}>
                  <SegmentedControl.Item value="list" iconOnly aria-label="List view">
                    <HugeiconsIcon icon={Menu01Icon} strokeWidth={1.75} />
                  </SegmentedControl.Item>
                  <SegmentedControl.Item value="grid" iconOnly aria-label="Grid view">
                    <HugeiconsIcon icon={Grid02Icon} strokeWidth={1.75} />
                  </SegmentedControl.Item>
                  <SegmentedControl.Item value="board" iconOnly aria-label="Board view">
                    <HugeiconsIcon icon={LayoutIcon} strokeWidth={1.75} />
                  </SegmentedControl.Item>
                </SegmentedControl.Root>
              </Box>
            </Box>

            <Box>
              <Box mb="3">
                <Text size="2" weight="medium">Wide container with 2 items</Text>
              </Box>
              <Box style={{ width: '400px', maxWidth: '100%' }}>
                <SegmentedControl.Root defaultValue="light" size="3" style={{ width: '100%' }}>
                  <SegmentedControl.Item value="light" iconOnly aria-label="Light mode">
                    <HugeiconsIcon icon={Search01Icon} strokeWidth={1.75} />
                  </SegmentedControl.Item>
                  <SegmentedControl.Item value="dark" iconOnly aria-label="Dark mode">
                    <HugeiconsIcon icon={Copy01Icon} strokeWidth={1.75} />
                  </SegmentedControl.Item>
                </SegmentedControl.Root>
              </Box>
            </Box>
          </Flex>

          <Box p="5" style={{ background: 'var(--neutral-a2)', borderRadius: 'var(--radius-3)' }}>
            <Text size="2" emphasis="medium">
              Items maintain minimum square dimensions but grow equally to fill container. Icons stay perfectly centered using <Code variant="soft">minmax(height, 1fr)</Code> grid columns.
            </Text>
          </Box>
        </Flex>

        <Separator />

        {/* Test 7: Vertical Orientation - Icon-Only (Recommended) */}
        <Flex direction="column" gap="6">
          <Box>
            <Box mb="3">
              <Heading size="6" weight="medium">7. Vertical Orientation - Icon-Only (Recommended)</Heading>
            </Box>
            <Text size="2" emphasis="medium">
              Vertical orientation works best with icon-only segments for compact toolbars and sidebars
            </Text>
          </Box>
          
          <Flex gap="7" wrap="wrap" align="start">
            <Box>
              <Box mb="3">
                <Text size="2" weight="medium">Size 1</Text>
              </Box>
              <SegmentedControl.Root orientation="vertical" size="1" defaultValue="code">
                <SegmentedControl.Item value="code" iconOnly aria-label="Code view">
                  <HugeiconsIcon icon={CodeIcon} strokeWidth={1.75} />
                </SegmentedControl.Item>
                <SegmentedControl.Item value="layout" iconOnly aria-label="Layout view">
                  <HugeiconsIcon icon={LayoutIcon} strokeWidth={1.75} />
                </SegmentedControl.Item>
                <SegmentedControl.Item value="layers" iconOnly aria-label="Layers view">
                  <HugeiconsIcon icon={Layers01Icon} strokeWidth={1.75} />
                </SegmentedControl.Item>
              </SegmentedControl.Root>
            </Box>

            <Box>
              <Box mb="3">
                <Text size="2" weight="medium">Size 2</Text>
              </Box>
              <SegmentedControl.Root orientation="vertical" size="2" defaultValue="code">
                <SegmentedControl.Item value="code" iconOnly aria-label="Code view">
                  <HugeiconsIcon icon={CodeIcon} strokeWidth={1.75} />
                </SegmentedControl.Item>
                <SegmentedControl.Item value="layout" iconOnly aria-label="Layout view">
                  <HugeiconsIcon icon={LayoutIcon} strokeWidth={1.75} />
                </SegmentedControl.Item>
                <SegmentedControl.Item value="layers" iconOnly aria-label="Layers view">
                  <HugeiconsIcon icon={Layers01Icon} strokeWidth={1.75} />
                </SegmentedControl.Item>
              </SegmentedControl.Root>
            </Box>

            <Box>
              <Box mb="3">
                <Text size="2" weight="medium">Size 3</Text>
              </Box>
              <SegmentedControl.Root orientation="vertical" size="3" value={verticalView} onValueChange={setVerticalView}>
                <SegmentedControl.Item value="code" iconOnly aria-label="Code view">
                  <HugeiconsIcon icon={CodeIcon} strokeWidth={1.75} />
                </SegmentedControl.Item>
                <SegmentedControl.Item value="layout" iconOnly aria-label="Layout view">
                  <HugeiconsIcon icon={LayoutIcon} strokeWidth={1.75} />
                </SegmentedControl.Item>
                <SegmentedControl.Item value="layers" iconOnly aria-label="Layers view">
                  <HugeiconsIcon icon={Layers01Icon} strokeWidth={1.75} />
                </SegmentedControl.Item>
                <SegmentedControl.Item value="settings" iconOnly aria-label="Settings">
                  <HugeiconsIcon icon={Settings01Icon} strokeWidth={1.75} />
                </SegmentedControl.Item>
              </SegmentedControl.Root>
            </Box>

            <Box>
              <Box mb="3">
                <Text size="2" weight="medium">Size 4</Text>
              </Box>
              <SegmentedControl.Root orientation="vertical" size="4" defaultValue="code">
                <SegmentedControl.Item value="code" iconOnly aria-label="Code view">
                  <HugeiconsIcon icon={CodeIcon} strokeWidth={1.75} />
                </SegmentedControl.Item>
                <SegmentedControl.Item value="layout" iconOnly aria-label="Layout view">
                  <HugeiconsIcon icon={LayoutIcon} strokeWidth={1.75} />
                </SegmentedControl.Item>
                <SegmentedControl.Item value="layers" iconOnly aria-label="Layers view">
                  <HugeiconsIcon icon={Layers01Icon} strokeWidth={1.75} />
                </SegmentedControl.Item>
              </SegmentedControl.Root>
            </Box>
          </Flex>

          <Box p="5" style={{ background: 'var(--neutral-a2)', borderRadius: 'var(--radius-3)' }}>
            <Text size="2" emphasis="medium">
              Selected: <Code variant="soft">{verticalView}</Code> - Perfect for sidebar tools and compact interfaces
            </Text>
          </Box>
        </Flex>

        <Separator />

        {/* Test 8: Vertical vs Horizontal Comparison */}
        <Flex direction="column" gap="6">
          <Box>
            <Box mb="3">
              <Heading size="6" weight="medium">8. Orientation Comparison</Heading>
            </Box>
            <Text size="2" emphasis="medium">
              Same control in both orientations
            </Text>
          </Box>
          
          <Flex gap="7" wrap="wrap" align="start">
            <Box>
              <Box mb="3">
                <Text size="2" weight="medium">Horizontal (default)</Text>
              </Box>
              <SegmentedControl.Root size="3" value={verticalTool} onValueChange={setVerticalTool}>
                <SegmentedControl.Item value="search" iconOnly aria-label="Search">
                  <HugeiconsIcon icon={Search01Icon} strokeWidth={1.75} />
                </SegmentedControl.Item>
                <SegmentedControl.Item value="copy" iconOnly aria-label="Copy">
                  <HugeiconsIcon icon={Copy01Icon} strokeWidth={1.75} />
                </SegmentedControl.Item>
                <SegmentedControl.Item value="download" iconOnly aria-label="Download">
                  <HugeiconsIcon icon={Download01Icon} strokeWidth={1.75} />
                </SegmentedControl.Item>
              </SegmentedControl.Root>
            </Box>

            <Box>
              <Box mb="3">
                <Text size="2" weight="medium">Vertical</Text>
              </Box>
              <SegmentedControl.Root orientation="vertical" size="3" value={verticalTool} onValueChange={setVerticalTool}>
                <SegmentedControl.Item value="search" iconOnly aria-label="Search">
                  <HugeiconsIcon icon={Search01Icon} strokeWidth={1.75} />
                </SegmentedControl.Item>
                <SegmentedControl.Item value="copy" iconOnly aria-label="Copy">
                  <HugeiconsIcon icon={Copy01Icon} strokeWidth={1.75} />
                </SegmentedControl.Item>
                <SegmentedControl.Item value="download" iconOnly aria-label="Download">
                  <HugeiconsIcon icon={Download01Icon} strokeWidth={1.75} />
                </SegmentedControl.Item>
              </SegmentedControl.Root>
            </Box>
          </Flex>

          <Box p="5" style={{ background: 'var(--neutral-a2)', borderRadius: 'var(--radius-3)' }}>
            <Text size="2" emphasis="medium">
              Both controls are synced: <Code variant="soft">{verticalTool}</Code>
            </Text>
          </Box>
        </Flex>

        <Separator />

        {/* Test 9: Vertical with Text (Less Ideal) */}
        <Flex direction="column" gap="6">
          <Box>
            <Box mb="3">
              <Heading size="6" weight="medium">9. Vertical with Text (Less Ideal)</Heading>
            </Box>
            <Text size="2" emphasis="medium">
              Text labels work but are less recommended. Best with very short labels.
            </Text>
          </Box>
          
          <Flex gap="7" wrap="wrap" align="start">
            <Box>
              <Box mb="3">
                <Text size="2" weight="medium">Short labels (OK)</Text>
              </Box>
              <SegmentedControl.Root orientation="vertical" size="2" value={verticalText} onValueChange={setVerticalText}>
                <SegmentedControl.Item value="day">Day</SegmentedControl.Item>
                <SegmentedControl.Item value="week">Week</SegmentedControl.Item>
                <SegmentedControl.Item value="month">Month</SegmentedControl.Item>
              </SegmentedControl.Root>
            </Box>

            <Box>
              <Box mb="3">
                <Text size="2" weight="medium">With icons (Better)</Text>
              </Box>
              <SegmentedControl.Root orientation="vertical" size="3" defaultValue="list">
                <SegmentedControl.Item value="list">
                  <HugeiconsIcon icon={Menu01Icon} strokeWidth={1.75} />
                  List
                </SegmentedControl.Item>
                <SegmentedControl.Item value="grid">
                  <HugeiconsIcon icon={Grid02Icon} strokeWidth={1.75} />
                  Grid
                </SegmentedControl.Item>
                <SegmentedControl.Item value="board">
                  <HugeiconsIcon icon={LayoutIcon} strokeWidth={1.75} />
                  Board
                </SegmentedControl.Item>
              </SegmentedControl.Root>
            </Box>
          </Flex>

          <Box p="5" style={{ background: 'var(--orange-a2)', borderRadius: 'var(--radius-3)' }}>
            <Text size="2" color="orange">
              ⚠️ For longer text labels, prefer horizontal orientation or consider using Radio Group or Tabs
            </Text>
          </Box>
        </Flex>

        <Separator />

        {/* Test 10: Real-World Vertical Use Cases */}
        <Flex direction="column" gap="6">
          <Box>
            <Box mb="3">
              <Heading size="6" weight="medium">10. Real-World Vertical Use Cases</Heading>
            </Box>
            <Text size="2" emphasis="medium">
              Common patterns for vertical segmented controls
            </Text>
          </Box>
          
          <Flex gap="7" wrap="wrap" align="start">
            <Box>
              <Box mb="3">
                <Text size="2" weight="medium">Sidebar Tool Palette</Text>
              </Box>
              <SegmentedControl.Root orientation="vertical" size="2" defaultValue="colors">
                <SegmentedControl.Item value="colors" iconOnly aria-label="Colors">
                  <HugeiconsIcon icon={ColorsIcon} strokeWidth={1.75} />
                </SegmentedControl.Item>
                <SegmentedControl.Item value="swatch" iconOnly aria-label="Swatch">
                  <HugeiconsIcon icon={SwatchIcon} strokeWidth={1.75} />
                </SegmentedControl.Item>
                <SegmentedControl.Item value="layout" iconOnly aria-label="Layout">
                  <HugeiconsIcon icon={LayoutBottomIcon} strokeWidth={1.75} />
                </SegmentedControl.Item>
                <SegmentedControl.Item value="grid" iconOnly aria-label="Grid">
                  <HugeiconsIcon icon={Grid02Icon} strokeWidth={1.75} />
                </SegmentedControl.Item>
              </SegmentedControl.Root>
            </Box>

            <Box>
              <Box mb="3">
                <Text size="2" weight="medium">Compact Navigation</Text>
              </Box>
              <SegmentedControl.Root orientation="vertical" size="3" defaultValue="code">
                <SegmentedControl.Item value="code" iconOnly aria-label="Code">
                  <HugeiconsIcon icon={CodeIcon} strokeWidth={1.75} />
                </SegmentedControl.Item>
                <SegmentedControl.Item value="layers" iconOnly aria-label="Layers">
                  <HugeiconsIcon icon={Layers01Icon} strokeWidth={1.75} />
                </SegmentedControl.Item>
                <SegmentedControl.Item value="settings" iconOnly aria-label="Settings">
                  <HugeiconsIcon icon={Settings01Icon} strokeWidth={1.75} />
                </SegmentedControl.Item>
              </SegmentedControl.Root>
            </Box>

            <Box>
              <Box mb="3">
                <Text size="2" weight="medium">View Switcher</Text>
              </Box>
              <SegmentedControl.Root orientation="vertical" size="2" defaultValue="list">
                <SegmentedControl.Item value="list" iconOnly aria-label="List view">
                  <HugeiconsIcon icon={Menu01Icon} strokeWidth={1.75} />
                </SegmentedControl.Item>
                <SegmentedControl.Item value="grid" iconOnly aria-label="Grid view">
                  <HugeiconsIcon icon={Grid02Icon} strokeWidth={1.75} />
                </SegmentedControl.Item>
                <SegmentedControl.Item value="board" iconOnly aria-label="Board view">
                  <HugeiconsIcon icon={LayoutIcon} strokeWidth={1.75} />
                </SegmentedControl.Item>
              </SegmentedControl.Root>
            </Box>
          </Flex>

          <Box p="5" style={{ background: 'var(--neutral-a2)', borderRadius: 'var(--radius-3)' }}>
            <Text size="2" emphasis="medium">
              Vertical icon-only controls are perfect for sidebars, tool palettes, and compact navigation rails
            </Text>
          </Box>
        </Flex>

        <Separator />

        {/* Test 11: Vertical Indicator Animation */}
        <Flex direction="column" gap="6">
          <Box>
            <Box mb="3">
              <Heading size="6" weight="medium">11. Vertical Indicator Animation</Heading>
            </Box>
            <Text size="2" emphasis="medium">
              The sliding indicator animates smoothly in vertical orientation
            </Text>
          </Box>
          
          <Flex gap="7" wrap="wrap" align="start">
            <SegmentedControl.Root orientation="vertical" size="3" defaultValue="1">
              <SegmentedControl.Item value="1" iconOnly aria-label="Option 1">
                <Text size="3" weight="semibold">1</Text>
              </SegmentedControl.Item>
              <SegmentedControl.Item value="2" iconOnly aria-label="Option 2">
                <Text size="3" weight="semibold">2</Text>
              </SegmentedControl.Item>
              <SegmentedControl.Item value="3" iconOnly aria-label="Option 3">
                <Text size="3" weight="semibold">3</Text>
              </SegmentedControl.Item>
              <SegmentedControl.Item value="4" iconOnly aria-label="Option 4">
                <Text size="3" weight="semibold">4</Text>
              </SegmentedControl.Item>
              <SegmentedControl.Item value="5" iconOnly aria-label="Option 5">
                <Text size="3" weight="semibold">5</Text>
              </SegmentedControl.Item>
            </SegmentedControl.Root>

            <SegmentedControl.Root orientation="vertical" size="2" defaultValue="a">
              <SegmentedControl.Item value="a" iconOnly aria-label="Option A">
                <Text size="2" weight="semibold">A</Text>
              </SegmentedControl.Item>
              <SegmentedControl.Item value="b" iconOnly aria-label="Option B">
                <Text size="2" weight="semibold">B</Text>
              </SegmentedControl.Item>
              <SegmentedControl.Item value="c" iconOnly aria-label="Option C">
                <Text size="2" weight="semibold">C</Text>
              </SegmentedControl.Item>
            </SegmentedControl.Root>
          </Flex>

          <Box p="5" style={{ background: 'var(--neutral-a2)', borderRadius: 'var(--radius-3)' }}>
            <Text size="2" emphasis="medium">
              Click different segments to see the smooth vertical sliding animation with spring physics
            </Text>
          </Box>
        </Flex>
      </Flex>
    </Box>
  );
}

