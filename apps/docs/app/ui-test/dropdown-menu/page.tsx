'use client';

import * as React from 'react';
import { DropdownMenu, ContextMenu, Button, Card, Flex, Box, Text, Heading, Slider, VirtualMenu, type VirtualMenuRenderItemProps } from '@kushagradhawan/kookie-ui';

// Custom item component for variable height example
type VariableHeightItem = { id: string; type: 'header' | 'item'; label: string };

const VariableHeightMenuItem = React.memo(function VariableHeightMenuItem({
  item,
  style,
  ...props
}: VirtualMenuRenderItemProps<VariableHeightItem>) {
  const isHeader = item.type === 'header';
  return (
    <VirtualMenu.Item
      {...props}
      style={{
        ...style,
        height: isHeader ? 48 : 36,
      }}
    >
      <span
        style={{
          fontWeight: isHeader ? 600 : 400,
          fontSize: isHeader ? 11 : 14,
          color: isHeader ? 'var(--gray-11)' : undefined,
          textTransform: isHeader ? 'uppercase' : undefined,
          letterSpacing: isHeader ? '0.05em' : undefined,
        }}
      >
        {item.label}
      </span>
    </VirtualMenu.Item>
  );
});

export default function DropdownMenuTest() {
  const [collisionPadding, setCollisionPadding] = React.useState(10);
  const [sideOffset, setSideOffset] = React.useState(1);
  const [alignOffset, setAlignOffset] = React.useState(0);
  const [lastSelected, setLastSelected] = React.useState('');

  const groupedDrilldownTree = (
    <>
      <DropdownMenu.Label>Actions</DropdownMenu.Label>
      <DropdownMenu.Group>
        <DropdownMenu.Item>New File</DropdownMenu.Item>
        <DropdownMenu.Item>New Folder</DropdownMenu.Item>
      </DropdownMenu.Group>

      <DropdownMenu.Separator />

      <DropdownMenu.Label>Navigate</DropdownMenu.Label>
      <DropdownMenu.Group>
        <DropdownMenu.Item>Go to File</DropdownMenu.Item>
        <DropdownMenu.Sub label="Recent Files">
          <DropdownMenu.SubTrigger>Recent Files</DropdownMenu.SubTrigger>
          <DropdownMenu.SubContent>
            <DropdownMenu.Item>document.tsx</DropdownMenu.Item>
            <DropdownMenu.Item>styles.css</DropdownMenu.Item>
            <DropdownMenu.Item>index.ts</DropdownMenu.Item>
            <DropdownMenu.Separator />
            <DropdownMenu.Sub label="By Type">
              <DropdownMenu.SubTrigger>By Type</DropdownMenu.SubTrigger>
              <DropdownMenu.SubContent>
                <DropdownMenu.Item>TypeScript</DropdownMenu.Item>
                <DropdownMenu.Item>CSS</DropdownMenu.Item>
                <DropdownMenu.Item>JSON</DropdownMenu.Item>
              </DropdownMenu.SubContent>
            </DropdownMenu.Sub>
          </DropdownMenu.SubContent>
        </DropdownMenu.Sub>
      </DropdownMenu.Group>

      <DropdownMenu.Separator />

      <DropdownMenu.Label>Settings</DropdownMenu.Label>
      <DropdownMenu.Group>
        <DropdownMenu.Sub label="Preferences">
          <DropdownMenu.SubTrigger>Preferences</DropdownMenu.SubTrigger>
          <DropdownMenu.SubContent>
            <DropdownMenu.Item>Theme</DropdownMenu.Item>
            <DropdownMenu.Item>Font Size</DropdownMenu.Item>
            <DropdownMenu.Item>Keybindings</DropdownMenu.Item>
          </DropdownMenu.SubContent>
        </DropdownMenu.Sub>
        <DropdownMenu.Item>Extensions</DropdownMenu.Item>
      </DropdownMenu.Group>
    </>
  );

  return (
    <Box p="6" style={{ minHeight: '100vh' }}>
      <Heading size="6" mb="4">Dropdown Menu - Nested SubMenus Test</Heading>

      <Text as="p" size="2" color="gray" mb="6">
        Test collision behavior with deeply nested submenus. Resize window to mobile width to see the drill-down behavior.
      </Text>

      {/* Virtualized Menu Test */}
      <Box mb="6" p="4" style={{ background: 'var(--cyan-3)', borderRadius: 'var(--radius-3)', border: '2px solid var(--cyan-6)' }}>
        <Heading size="4" mb="2" color="cyan">⚡ Virtualized Menu (1000 items)</Heading>
        <Text as="p" size="2" color="gray" mb="4">
          Testing VirtualMenu inside DropdownMenu.Content with virtualized prop.
          Only ~15 DOM nodes rendered at any time. Use arrow keys to navigate.
        </Text>
        <DropdownMenu.Root>
          <DropdownMenu.Trigger>
            <Button variant="soft" color="cyan">Open Large Menu</Button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Content virtualized style={{ minWidth: 220, padding: 0 }}>
            <VirtualMenu
              items={Array.from({ length: 1000 }, (_, i) => ({
                id: String(i),
                label: `Item ${i + 1}`
              }))}
              itemLabel={(item) => item.label}
              onSelect={(item) => setLastSelected(item.label)}
              style={{ height: 300 }}
            />
          </DropdownMenu.Content>
        </DropdownMenu.Root>
        <Text as="p" size="1" color="gray" mt="2">
          Open DevTools → Elements → search for &quot;rt-VirtualMenuItem&quot; → only ~15 elements rendered.
        </Text>
      </Box>

      {/* Non-Virtualized Menu (for comparison) */}
      <Box mb="6" p="4" style={{ background: 'var(--amber-3)', borderRadius: 'var(--radius-3)', border: '2px solid var(--amber-6)' }}>
        <Heading size="4" mb="2" color="amber">🐌 Non-Virtualized Menu (200 items)</Heading>
        <Text as="p" size="2" color="gray" mb="4">
          Standard DropdownMenu.Item elements without virtualization. Compare styling with the virtualized version above.
          All 200 DOM nodes are rendered immediately.
        </Text>
        <DropdownMenu.Root>
          <DropdownMenu.Trigger>
            <Button variant="soft" color="amber">Open Standard Menu</Button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Content style={{ minWidth: 220, maxHeight: 300, overflowY: 'auto' }}>
            {Array.from({ length: 200 }, (_, i) => (
              <DropdownMenu.Item key={i} onSelect={() => setLastSelected(`Item ${i + 1}`)}>
                Item {i + 1}
              </DropdownMenu.Item>
            ))}
          </DropdownMenu.Content>
        </DropdownMenu.Root>
        <Text as="p" size="1" color="gray" mt="2">
          Open DevTools → Elements → search for &quot;rt-DropdownMenuItem&quot; → all 200 elements rendered.
        </Text>
      </Box>

      {/* Virtualized Menu with Variable Heights */}
      <Box mb="6" p="4" style={{ background: 'var(--teal-3)', borderRadius: 'var(--radius-3)', border: '2px solid var(--teal-6)' }}>
        <Heading size="4" mb="2" color="teal">⚡ Variable Height Items</Heading>
        <Text as="p" size="2" color="gray" mb="4">
          Testing VirtualMenu with mixed item heights (headers = 48px, items = 36px).
        </Text>
        <DropdownMenu.Root>
          <DropdownMenu.Trigger>
            <Button variant="soft" color="teal">Open Variable Height Menu</Button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Content virtualized style={{ minWidth: 250, padding: 0 }}>
            <VirtualMenu
              items={Array.from({ length: 100 }, (_, i) => ({
                id: String(i),
                type: (i % 10 === 0 ? 'header' : 'item') as 'header' | 'item',
                label: i % 10 === 0 ? `Section ${Math.floor(i / 10) + 1}` : `Item ${i + 1}`
              }))}
              renderItem={VariableHeightMenuItem}
              estimatedItemSize={(index) => index % 10 === 0 ? 48 : 36}
              onSelect={(item) => setLastSelected(item.label)}
              style={{ height: 300 }}
            />
          </DropdownMenu.Content>
        </DropdownMenu.Root>
        <Text as="p" size="1" color="gray" mt="2">
          Headers are taller (48px) than regular items (36px).
        </Text>
      </Box>

      {/* Drill-Down with Groups - Variants */}
      <Box
        mb="6"
        p="4"
        style={{
          background: 'var(--purple-3)',
          borderRadius: 'var(--radius-3)',
          border: '2px solid var(--purple-6)',
        }}
      >
        <Heading size="4" mb="2" color="purple">🧪 Drill-Down with Groups (Variants)</Heading>
        <Text as="p" size="2" color="gray" mb="4">
          Same grouped drill-down tree rendered with different <code>variant</code>/<code>color</code> props.
        </Text>

        <Flex gap="3" wrap="wrap" align="center">
          <DropdownMenu.Root>
            <DropdownMenu.Trigger>
              <Button variant="soft" color="purple">Soft (purple)</Button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Content
              submenuBehavior="drill-down"
              variant="soft"
              color="purple"
              style={{ minWidth: 240 }}
            >
              {groupedDrilldownTree}
            </DropdownMenu.Content>
          </DropdownMenu.Root>

          <DropdownMenu.Root>
            <DropdownMenu.Trigger>
              <Button variant="solid" color="indigo">Solid (indigo)</Button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Content
              submenuBehavior="drill-down"
              variant="solid"
              color="indigo"
              style={{ minWidth: 240 }}
            >
              {groupedDrilldownTree}
            </DropdownMenu.Content>
          </DropdownMenu.Root>

          <DropdownMenu.Root>
            <DropdownMenu.Trigger>
              <Button variant="outline" color="gray">High Contrast</Button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Content
              submenuBehavior="drill-down"
              variant="soft"
              color="gray"
              highContrast
              style={{ minWidth: 240 }}
            >
              {groupedDrilldownTree}
            </DropdownMenu.Content>
          </DropdownMenu.Root>
        </Flex>

        <Text as="p" size="1" color="gray" mt="2">
          Test: open any menu → click “Recent Files” / “Preferences” → previous items should fully disappear (no sandwiching).
        </Text>
      </Box>

      {/* Drill-Down with Groups (Regression Test) */}
      <Box mb="6" p="4" style={{ background: 'var(--purple-3)', borderRadius: 'var(--radius-3)', border: '2px solid var(--purple-6)' }}>
        <Heading size="4" mb="2" color="purple">🧪 Drill-Down with Groups</Heading>
        <Text as="p" size="2" color="gray" mb="4">
          Testing drill-down submenus inside <code>DropdownMenu.Group</code> - verifies nested panels work correctly.
        </Text>
        <DropdownMenu.Root>
          <DropdownMenu.Trigger>
            <Button variant="soft" color="purple">Menu with Groups</Button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Content submenuBehavior="drill-down" style={{ minWidth: 220 }}>
            {groupedDrilldownTree}
          </DropdownMenu.Content>
        </DropdownMenu.Root>
        <Text as="p" size="1" color="gray" mt="2">
          If submenus don't show when clicked, the CSS fix for groups is not working.
        </Text>
      </Box>

      {/* Native Drill-Down Pattern */}
      <Box mb="6" p="4" style={{ background: 'var(--green-3)', borderRadius: 'var(--radius-3)', border: '2px solid var(--green-6)' }}>
        <Heading size="4" mb="2" color="green">✅ Native Drill-Down Mode</Heading>
        <Text as="p" size="2" color="gray" mb="4">
          Using <code>submenuBehavior="drill-down"</code> - submenus replace content inline with a back button.
        </Text>
        <DropdownMenu.Root>
          <DropdownMenu.Trigger>
            <Button variant="soft" color="green">Drill-Down Menu</Button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Content submenuBehavior="drill-down" style={{ minWidth: 220 }}>
            <DropdownMenu.Item>Home</DropdownMenu.Item>
            <DropdownMenu.Item>Profile</DropdownMenu.Item>
            <DropdownMenu.Separator />

            <DropdownMenu.Sub label="Settings">
              <DropdownMenu.SubTrigger>Settings</DropdownMenu.SubTrigger>
              <DropdownMenu.SubContent>
                <DropdownMenu.Item>General</DropdownMenu.Item>
                <DropdownMenu.Item>Notifications</DropdownMenu.Item>
                <DropdownMenu.Separator />

                <DropdownMenu.Sub label="Privacy">
                  <DropdownMenu.SubTrigger>Privacy</DropdownMenu.SubTrigger>
                  <DropdownMenu.SubContent>
                    <DropdownMenu.Item>Profile visibility</DropdownMenu.Item>
                    <DropdownMenu.Item>Blocked users</DropdownMenu.Item>
                    <DropdownMenu.Separator />

                    <DropdownMenu.Sub label="Data & Storage">
                      <DropdownMenu.SubTrigger>Data & Storage</DropdownMenu.SubTrigger>
                      <DropdownMenu.SubContent>
                        <DropdownMenu.Item>Download my data</DropdownMenu.Item>
                        <DropdownMenu.Item>Clear cache</DropdownMenu.Item>
                        <DropdownMenu.Item color="red">Delete account</DropdownMenu.Item>
                      </DropdownMenu.SubContent>
                    </DropdownMenu.Sub>
                  </DropdownMenu.SubContent>
                </DropdownMenu.Sub>
              </DropdownMenu.SubContent>
            </DropdownMenu.Sub>

            <DropdownMenu.Separator />
            <DropdownMenu.Item color="red">Logout</DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Root>
      </Box>

      {/* Responsive Pattern */}
      <Box mb="6" p="4" style={{ background: 'var(--blue-3)', borderRadius: 'var(--radius-3)', border: '2px solid var(--blue-6)' }}>
        <Heading size="4" mb="2" color="blue">📱 Responsive Mode</Heading>
        <Text as="p" size="2" color="gray" mb="4">
          Using <code>{'submenuBehavior={{ initial: "drill-down", md: "cascade" }}'}</code> - drill-down on mobile, cascade on desktop.
        </Text>
        <DropdownMenu.Root>
          <DropdownMenu.Trigger>
            <Button variant="soft" color="blue">Responsive Menu</Button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Content
            submenuBehavior={{ initial: 'drill-down', md: 'cascade' }}
            style={{ minWidth: 220 }}
          >
            <DropdownMenu.Item>Dashboard</DropdownMenu.Item>
            <DropdownMenu.Item>Projects</DropdownMenu.Item>
            <DropdownMenu.Separator />

            <DropdownMenu.Sub label="Account">
              <DropdownMenu.SubTrigger>Account</DropdownMenu.SubTrigger>
              <DropdownMenu.SubContent>
                <DropdownMenu.Item>Profile</DropdownMenu.Item>
                <DropdownMenu.Item>Billing</DropdownMenu.Item>
                <DropdownMenu.Separator />

                <DropdownMenu.Sub label="Security">
                  <DropdownMenu.SubTrigger>Security</DropdownMenu.SubTrigger>
                  <DropdownMenu.SubContent>
                    <DropdownMenu.Item>Change password</DropdownMenu.Item>
                    <DropdownMenu.Item>Two-factor auth</DropdownMenu.Item>
                    <DropdownMenu.Item>Sessions</DropdownMenu.Item>
                  </DropdownMenu.SubContent>
                </DropdownMenu.Sub>
              </DropdownMenu.SubContent>
            </DropdownMenu.Sub>

            <DropdownMenu.Sub label="Team">
              <DropdownMenu.SubTrigger>Team</DropdownMenu.SubTrigger>
              <DropdownMenu.SubContent>
                <DropdownMenu.Item>Members</DropdownMenu.Item>
                <DropdownMenu.Item>Invite</DropdownMenu.Item>
                <DropdownMenu.Item>Permissions</DropdownMenu.Item>
              </DropdownMenu.SubContent>
            </DropdownMenu.Sub>

            <DropdownMenu.Separator />
            <DropdownMenu.Item>Sign out</DropdownMenu.Item>
          </DropdownMenu.Content>
        </DropdownMenu.Root>
        <Text as="p" size="1" color="gray" mt="2">
          Resize browser below 1024px to see drill-down behavior.
        </Text>
      </Box>

      {/* Cascade Mode (Default) */}
      <Box mb="6" p="4" style={{ background: 'var(--orange-3)', borderRadius: 'var(--radius-3)', border: '2px solid var(--orange-6)' }}>
        <Heading size="4" mb="2" color="orange">⚡ Cascade Mode (Default)</Heading>
        <Text as="p" size="2" color="gray" mb="4">
          Default behavior with <code>submenuBehavior="cascade"</code> - submenus open as floating portals.
        </Text>
        <DropdownMenu.Root>
          <DropdownMenu.Trigger>
            <Button variant="soft" color="orange">Cascade Menu</Button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Content submenuBehavior="cascade">
            <DropdownMenu.Item>Item 1</DropdownMenu.Item>
            <DropdownMenu.Item>Item 2</DropdownMenu.Item>
            <DropdownMenu.Separator />

            <DropdownMenu.Sub>
              <DropdownMenu.SubTrigger>Level 1</DropdownMenu.SubTrigger>
              <DropdownMenu.SubContent>
                <DropdownMenu.Item>L1 Item 1</DropdownMenu.Item>
                <DropdownMenu.Item>L1 Item 2</DropdownMenu.Item>
                <DropdownMenu.Separator />

                <DropdownMenu.Sub>
                  <DropdownMenu.SubTrigger>Level 2</DropdownMenu.SubTrigger>
                  <DropdownMenu.SubContent>
                    <DropdownMenu.Item>L2 Item 1</DropdownMenu.Item>
                    <DropdownMenu.Item>L2 Item 2</DropdownMenu.Item>
                    <DropdownMenu.Separator />

                    <DropdownMenu.Sub>
                      <DropdownMenu.SubTrigger>Level 3</DropdownMenu.SubTrigger>
                      <DropdownMenu.SubContent>
                        <DropdownMenu.Item>L3 Item 1</DropdownMenu.Item>
                        <DropdownMenu.Item>L3 Item 2</DropdownMenu.Item>
                      </DropdownMenu.SubContent>
                    </DropdownMenu.Sub>
                  </DropdownMenu.SubContent>
                </DropdownMenu.Sub>
              </DropdownMenu.SubContent>
            </DropdownMenu.Sub>
          </DropdownMenu.Content>
        </DropdownMenu.Root>
        <Text as="p" size="1" color="gray" mt="2">
          On mobile widths, this may overflow the viewport horizontally.
        </Text>
      </Box>

      {/* Controls for cascade testing */}
      <Box mb="6" p="4" style={{ background: 'var(--gray-2)', borderRadius: 'var(--radius-3)' }}>
        <Heading size="3" mb="4">SubContent Props (for cascade mode)</Heading>

        <Flex direction="column" gap="4">
          <Box>
            <Text size="2" mb="2" as="div">collisionPadding: {collisionPadding}px</Text>
            <Slider
              value={[collisionPadding]}
              onValueChange={(v) => setCollisionPadding(v[0])}
              min={0}
              max={50}
              step={5}
            />
          </Box>

          <Box>
            <Text size="2" mb="2" as="div">sideOffset: {sideOffset}px</Text>
            <Slider
              value={[sideOffset]}
              onValueChange={(v) => setSideOffset(v[0])}
              min={0}
              max={20}
              step={1}
            />
          </Box>

          <Box>
            <Text size="2" mb="2" as="div">alignOffset: {alignOffset}px</Text>
            <Slider
              value={[alignOffset]}
              onValueChange={(v) => setAlignOffset(v[0])}
              min={-20}
              max={20}
              step={1}
            />
          </Box>
        </Flex>
      </Box>

      {/* Position testing with cascade */}
      <Flex gap="4" wrap="wrap" mb="6">
        {/* Left-positioned menu */}
        <Box p="4" style={{ background: 'var(--gray-2)', borderRadius: 'var(--radius-3)', flex: 1, minWidth: 200 }}>
          <Text size="2" weight="bold" mb="3" as="div">Left Edge (cascade)</Text>
          <DropdownMenu.Root>
            <DropdownMenu.Trigger>
              <Button variant="soft">Open Menu</Button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Content>
              <DropdownMenu.Item>Item 1</DropdownMenu.Item>
              <DropdownMenu.Separator />

              <DropdownMenu.Sub>
                <DropdownMenu.SubTrigger>Submenu</DropdownMenu.SubTrigger>
                <DropdownMenu.SubContent
                  collisionPadding={collisionPadding}
                  sideOffset={sideOffset}
                  alignOffset={alignOffset}
                >
                  <DropdownMenu.Item>Sub Item 1</DropdownMenu.Item>
                  <DropdownMenu.Item>Sub Item 2</DropdownMenu.Item>

                  <DropdownMenu.Sub>
                    <DropdownMenu.SubTrigger>Nested</DropdownMenu.SubTrigger>
                    <DropdownMenu.SubContent
                      collisionPadding={collisionPadding}
                      sideOffset={sideOffset}
                      alignOffset={alignOffset}
                    >
                      <DropdownMenu.Item>Nested 1</DropdownMenu.Item>
                      <DropdownMenu.Item>Nested 2</DropdownMenu.Item>
                    </DropdownMenu.SubContent>
                  </DropdownMenu.Sub>
                </DropdownMenu.SubContent>
              </DropdownMenu.Sub>
            </DropdownMenu.Content>
          </DropdownMenu.Root>
        </Box>

        {/* Right-positioned menu */}
        <Box p="4" style={{ background: 'var(--gray-2)', borderRadius: 'var(--radius-3)', flex: 1, minWidth: 200 }}>
          <Text size="2" weight="bold" mb="3" as="div">Right Edge (cascade)</Text>
          <Flex justify="end">
            <DropdownMenu.Root>
              <DropdownMenu.Trigger>
                <Button variant="soft">Open Menu</Button>
              </DropdownMenu.Trigger>
              <DropdownMenu.Content align="end">
                <DropdownMenu.Item>Item 1</DropdownMenu.Item>
                <DropdownMenu.Separator />

                <DropdownMenu.Sub>
                  <DropdownMenu.SubTrigger>Submenu</DropdownMenu.SubTrigger>
                  <DropdownMenu.SubContent
                    collisionPadding={collisionPadding}
                    sideOffset={sideOffset}
                    alignOffset={alignOffset}
                  >
                    <DropdownMenu.Item>Sub Item 1</DropdownMenu.Item>
                    <DropdownMenu.Item>Sub Item 2</DropdownMenu.Item>

                    <DropdownMenu.Sub>
                      <DropdownMenu.SubTrigger>Nested</DropdownMenu.SubTrigger>
                      <DropdownMenu.SubContent
                        collisionPadding={collisionPadding}
                        sideOffset={sideOffset}
                        alignOffset={alignOffset}
                      >
                        <DropdownMenu.Item>Nested 1</DropdownMenu.Item>
                        <DropdownMenu.Item>Nested 2</DropdownMenu.Item>
                      </DropdownMenu.SubContent>
                    </DropdownMenu.Sub>
                  </DropdownMenu.SubContent>
                </DropdownMenu.Sub>
              </DropdownMenu.Content>
            </DropdownMenu.Root>
          </Flex>
        </Box>
      </Flex>

      <Text as="p" size="2" color="gray" mb="6">
        Last selected: {lastSelected || 'nothing yet'}
      </Text>

      <DrillDownRegressionChecks />
      <ContextMenuChecks />

      {/* Info Box */}
      <Box p="4" style={{ background: 'var(--gray-3)', borderRadius: 'var(--radius-3)' }}>
        <Heading size="3" mb="2">API Reference</Heading>
        <Text as="div" size="2" mb="2">
          <strong>submenuBehavior</strong> prop on <code>DropdownMenu.Content</code>:
        </Text>
        <Box pl="4" mb="3">
          <Text as="div" size="2" mb="1">
            • <code>"cascade"</code> (default) - Submenus open as floating portals to the side
          </Text>
          <Text as="div" size="2" mb="1">
            • <code>"drill-down"</code> - Submenus replace content inline with back navigation
          </Text>
          <Text as="div" size="2">
            • <code>{'{ initial: "drill-down", md: "cascade" }'}</code> - Responsive behavior
          </Text>
        </Box>
        <Text as="div" size="2" mb="2">
          <strong>label</strong> prop on <code>DropdownMenu.Sub</code>:
        </Text>
        <Box pl="4">
          <Text as="div" size="2">
            • Sets the text shown in the back button (defaults to "Back")
          </Text>
        </Box>
      </Box>
    </Box>
  );
}

