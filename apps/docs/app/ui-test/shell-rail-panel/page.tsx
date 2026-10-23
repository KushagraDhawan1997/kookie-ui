'use client';

import * as React from 'react';
import { Shell, IconButton, Flex, Box, Text, Heading, DropdownMenu } from '@kushagradhawan/kookie-ui';
import { HugeiconsIcon } from '@hugeicons/react';
import { Menu01Icon, SidebarLeft01Icon, SidebarRight01Icon, MoreVerticalIcon } from '@hugeicons/core-free-icons';

export default function ShellRailPanelTest() {
  return (
    <Shell.Root height="100vh">
      {/* Rail: always open by default */}
      <Shell.Rail
        defaultOpen={true}
        expandedSize={64}
        presentation={{ initial: 'overlay', sm: 'fixed' }}
      >
        <Flex direction="column" gap="3" p="3" align="center">
          <IconButton variant="ghost" size="2" asChild>
            <Shell.Trigger target="rail">
              <HugeiconsIcon icon={Menu01Icon} size={18} />
            </Shell.Trigger>
          </IconButton>
          <IconButton variant="ghost" size="2" asChild>
            <Shell.Trigger target="panel">
              <HugeiconsIcon icon={SidebarLeft01Icon} size={18} />
            </Shell.Trigger>
          </IconButton>
          <Box style={{ flex: 1 }} />
          {/* Dropdown menu to test z-index layering in overlay mode */}
          <DropdownMenu.Root>
            <DropdownMenu.Trigger>
              <IconButton variant="ghost" size="2">
                <HugeiconsIcon icon={MoreVerticalIcon} size={18} />
              </IconButton>
            </DropdownMenu.Trigger>
            <DropdownMenu.Content>
              <DropdownMenu.Item>Settings</DropdownMenu.Item>
              <DropdownMenu.Item>Preferences</DropdownMenu.Item>
              <DropdownMenu.Separator />
              <DropdownMenu.Item color="red">Logout</DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Root>
          <Text size="1" emphasis="medium">Rail</Text>
        </Flex>
      </Shell.Rail>

      {/* Panel: responsive defaultOpen (closed on mobile, open on sm+) */}
      <Shell.Panel
        defaultOpen={{ initial: false, sm: true }}
        expandedSize={280}
        resizable
        minSize={200}
        maxSize={400}
      >
        <Flex direction="column" p="5" gap="5" style={{ height: '100%' }}>
          <Heading size="4">Panel</Heading>
          <Text size="2" emphasis="medium">
            This panel is closed by default on mobile (initial), but open on sm breakpoint and above.
          </Text>
          <Box style={{ flex: 1 }}>
            <Text size="2">Navigation items would go here...</Text>
          </Box>
          <Text size="1" emphasis="medium">
            Breakpoint: sm = 768px
          </Text>
        </Flex>
      </Shell.Panel>

      {/* Content */}
      <Shell.Content>
        <Box p="7">
          <Heading size="6" mb="5">Shell Rail + Panel Test</Heading>
          
          <Flex gap="4" mb="7" wrap="wrap">
            <IconButton variant="soft" size="3" asChild>
              <Shell.Trigger target="rail">
                <HugeiconsIcon icon={Menu01Icon} size={20} />
              </Shell.Trigger>
            </IconButton>
            <IconButton variant="soft" size="3" asChild>
              <Shell.Trigger target="panel">
                <HugeiconsIcon icon={SidebarLeft01Icon} size={20} />
              </Shell.Trigger>
            </IconButton>
          </Flex>

          <Box mb="7" p="5" style={{ background: 'var(--gray-2)', borderRadius: 'var(--radius-3)' }}>
            <Heading size="3" mb="3">Test Configuration</Heading>
            <Text as="div" size="2" mb="3">
              <strong>Rail:</strong> defaultOpen=true (always starts open)
            </Text>
            <Text as="div" size="2" mb="3">
              <strong>Panel:</strong> defaultOpen={`{{ initial: false, sm: true }}`}
            </Text>
            <Text as="div" size="2" mb="3">
              <strong>Rail presentation:</strong> {`{{ initial: 'overlay', sm: 'fixed' }}`}
            </Text>
            <Text as="div" size="2">
              <strong>Panel resizable:</strong> true (200px - 400px)
            </Text>
          </Box>

          <Box mb="7" p="5" style={{ background: 'var(--blue-2)', borderRadius: 'var(--radius-3)' }}>
            <Heading size="3" mb="3">Expected Behavior</Heading>
            <Text as="div" size="2" mb="3">
              • On mobile (initial): Rail open as overlay, Panel closed
            </Text>
            <Text as="div" size="2" mb="3">
              • On sm+ (≥768px): Rail open fixed, Panel open fixed
            </Text>
            <Text as="div" size="2" mb="3">
              • Closing Rail leaves Panel as it is (the panes are independent since 0.8.0)
            </Text>
            <Text as="div" size="2">
              • Panel can be resized by dragging the edge
            </Text>
          </Box>

          <Box p="5" style={{ background: 'var(--gray-3)', borderRadius: 'var(--radius-3)' }}>
            <Heading size="3" mb="3">Controls</Heading>
            <Text as="div" size="2" mb="4">
              Use the buttons above or in the Rail to toggle:
            </Text>
            <Flex gap="3" wrap="wrap">
              <IconButton variant="outline" asChild>
                <Shell.Trigger target="rail" action="expand">
                  <Text size="1">Expand Rail</Text>
                </Shell.Trigger>
              </IconButton>
              <IconButton variant="outline" asChild>
                <Shell.Trigger target="rail" action="collapse">
                  <Text size="1">Collapse Rail</Text>
                </Shell.Trigger>
              </IconButton>
              <IconButton variant="outline" asChild>
                <Shell.Trigger target="panel" action="expand">
                  <Text size="1">Expand Panel</Text>
                </Shell.Trigger>
              </IconButton>
              <IconButton variant="outline" asChild>
                <Shell.Trigger target="panel" action="collapse">
                  <Text size="1">Collapse Panel</Text>
                </Shell.Trigger>
              </IconButton>
            </Flex>
          </Box>
        </Box>
      </Shell.Content>
    </Shell.Root>
  );
}

