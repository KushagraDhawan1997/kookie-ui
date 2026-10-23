'use client';

import * as React from 'react';
import { Shell, Button, Flex, Box, Text, Heading, SegmentedControl } from '@kushagradhawan/kookie-ui';
import { HugeiconsIcon } from '@hugeicons/react';
import { Menu01Icon, SidebarLeft01Icon, Settings01Icon, GridViewIcon } from '@hugeicons/core-free-icons';

type InsetConfig = {
  sidebar: boolean;
  content: boolean;
  inspector: boolean;
  bottom: boolean;
};

export default function ShellInsetTest() {
  const [insetConfig, setInsetConfig] = React.useState<InsetConfig>({
    sidebar: true,
    content: true,
    inspector: true,
    bottom: false,
  });

  const toggleInset = (key: keyof InsetConfig) => {
    setInsetConfig((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  return (
    <Shell.Root height="100vh">
      {/* Sidebar with inset */}
      <Shell.Sidebar
        defaultState="expanded"
        expandedSize={280}
        presentation={{ initial: 'overlay', md: 'fixed' }}
        inset={insetConfig.sidebar}
      >
        <Flex direction="column" gap="5" p="5" style={{ height: '100%' }}>
          <Flex align="center" gap="3">
            <Button iconOnly aria-label="Toggle sidebar" variant="ghost" size="2" asChild>
              <Shell.Trigger target="sidebar">
                <HugeiconsIcon icon={Menu01Icon} size={18} />
              </Shell.Trigger>
            </Button>
            <Heading size="4">Sidebar</Heading>
          </Flex>
          
          <Text size="2" emphasis="medium">
            {insetConfig.sidebar ? '✓ Inset enabled' : '✗ Inset disabled'}
          </Text>
          
          <Flex direction="column" gap="3" style={{ flex: 1 }}>
            <Text size="2">Navigation items...</Text>
          </Flex>
        </Flex>
      </Shell.Sidebar>

      {/* Content with inset */}
      <Shell.Content inset={insetConfig.content}>
        <Box p="7" style={{ height: '100%' }}>
          <Box mb="5">
            <Heading size="6">Shell Inset Test</Heading>
          </Box>
          
          <Box mb="7">
            <Text size="2" emphasis="medium">
              The inset prop creates floating panes with a gray backdrop. Toggle each pane's inset below.
            </Text>
          </Box>

          {/* Inset Controls */}
          <Box mb="7" p="5" style={{ background: 'var(--gray-a3)', borderRadius: 'var(--radius-3)' }}>
            <Box mb="5">
              <Heading size="3">Inset Controls</Heading>
            </Box>
            <Flex gap="4" wrap="wrap">
              <Button
                variant={insetConfig.sidebar ? 'solid' : 'outline'}
                onClick={() => toggleInset('sidebar')}
              >
                Sidebar: {insetConfig.sidebar ? 'ON' : 'OFF'}
              </Button>
              <Button
                variant={insetConfig.content ? 'solid' : 'outline'}
                onClick={() => toggleInset('content')}
              >
                Content: {insetConfig.content ? 'ON' : 'OFF'}
              </Button>
              <Button
                variant={insetConfig.inspector ? 'solid' : 'outline'}
                onClick={() => toggleInset('inspector')}
              >
                Inspector: {insetConfig.inspector ? 'ON' : 'OFF'}
              </Button>
              <Button
                variant={insetConfig.bottom ? 'solid' : 'outline'}
                onClick={() => toggleInset('bottom')}
              >
                Bottom: {insetConfig.bottom ? 'ON' : 'OFF'}
              </Button>
            </Flex>
          </Box>

          {/* Pane Controls */}
          <Box mb="7" p="5" style={{ background: 'var(--blue-a3)', borderRadius: 'var(--radius-3)' }}>
            <Box mb="5">
              <Heading size="3">Pane Toggles</Heading>
            </Box>
            <Flex gap="4" wrap="wrap">
              <Button iconOnly aria-label="Toggle sidebar" variant="soft" size="3" asChild>
                <Shell.Trigger target="sidebar">
                  <HugeiconsIcon icon={SidebarLeft01Icon} size={20} />
                </Shell.Trigger>
              </Button>
              <Button iconOnly aria-label="Toggle inspector" variant="soft" size="3" asChild>
                <Shell.Trigger target="inspector">
                  <HugeiconsIcon icon={Settings01Icon} size={20} />
                </Shell.Trigger>
              </Button>
              <Button iconOnly aria-label="Toggle bottom" variant="soft" size="3" asChild>
                <Shell.Trigger target="bottom">
                  <HugeiconsIcon icon={GridViewIcon} size={20} />
                </Shell.Trigger>
              </Button>
            </Flex>
          </Box>

          {/* Current State */}
          <Box p="5" style={{ background: 'var(--gray-a3)', borderRadius: 'var(--radius-3)' }}>
            <Box mb="3">
              <Heading size="3">How Inset Works</Heading>
            </Box>
            <Box mb="3">
              <Text as="div" size="2">
                • The Shell root paints <code>var(--gray-2)</code> behind the middle row when any pane has inset
              </Text>
            </Box>
            <Box mb="3">
              <Text as="div" size="2">
                • Each inset pane gets a margin, rounded corners, a background and a shadow
              </Text>
            </Box>
            <Box mb="3">
              <Text as="div" size="2">
                • The backdrop is painted from the server HTML, before hydration
              </Text>
            </Box>
            <Text as="div" size="2">
              • Adjacent inset panes share one gap
            </Text>
          </Box>
        </Box>
      </Shell.Content>

      {/* Inspector with inset */}
      <Shell.Inspector
        defaultOpen={{ initial: false, lg: true }}
        expandedSize={300}
        presentation={{ initial: 'overlay', lg: 'fixed' }}
        inset={insetConfig.inspector}
      >
        <Flex direction="column" gap="5" p="5" style={{ height: '100%' }}>
          <Heading size="4">Inspector</Heading>
          <Text size="2" emphasis="medium">
            {insetConfig.inspector ? '✓ Inset enabled' : '✗ Inset disabled'}
          </Text>
          <Text size="2">Property panel content...</Text>
        </Flex>
      </Shell.Inspector>

      {/* Bottom with inset */}
      <Shell.Bottom
        defaultOpen={false}
        expandedSize={200}
        inset={insetConfig.bottom}
      >
        <Flex direction="column" gap="3" p="5" style={{ height: '100%' }}>
          <Heading size="4">Bottom Panel</Heading>
          <Text size="2" emphasis="medium">
            {insetConfig.bottom ? '✓ Inset enabled' : '✗ Inset disabled'}
          </Text>
          <Text size="2">Terminal / logs content...</Text>
        </Flex>
      </Shell.Bottom>
    </Shell.Root>
  );
}