/**
 * Manual checks for the drill-down rework. Each row names what to verify.
 */
function DrillDownRegressionChecks() {
  const [shareOpen, setShareOpen] = React.useState(false);
  const [format, setFormat] = React.useState('png');

  return (
    <Box mb="6" p="4" style={{ background: 'var(--amber-3)', borderRadius: 'var(--radius-3)', border: '2px solid var(--amber-6)' }}>
      <Heading size="4" mb="2" color="amber">Drill-Down Regression Checks</Heading>
      <Flex direction="column" gap="2" mb="4">
        <Text size="2">1. Keyboard: open with Enter, ArrowDown to "Share", ArrowRight opens it with focus on "Email".</Text>
        <Text size="2">2. ArrowLeft or Escape goes back one level and focuses "Share". Escape at the root closes.</Text>
        <Text size="2">3. Typeahead "e" inside "Share" lands on "Email", never a hidden root item.</Text>
        <Text size="2">4. "Export" sits inside a RadioGroup and still opens. "Archive" is disabled and never opens.</Text>
        <Text size="2">5. Scroll down, open "Long list", go back: the scroll position returns. Close and reopen: the menu starts at the root.</Text>
        <Text size="2">6. The external button opens "Share" through the controlled Sub open prop.</Text>
      </Flex>
      <Flex gap="3" align="center" wrap="wrap">
        <DropdownMenu.Root>
          <DropdownMenu.Trigger>
            <Button variant="soft" color="amber">Drill-down checks</Button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Content submenuBehavior="drill-down" size={{ initial: '1', md: '2' }} style={{ minWidth: 240, maxHeight: 320 }}>
            <DropdownMenu.Item shortcut="⌘ E">Edit</DropdownMenu.Item>
            <DropdownMenu.Item shortcut="⌘ D">Duplicate</DropdownMenu.Item>
            <DropdownMenu.Sub label="Share" open={shareOpen} onOpenChange={setShareOpen}>
              <DropdownMenu.SubTrigger>Share</DropdownMenu.SubTrigger>
              <DropdownMenu.SubContent>
                <DropdownMenu.Item>Email</DropdownMenu.Item>
                <DropdownMenu.Item>Messages</DropdownMenu.Item>
                <DropdownMenu.Sub label="More">
                  <DropdownMenu.SubTrigger>More</DropdownMenu.SubTrigger>
                  <DropdownMenu.SubContent>
                    <DropdownMenu.Item>Notes</DropdownMenu.Item>
                    <DropdownMenu.Item>Reminders</DropdownMenu.Item>
                  </DropdownMenu.SubContent>
                </DropdownMenu.Sub>
              </DropdownMenu.SubContent>
            </DropdownMenu.Sub>
            <DropdownMenu.Separator />
            <DropdownMenu.RadioGroup value={format} onValueChange={setFormat}>
              <DropdownMenu.RadioItem value="png">PNG</DropdownMenu.RadioItem>
              <DropdownMenu.RadioItem value="svg">SVG</DropdownMenu.RadioItem>
              <DropdownMenu.Sub label="Export">
                <DropdownMenu.SubTrigger>Export</DropdownMenu.SubTrigger>
                <DropdownMenu.SubContent>
                  <DropdownMenu.Item>Current page</DropdownMenu.Item>
                  <DropdownMenu.Item>All pages</DropdownMenu.Item>
                </DropdownMenu.SubContent>
              </DropdownMenu.Sub>
            </DropdownMenu.RadioGroup>
            <DropdownMenu.Sub>
              <DropdownMenu.SubTrigger disabled>Archive</DropdownMenu.SubTrigger>
              <DropdownMenu.SubContent>
                <DropdownMenu.Item>Never shown</DropdownMenu.Item>
              </DropdownMenu.SubContent>
            </DropdownMenu.Sub>
            <DropdownMenu.Separator />
            {Array.from({ length: 12 }, (_, i) => (
              <DropdownMenu.Item key={i}>Filler {i + 1}</DropdownMenu.Item>
            ))}
            <DropdownMenu.Sub label="Long list">
              <DropdownMenu.SubTrigger>Long list</DropdownMenu.SubTrigger>
              <DropdownMenu.SubContent>
                {Array.from({ length: 20 }, (_, i) => (
                  <DropdownMenu.Item key={i}>Entry {i + 1}</DropdownMenu.Item>
                ))}
              </DropdownMenu.SubContent>
            </DropdownMenu.Sub>
          </DropdownMenu.Content>
        </DropdownMenu.Root>
        <Button variant="soft" color="gray" highContrast onClick={() => setShareOpen((open) => !open)}>
          Toggle Share (controlled): {shareOpen ? 'open' : 'closed'}
        </Button>
      </Flex>
    </Box>
  );
}

