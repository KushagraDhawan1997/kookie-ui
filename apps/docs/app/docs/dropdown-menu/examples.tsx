'use client';

import * as React from 'react';
import { PreviewBlock, CodeBlock, SectionHeader } from '@kushagradhawan/kookie-blocks';
import {
  Flex,
  Button,
  Text,
  Separator,
  Card,
  DropdownMenu,
  Avatar,
  IconButton,
  VirtualMenu,
  type VirtualMenuRenderItemProps,
} from '@kushagradhawan/kookie-ui';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  MoreHorizontalIcon,
  Copy01Icon,
  Delete01Icon,
  PencilEdit01Icon,
  Share01Icon,
  Download01Icon,
  Settings01Icon,
  UserIcon,
  CreditCardIcon,
  Logout01Icon,
  Add01Icon,
  CheckmarkCircle01Icon,
  Moon02Icon,
  Sun01Icon,
  ComputerIcon,
  ArrowRight01Icon,
  FilterIcon,
  Search01Icon,
} from '@hugeicons/core-free-icons';

// Custom item component for virtualized user list
type User = { id: string; name: string; email: string; avatar?: string };

const UserMenuItem = React.memo(function UserMenuItem({
  item,
  style,
  isHighlighted: _isHighlighted,
  ...props
}: VirtualMenuRenderItemProps<User>) {
  return (
    <VirtualMenu.Item {...props} style={style}>
      <Flex gap="3" align="center" width="100%">
        <Avatar
          size="1"
          fallback={item.name.charAt(0)}
          src={item.avatar}
        />
        <Flex direction="column" gap="0">
          <Text size="2" weight="medium">{item.name}</Text>
          <Text size="1" color="gray">{item.email}</Text>
        </Flex>
      </Flex>
    </VirtualMenu.Item>
  );
});