/**
 * Manual checks for ContextMenu: responsive size, submenu alignment and virtualization.
 */
function ContextMenuChecks() {
  const [picked, setPicked] = React.useState('');

  return (
    <Box mb="6" p="4" style={{ background: 'var(--iris-3)', borderRadius: 'var(--radius-3)', border: '2px solid var(--iris-6)' }}>
      <Heading size="4" mb="2" color="iris">ContextMenu Checks</Heading>
      <Flex direction="column" gap="2" mb="4">
        <Text size="2">1. The menu opens at the pointer with its first item on the pointer, at every width (responsive size).</Text>
        <Text size="2">2. "Arrange" opens with its first item level with the trigger.</Text>
        <Text size="2">3. The virtualized list scrolls once, with one menu role.</Text>
      </Flex>
      <Flex gap="3" wrap="wrap">
        <ContextMenu.Root>
          <ContextMenu.Trigger>
            <Card variant="classic" size="2">
              <Text size="2">Right-click: responsive size</Text>
            </Card>
          </ContextMenu.Trigger>
          <ContextMenu.Content size={{ initial: '2', md: '1' }}>
            <ContextMenu.Item shortcut="⌘ C">Copy</ContextMenu.Item>
            <ContextMenu.Item shortcut="⌘ V" disabled>
              Paste
            </ContextMenu.Item>
            <ContextMenu.Sub>
              <ContextMenu.SubTrigger>Arrange</ContextMenu.SubTrigger>
              <ContextMenu.SubContent>
                <ContextMenu.Item>Bring forward</ContextMenu.Item>
                <ContextMenu.Item>Send backward</ContextMenu.Item>
              </ContextMenu.SubContent>
            </ContextMenu.Sub>
          </ContextMenu.Content>
        </ContextMenu.Root>
        <ContextMenu.Root>
          <ContextMenu.Trigger>
            <Card variant="classic" size="2">
              <Text size="2">Right-click: virtualized {picked && `(${picked})`}</Text>
            </Card>
          </ContextMenu.Trigger>
          <ContextMenu.Content virtualized size="1">
            <VirtualMenu
              items={Array.from({ length: 300 }, (_, i) => ({ id: String(i), label: `Layer ${i + 1}` }))}
              itemLabel={(item) => item.label}
              onSelect={(item) => setPicked(item.label)}
              style={{ height: 200, width: 180 }}
            />
          </ContextMenu.Content>
        </ContextMenu.Root>
      </Flex>
    </Box>
  );
}