export function DropdownMenuExamples() {
  const [bookmarksEnabled, setBookmarksEnabled] = React.useState(true);
  const [fullUrlsEnabled, setFullUrlsEnabled] = React.useState(false);
  const [theme, setTheme] = React.useState('system');
  const [selectedUser, setSelectedUser] = React.useState<User | null>(null);

  // Generate mock user data for virtualized example
  const users = React.useMemo(() => {
    const firstNames = ['Emma', 'Liam', 'Olivia', 'Noah', 'Ava', 'Ethan', 'Sophia', 'Mason', 'Isabella', 'William'];
    const lastNames = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez'];
    return Array.from({ length: 500 }, (_, i) => ({
      id: String(i),
      name: `${firstNames[i % firstNames.length]} ${lastNames[Math.floor(i / 10) % lastNames.length]}`,
      email: `user${i + 1}@example.com`,
    }));
  }, []);

  return (
    <Flex direction="column" gap="9">
      {/* Example 1: Basic Actions Menu */}
      <Flex direction="column" gap="4">
        <SectionHeader.Root>
          <SectionHeader.Content>
            <SectionHeader.Title>Basic Actions</SectionHeader.Title>
            <SectionHeader.Description>
              A contextual menu for common item actions. The destructive action uses color="red" to signal danger, and a separator visually isolates it from safe actions.
            </SectionHeader.Description>
          </SectionHeader.Content>
        </SectionHeader.Root>
        <PreviewBlock background="none" height="20rem">
          <Card variant="classic" size="2" style={{ width: 320 }}>
            <Flex justify="between" align="center" p="2">
              <Flex gap="3" align="center">
                <Avatar fallback="D" size="2" color="blue" />
                <Flex direction="column" gap="0">
                  <Text size="2" weight="medium">Design System</Text>
                  <Text size="1" color="gray">Updated 2 days ago</Text>
                </Flex>
              </Flex>
              <DropdownMenu.Root>
                <DropdownMenu.Trigger>
                  <IconButton
                    variant="ghost"
                    size="2"
                    color="gray"
                    aria-label="More options"
                  >
                    <HugeiconsIcon icon={MoreHorizontalIcon} strokeWidth={1.75} />
                  </IconButton>
                </DropdownMenu.Trigger>
                <DropdownMenu.Content>
                  <DropdownMenu.Item>
                    <HugeiconsIcon icon={PencilEdit01Icon} strokeWidth={1.75} />
                    Edit
                  </DropdownMenu.Item>
                  <DropdownMenu.Item>
                    <HugeiconsIcon icon={Copy01Icon} strokeWidth={1.75} />
                    Duplicate
                  </DropdownMenu.Item>
                  <DropdownMenu.Item>
                    <HugeiconsIcon icon={Share01Icon} strokeWidth={1.75} />
                    Share
                  </DropdownMenu.Item>
                  <DropdownMenu.Separator />
                  <DropdownMenu.Item color="red">
                    <HugeiconsIcon icon={Delete01Icon} strokeWidth={1.75} />
                    Delete
                  </DropdownMenu.Item>
                </DropdownMenu.Content>
              </DropdownMenu.Root>
            </Flex>
          </Card>
        </PreviewBlock>
        <CodeBlock
          code={`<DropdownMenu.Root>
  <DropdownMenu.Trigger>
    <IconButton
      variant="ghost"
      size="2"
      color="gray"
      aria-label="More options"
    >
      <HugeiconsIcon icon={MoreHorizontalIcon} strokeWidth={1.75} />
    </IconButton>
  </DropdownMenu.Trigger>
  <DropdownMenu.Content>
    <DropdownMenu.Item>
      <HugeiconsIcon icon={PencilEdit01Icon} strokeWidth={1.75} />
      Edit
    </DropdownMenu.Item>
    <DropdownMenu.Item>
      <HugeiconsIcon icon={Copy01Icon} strokeWidth={1.75} />
      Duplicate
    </DropdownMenu.Item>
    <DropdownMenu.Item>
      <HugeiconsIcon icon={Share01Icon} strokeWidth={1.75} />
      Share
    </DropdownMenu.Item>
    <DropdownMenu.Separator />
    <DropdownMenu.Item color="red">
      <HugeiconsIcon icon={Delete01Icon} strokeWidth={1.75} />
      Delete
    </DropdownMenu.Item>
  </DropdownMenu.Content>
</DropdownMenu.Root>`}
          language="tsx"
          showLineNumbers={true}
          collapsible={false}
        />
      </Flex>

      <Separator size="4" />

      {/* Example 2: User Account Menu */}
      <Flex direction="column" gap="4">
        <SectionHeader.Root>
          <SectionHeader.Content>
            <SectionHeader.Title>User Account</SectionHeader.Title>
            <SectionHeader.Description>
              A profile menu with user info header and grouped navigation. Labels and groups organize related items, while shortcuts show keyboard accelerators.
            </SectionHeader.Description>
          </SectionHeader.Content>
        </SectionHeader.Root>
        <PreviewBlock background="none" height="24rem">
          <DropdownMenu.Root>
            <DropdownMenu.Trigger>
              <Button variant="soft" size="2" color="gray" highContrast>
                <Avatar fallback="JD" size="1" />
                John Doe
              </Button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Content style={{ minWidth: 220 }}>
              <DropdownMenu.Label>john@example.com</DropdownMenu.Label>
              <DropdownMenu.Separator />
              <DropdownMenu.Group>
                <DropdownMenu.Item shortcut="⌘P">
                  <HugeiconsIcon icon={UserIcon} strokeWidth={1.75} />
                  Profile
                </DropdownMenu.Item>
                <DropdownMenu.Item shortcut="⌘B">
                  <HugeiconsIcon icon={CreditCardIcon} strokeWidth={1.75} />
                  Billing
                </DropdownMenu.Item>
                <DropdownMenu.Item shortcut="⌘,">
                  <HugeiconsIcon icon={Settings01Icon} strokeWidth={1.75} />
                  Settings
                </DropdownMenu.Item>
              </DropdownMenu.Group>
              <DropdownMenu.Separator />
              <DropdownMenu.Item>
                <HugeiconsIcon icon={Logout01Icon} strokeWidth={1.75} />
                Sign out
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Root>
        </PreviewBlock>
        <CodeBlock
          code={`<DropdownMenu.Root>
  <DropdownMenu.Trigger>
    <Button variant="soft" size="2" color="gray" highContrast>
      <Avatar fallback="JD" size="1" />
      John Doe
    </Button>
  </DropdownMenu.Trigger>
  <DropdownMenu.Content style={{ minWidth: 220 }}>
    <DropdownMenu.Label>john@example.com</DropdownMenu.Label>
    <DropdownMenu.Separator />
    <DropdownMenu.Group>
      <DropdownMenu.Item shortcut="⌘P">
        <HugeiconsIcon icon={UserIcon} strokeWidth={1.75} />
        Profile
      </DropdownMenu.Item>
      <DropdownMenu.Item shortcut="⌘B">
        <HugeiconsIcon icon={CreditCardIcon} strokeWidth={1.75} />
        Billing
      </DropdownMenu.Item>
      <DropdownMenu.Item shortcut="⌘,">
        <HugeiconsIcon icon={Settings01Icon} strokeWidth={1.75} />
        Settings
      </DropdownMenu.Item>
    </DropdownMenu.Group>
    <DropdownMenu.Separator />
    <DropdownMenu.Item>
      <HugeiconsIcon icon={Logout01Icon} strokeWidth={1.75} />
      Sign out
    </DropdownMenu.Item>
  </DropdownMenu.Content>
</DropdownMenu.Root>`}
          language="tsx"
          showLineNumbers={true}
          collapsible={false}
        />
      </Flex>

      <Separator size="4" />

      {/* Example 3: Settings with Checkboxes and Radio */}
      <Flex direction="column" gap="4">
        <SectionHeader.Root>
          <SectionHeader.Content>
            <SectionHeader.Title>Settings Menu</SectionHeader.Title>
            <SectionHeader.Description>
              Checkbox items for toggleable settings and radio groups for mutually exclusive options. Use RadioGroup for single-selection choices like theme preference.
            </SectionHeader.Description>
          </SectionHeader.Content>
        </SectionHeader.Root>
        <PreviewBlock background="none" height="24rem">
          <DropdownMenu.Root>
            <DropdownMenu.Trigger>
              <Button variant="soft" size="2" color="gray" highContrast>
                <HugeiconsIcon icon={Settings01Icon} strokeWidth={1.75} />
                Preferences
              </Button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Content style={{ minWidth: 200 }}>
              <DropdownMenu.Label>Display</DropdownMenu.Label>
              <DropdownMenu.CheckboxItem
                checked={bookmarksEnabled}
                onCheckedChange={setBookmarksEnabled}
              >
                Show Bookmarks
              </DropdownMenu.CheckboxItem>
              <DropdownMenu.CheckboxItem
                checked={fullUrlsEnabled}
                onCheckedChange={setFullUrlsEnabled}
              >
                Show Full URLs
              </DropdownMenu.CheckboxItem>
              <DropdownMenu.Separator />
              <DropdownMenu.Label>Theme</DropdownMenu.Label>
              <DropdownMenu.RadioGroup value={theme} onValueChange={setTheme}>
                <DropdownMenu.RadioItem value="light">
                  <HugeiconsIcon icon={Sun01Icon} strokeWidth={1.75} />
                  Light
                </DropdownMenu.RadioItem>
                <DropdownMenu.RadioItem value="dark">
                  <HugeiconsIcon icon={Moon02Icon} strokeWidth={1.75} />
                  Dark
                </DropdownMenu.RadioItem>
                <DropdownMenu.RadioItem value="system">
                  <HugeiconsIcon icon={ComputerIcon} strokeWidth={1.75} />
                  System
                </DropdownMenu.RadioItem>
              </DropdownMenu.RadioGroup>
            </DropdownMenu.Content>
          </DropdownMenu.Root>
        </PreviewBlock>
        <CodeBlock
          code={`const [bookmarksEnabled, setBookmarksEnabled] = React.useState(true);
const [fullUrlsEnabled, setFullUrlsEnabled] = React.useState(false);
const [theme, setTheme] = React.useState('system');

<DropdownMenu.Root>
  <DropdownMenu.Trigger>
    <Button variant="soft" size="2" color="gray" highContrast>
      <HugeiconsIcon icon={Settings01Icon} strokeWidth={1.75} />
      Preferences
    </Button>
  </DropdownMenu.Trigger>
  <DropdownMenu.Content style={{ minWidth: 200 }}>
    <DropdownMenu.Label>Display</DropdownMenu.Label>
    <DropdownMenu.CheckboxItem
      checked={bookmarksEnabled}
      onCheckedChange={setBookmarksEnabled}
    >
      Show Bookmarks
    </DropdownMenu.CheckboxItem>
    <DropdownMenu.CheckboxItem
      checked={fullUrlsEnabled}
      onCheckedChange={setFullUrlsEnabled}
    >
      Show Full URLs
    </DropdownMenu.CheckboxItem>
    <DropdownMenu.Separator />
    <DropdownMenu.Label>Theme</DropdownMenu.Label>
    <DropdownMenu.RadioGroup value={theme} onValueChange={setTheme}>
      <DropdownMenu.RadioItem value="light">
        <HugeiconsIcon icon={Sun01Icon} strokeWidth={1.75} />
        Light
      </DropdownMenu.RadioItem>
      <DropdownMenu.RadioItem value="dark">
        <HugeiconsIcon icon={Moon02Icon} strokeWidth={1.75} />
        Dark
      </DropdownMenu.RadioItem>
      <DropdownMenu.RadioItem value="system">
        <HugeiconsIcon icon={ComputerIcon} strokeWidth={1.75} />
        System
      </DropdownMenu.RadioItem>
    </DropdownMenu.RadioGroup>
  </DropdownMenu.Content>
</DropdownMenu.Root>`}
          language="tsx"
          showLineNumbers={true}
          collapsible={false}
        />
      </Flex>

      <Separator size="4" />

      {/* Example 4: Drill-Down Navigation */}
      <Flex direction="column" gap="4">
        <SectionHeader.Root>
          <SectionHeader.Content>
            <SectionHeader.Title>Drill-Down Navigation</SectionHeader.Title>
            <SectionHeader.Description>
              Mobile-friendly navigation with submenuBehavior="drill-down". Submenus replace the content with a back button instead of opening floating panels - ideal for touch interfaces and deep hierarchies.
            </SectionHeader.Description>
          </SectionHeader.Content>
        </SectionHeader.Root>
        <PreviewBlock background="none" height="24rem">
          <DropdownMenu.Root>
            <DropdownMenu.Trigger>
              <Button variant="soft" size="2" color="gray" highContrast>
                <HugeiconsIcon icon={Settings01Icon} strokeWidth={1.75} />
                Settings
              </Button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Content
              submenuBehavior="drill-down"
              style={{ minWidth: 220 }}
            >
              <DropdownMenu.Item>
                <HugeiconsIcon icon={UserIcon} strokeWidth={1.75} />
                Profile
              </DropdownMenu.Item>
              <DropdownMenu.Separator />
              <DropdownMenu.Sub label="Account">
                <DropdownMenu.SubTrigger>
                  <HugeiconsIcon icon={Settings01Icon} strokeWidth={1.75} />
                  Account
                </DropdownMenu.SubTrigger>
                <DropdownMenu.SubContent>
                  <DropdownMenu.Item>General</DropdownMenu.Item>
                  <DropdownMenu.Item>Notifications</DropdownMenu.Item>
                  <DropdownMenu.Separator />
                  <DropdownMenu.Sub label="Privacy">
                    <DropdownMenu.SubTrigger>Privacy</DropdownMenu.SubTrigger>
                    <DropdownMenu.SubContent>
                      <DropdownMenu.Item>Profile visibility</DropdownMenu.Item>
                      <DropdownMenu.Item>Blocked users</DropdownMenu.Item>
                      <DropdownMenu.Item>Data export</DropdownMenu.Item>
                    </DropdownMenu.SubContent>
                  </DropdownMenu.Sub>
                </DropdownMenu.SubContent>
              </DropdownMenu.Sub>
              <DropdownMenu.Separator />
              <DropdownMenu.Item color="red">
                <HugeiconsIcon icon={Logout01Icon} strokeWidth={1.75} />
                Sign out
              </DropdownMenu.Item>
            </DropdownMenu.Content>
          </DropdownMenu.Root>
        </PreviewBlock>
        <CodeBlock
          code={`<DropdownMenu.Root>
  <DropdownMenu.Trigger>
    <Button variant="soft" size="2" color="gray" highContrast>
      <HugeiconsIcon icon={Settings01Icon} strokeWidth={1.75} />
      Settings
    </Button>
  </DropdownMenu.Trigger>
  <DropdownMenu.Content
    submenuBehavior="drill-down"
    style={{ minWidth: 220 }}
  >
    <DropdownMenu.Item>
      <HugeiconsIcon icon={UserIcon} strokeWidth={1.75} />
      Profile
    </DropdownMenu.Item>
    <DropdownMenu.Separator />
    <DropdownMenu.Sub label="Account">
      <DropdownMenu.SubTrigger>
        <HugeiconsIcon icon={Settings01Icon} strokeWidth={1.75} />
        Account
      </DropdownMenu.SubTrigger>
      <DropdownMenu.SubContent>
        <DropdownMenu.Item>General</DropdownMenu.Item>
        <DropdownMenu.Item>Notifications</DropdownMenu.Item>
        <DropdownMenu.Separator />
        <DropdownMenu.Sub label="Privacy">
          <DropdownMenu.SubTrigger>Privacy</DropdownMenu.SubTrigger>
          <DropdownMenu.SubContent>
            <DropdownMenu.Item>Profile visibility</DropdownMenu.Item>
            <DropdownMenu.Item>Blocked users</DropdownMenu.Item>
            <DropdownMenu.Item>Data export</DropdownMenu.Item>
          </DropdownMenu.SubContent>
        </DropdownMenu.Sub>
      </DropdownMenu.SubContent>
    </DropdownMenu.Sub>
    <DropdownMenu.Separator />
    <DropdownMenu.Item color="red">
      <HugeiconsIcon icon={Logout01Icon} strokeWidth={1.75} />
      Sign out
    </DropdownMenu.Item>
  </DropdownMenu.Content>
</DropdownMenu.Root>`}
          language="tsx"
          showLineNumbers={true}
          collapsible={false}
        />
      </Flex>

      <Separator size="4" />

      {/* Example 5: Responsive Submenu Behavior */}
      <Flex direction="column" gap="4">
        <SectionHeader.Root>
          <SectionHeader.Content>
            <SectionHeader.Title>Responsive Submenus</SectionHeader.Title>
            <SectionHeader.Description>
              Adaptive behavior with responsive submenuBehavior. Resize your browser below 1024px to see drill-down mode, or above for cascading submenus - the best of both worlds.
            </SectionHeader.Description>
          </SectionHeader.Content>
        </SectionHeader.Root>
        <PreviewBlock background="none" height="20rem">
          <DropdownMenu.Root>
            <DropdownMenu.Trigger>
              <Button variant="classic" size="2" highContrast>
                <HugeiconsIcon icon={Add01Icon} strokeWidth={1.75} />
                New
              </Button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Content
              submenuBehavior={{ initial: 'drill-down', md: 'cascade' }}
              style={{ minWidth: 200 }}
            >
              <DropdownMenu.Item shortcut="⌘N">
                New File
              </DropdownMenu.Item>
              <DropdownMenu.Item shortcut="⇧⌘N">
                New Folder
              </DropdownMenu.Item>
              <DropdownMenu.Separator />
              <DropdownMenu.Sub label="From Template">
                <DropdownMenu.SubTrigger>From Template</DropdownMenu.SubTrigger>
                <DropdownMenu.SubContent>
                  <DropdownMenu.Item>React Component</DropdownMenu.Item>
                  <DropdownMenu.Item>API Route</DropdownMenu.Item>
                  <DropdownMenu.Item>Test File</DropdownMenu.Item>
                  <DropdownMenu.Item>Storybook Story</DropdownMenu.Item>
                </DropdownMenu.SubContent>
              </DropdownMenu.Sub>
              <DropdownMenu.Sub label="Import">
                <DropdownMenu.SubTrigger>Import</DropdownMenu.SubTrigger>
                <DropdownMenu.SubContent>
                  <DropdownMenu.Item>From URL</DropdownMenu.Item>
                  <DropdownMenu.Item>From Clipboard</DropdownMenu.Item>
                  <DropdownMenu.Item>From File</DropdownMenu.Item>
                </DropdownMenu.SubContent>
              </DropdownMenu.Sub>
            </DropdownMenu.Content>
          </DropdownMenu.Root>
        </PreviewBlock>
        <CodeBlock
          code={`<DropdownMenu.Root>
  <DropdownMenu.Trigger>
    <Button variant="classic" size="2" highContrast>
      <HugeiconsIcon icon={Add01Icon} strokeWidth={1.75} />
      New
    </Button>
  </DropdownMenu.Trigger>
  <DropdownMenu.Content
    submenuBehavior={{ initial: 'drill-down', md: 'cascade' }}
    style={{ minWidth: 200 }}
  >
    <DropdownMenu.Item shortcut="⌘N">
      New File
    </DropdownMenu.Item>
    <DropdownMenu.Item shortcut="⇧⌘N">
      New Folder
    </DropdownMenu.Item>
    <DropdownMenu.Separator />
    <DropdownMenu.Sub label="From Template">
      <DropdownMenu.SubTrigger>From Template</DropdownMenu.SubTrigger>
      <DropdownMenu.SubContent>
        <DropdownMenu.Item>React Component</DropdownMenu.Item>
        <DropdownMenu.Item>API Route</DropdownMenu.Item>
        <DropdownMenu.Item>Test File</DropdownMenu.Item>
        <DropdownMenu.Item>Storybook Story</DropdownMenu.Item>
      </DropdownMenu.SubContent>
    </DropdownMenu.Sub>
    <DropdownMenu.Sub label="Import">
      <DropdownMenu.SubTrigger>Import</DropdownMenu.SubTrigger>
      <DropdownMenu.SubContent>
        <DropdownMenu.Item>From URL</DropdownMenu.Item>
        <DropdownMenu.Item>From Clipboard</DropdownMenu.Item>
        <DropdownMenu.Item>From File</DropdownMenu.Item>
      </DropdownMenu.SubContent>
    </DropdownMenu.Sub>
  </DropdownMenu.Content>
</DropdownMenu.Root>`}
          language="tsx"
          showLineNumbers={true}
          collapsible={false}
        />
      </Flex>

      <Separator size="4" />

      {/* Example 6: Virtualized Menu for Large Lists */}
      <Flex direction="column" gap="4">
        <SectionHeader.Root>
          <SectionHeader.Content>
            <SectionHeader.Title>Large Data Set (VirtualMenu)</SectionHeader.Title>
            <SectionHeader.Description>
              For menus with hundreds of items, use VirtualMenu inside DropdownMenu.Content with the virtualized prop. Only ~15 DOM nodes are rendered regardless of list size - perfect for user pickers, tag selectors, or any large dataset.
            </SectionHeader.Description>
          </SectionHeader.Content>
        </SectionHeader.Root>
        <PreviewBlock background="none" height="24rem">
          <Flex gap="3" align="center">
            <DropdownMenu.Root>
              <DropdownMenu.Trigger>
                <Button variant="soft" size="2" color="gray" highContrast>
                  <HugeiconsIcon icon={UserIcon} strokeWidth={1.75} />
                  {selectedUser ? selectedUser.name : 'Assign to...'}
                </Button>
              </DropdownMenu.Trigger>
              <DropdownMenu.Content virtualized style={{ minWidth: 280, padding: 0 }}>
                <VirtualMenu
                  items={users}
                  renderItem={UserMenuItem}
                  estimatedItemSize={48}
                  onSelect={(user) => setSelectedUser(user)}
                  style={{ height: 300 }}
                />
              </DropdownMenu.Content>
            </DropdownMenu.Root>
            {selectedUser && (
              <Text size="2" color="gray">
                Selected: {selectedUser.name}
              </Text>
            )}
          </Flex>
        </PreviewBlock>
        <CodeBlock
          code={`type User = { id: string; name: string; email: string; avatar?: string };

const UserMenuItem = React.memo(function UserMenuItem({
  item,
  style,
  isHighlighted: _isHighlighted, // Destructure to avoid passing to DOM
  ...props
}: VirtualMenuRenderItemProps<User>) {
  return (
    <VirtualMenu.Item {...props} style={style}>
      <Flex gap="3" align="center" width="100%">
        <Avatar size="1" fallback={item.name.charAt(0)} src={item.avatar} />
        <Flex direction="column" gap="0">
          <Text size="2" weight="medium">{item.name}</Text>
          <Text size="1" color="gray">{item.email}</Text>
        </Flex>
      </Flex>
    </VirtualMenu.Item>
  );
});

// In your component:
const [selectedUser, setSelectedUser] = React.useState<User | null>(null);

<DropdownMenu.Root>
  <DropdownMenu.Trigger>
    <Button variant="soft" size="2" color="gray" highContrast>
      <HugeiconsIcon icon={UserIcon} strokeWidth={1.75} />
      {selectedUser ? selectedUser.name : 'Assign to...'}
    </Button>
  </DropdownMenu.Trigger>
  <DropdownMenu.Content virtualized style={{ minWidth: 280, padding: 0 }}>
    <VirtualMenu
      items={users}           // 500+ items
      renderItem={UserMenuItem}
      estimatedItemSize={48}
      onSelect={(user) => setSelectedUser(user)}
      style={{ height: 300 }}
    />
  </DropdownMenu.Content>
</DropdownMenu.Root>`}
          language="tsx"
          showLineNumbers={true}
          collapsible={false}
        />
      </Flex>

      <Separator size="4" />

      {/* Example 7: Simple Virtualized List */}
      <Flex direction="column" gap="4">
        <SectionHeader.Root>
          <SectionHeader.Content>
            <SectionHeader.Title>Simple Virtualized List</SectionHeader.Title>
            <SectionHeader.Description>
              For basic text items, use itemLabel instead of a custom renderItem. The VirtualMenu handles rendering automatically while maintaining full keyboard navigation and accessibility.
            </SectionHeader.Description>
          </SectionHeader.Content>
        </SectionHeader.Root>
        <PreviewBlock background="none" height="20rem">
          <DropdownMenu.Root>
            <DropdownMenu.Trigger>
              <Button variant="soft" size="2" color="gray" highContrast>
                <HugeiconsIcon icon={FilterIcon} strokeWidth={1.75} />
                Select Country
              </Button>
            </DropdownMenu.Trigger>
            <DropdownMenu.Content virtualized style={{ minWidth: 200, padding: 0 }}>
              <VirtualMenu
                items={Array.from({ length: 200 }, (_, i) => ({
                  id: String(i),
                  label: `Country ${i + 1}`,
                }))}
                itemLabel={(item) => item.label}
                onSelect={(item) => console.log('Selected:', item.label)}
                style={{ height: 240 }}
              />
            </DropdownMenu.Content>
          </DropdownMenu.Root>
        </PreviewBlock>
        <CodeBlock
          code={`<DropdownMenu.Root>
  <DropdownMenu.Trigger>
    <Button variant="soft" size="2" color="gray" highContrast>
      <HugeiconsIcon icon={FilterIcon} strokeWidth={1.75} />
      Select Country
    </Button>
  </DropdownMenu.Trigger>
  <DropdownMenu.Content virtualized style={{ minWidth: 200, padding: 0 }}>
    <VirtualMenu
      items={countries}  // Array of { id, label }
      itemLabel={(item) => item.label}
      onSelect={(item) => console.log('Selected:', item.label)}
      style={{ height: 240 }}
    />
  </DropdownMenu.Content>
</DropdownMenu.Root>`}
          language="tsx"
          showLineNumbers={true}
          collapsible={false}
        />
      </Flex>
    </Flex>
  );
}
