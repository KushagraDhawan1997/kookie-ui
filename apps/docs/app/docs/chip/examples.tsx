'use client';

import * as React from 'react';
import { PreviewBlock } from '@/components/blocks/preview-block/preview-block';
import { SectionHeader } from '@/components/blocks/section-header/section-header';
import { Flex, Chip, Text, Card, Avatar, Separator, Heading, Button } from '@kushagradhawan/kookie-ui';
import { HugeiconsIcon } from '@hugeicons/react';
import { CheckmarkCircle02Icon, Clock01Icon, Cancel01Icon, MoreHorizontalIcon } from '@hugeicons/core-free-icons';

export function ChipExamples() {
  return (
    <Flex direction="column" gap="10">
      {/* Example 1: Deployment Status */}
      <Flex direction="column" gap="5">
        <SectionHeader.Root>
          <SectionHeader.Content>
            <SectionHeader.Title>Deployment Status</SectionHeader.Title>
            <SectionHeader.Description>
              Use semantic colors to communicate status at a glance. Green for success, amber for pending, red for failures—users understand immediately without reading.
            </SectionHeader.Description>
          </SectionHeader.Content>
        </SectionHeader.Root>
        <PreviewBlock
          background="none"
          code={`<Card variant="raised" size="2">
  <Flex direction="column" gap="4">
    <Flex justify="between" align="center">
      <Flex gap="3" align="center">
        <HugeiconsIcon icon={CheckmarkCircle02Icon} strokeWidth={1.75} />
        <Text size="2">Production</Text>
      </Flex>
      <Chip color="green">Live</Chip>
    </Flex>
    <Separator />
    <Flex justify="between" align="center">
      <Flex gap="3" align="center">
        <HugeiconsIcon icon={Clock01Icon} strokeWidth={1.75} />
        <Text size="2">Staging</Text>
      </Flex>
      <Chip color="amber">Deploying</Chip>
    </Flex>
  </Flex>
</Card>`}
        >
          <Card variant="raised" size="2" style={{ minWidth: 360 }}>
            <Flex direction="column" gap="4">
              <Flex justify="between" align="center">
                <Flex gap="3" align="center">
                  <HugeiconsIcon icon={CheckmarkCircle02Icon} strokeWidth={1.75} style={{ width: 16, height: 16 }} />
                  <Text size="2">Production</Text>
                </Flex>
                <Chip color="green">Live</Chip>
              </Flex>
              <Separator />
              <Flex justify="between" align="center">
                <Flex gap="3" align="center">
                  <HugeiconsIcon icon={Clock01Icon} strokeWidth={1.75} style={{ width: 16, height: 16 }} />
                  <Text size="2">Staging</Text>
                </Flex>
                <Chip color="amber">Deploying</Chip>
              </Flex>
              <Separator />
              <Flex justify="between" align="center">
                <Flex gap="3" align="center">
                  <HugeiconsIcon icon={Cancel01Icon} strokeWidth={1.75} style={{ width: 16, height: 16 }} />
                  <Text size="2">Preview</Text>
                </Flex>
                <Chip color="red">Failed</Chip>
              </Flex>
            </Flex>
          </Card>
        </PreviewBlock>
      </Flex>

      <Separator />

      {/* Example 2: User Profile */}
      <Flex direction="column" gap="5">
        <SectionHeader.Root>
          <SectionHeader.Content>
            <SectionHeader.Title>User Profile</SectionHeader.Title>
            <SectionHeader.Description>
              Use soft variant chips for role indicators and outline chips for skills. This creates visual hierarchy while keeping the profile clean.
            </SectionHeader.Description>
          </SectionHeader.Content>
        </SectionHeader.Root>
        <PreviewBlock
          background="none"
          code={`<Card variant="raised" size="3">
  <Flex direction="column" gap="6" align="center" p="2">
    <Avatar
      size="6"
      fallback="AL"
      color="violet"
      variant="solid"
    />
    <Flex direction="column" gap="2">
      <Flex align="center" justify="center" gap="3">
        <Heading size="4">Alex Lee</Heading>
        <Chip size="1" color="violet">Pro</Chip>
      </Flex>
      <Text size="2" emphasis="medium">Senior Engineer</Text>
    </Flex>
    <Flex gap="3" wrap="wrap" justify="center">
      <Chip color="blue" variant="outline">React</Chip>
      <Chip color="green" variant="outline">Node.js</Chip>
      <Chip color="amber" variant="outline">TypeScript</Chip>
    </Flex>
  </Flex>
</Card>`}
        >
          <Card variant="raised" size="3" style={{ maxWidth: 360 }}>
            <Flex direction="column" gap="6" align="center" p="2" style={{ textAlign: 'center' }}>
              <Avatar size="6" fallback="AL" color="violet" variant="solid" />
              <Flex direction="column" gap="2">
                <Flex align="center" justify="center" gap="3">
                  <Heading size="4">Alex Lee</Heading>
                  <Chip size="1" color="violet">
                    Pro
                  </Chip>
                </Flex>
                <Text size="2" emphasis="medium">
                  Senior Engineer
                </Text>
              </Flex>
              <Flex gap="3" wrap="wrap" justify="center">
                <Chip color="blue" variant="outline">
                  React
                </Chip>
                <Chip color="green" variant="outline">
                  Node.js
                </Chip>
                <Chip color="amber" variant="outline">
                  TypeScript
                </Chip>
                <Chip color="pink" variant="outline">
                  GraphQL
                </Chip>
              </Flex>
            </Flex>
          </Card>
        </PreviewBlock>
      </Flex>

      <Separator />

      {/* Example 3: Feature Chips */}
      <Flex direction="column" gap="5">
        <SectionHeader.Root>
          <SectionHeader.Content>
            <SectionHeader.Title>Feature Announcements</SectionHeader.Title>
            <SectionHeader.Description>Tooltips add context without cluttering the UI. Hover over chips to reveal additional information about each feature status.</SectionHeader.Description>
          </SectionHeader.Content>
        </SectionHeader.Root>
        <PreviewBlock
          background="none"
          code={`<Flex justify="between" align="center">
  <Flex direction="column" gap="2">
    <Text size="2" weight="medium">AI Assistant</Text>
    <Text size="2" emphasis="medium">Intelligent code suggestions</Text>
  </Flex>
  <Chip
    color="violet"
    tooltip="Released within the last 7 days"
    tooltipSide="left"
  >
    New
  </Chip>
</Flex>`}
        >
          <Card variant="raised" size="2" style={{ minWidth: 320, maxWidth: 400 }}>
            <Flex direction="column" gap="4">
              <Flex justify="between" align="center">
                <Flex direction="column" gap="2">
                  <Text size="2" weight="medium">
                    AI Assistant
                  </Text>
                  <Text size="2" emphasis="medium">
                    Intelligent code suggestions
                  </Text>
                </Flex>
                <Chip color="violet" tooltip="Released within the last 7 days" tooltipSide="left">
                  New
                </Chip>
              </Flex>
              <Separator />
              <Flex justify="between" align="center">
                <Flex direction="column" gap="2">
                  <Text size="2" weight="medium">
                    Real-time Sync
                  </Text>
                  <Text size="2" emphasis="medium">
                    Collaborate in real-time
                  </Text>
                </Flex>
                <Chip color="cyan" tooltip="This feature is in testing and may change" tooltipSide="left">
                  Beta
                </Chip>
              </Flex>
            </Flex>
          </Card>
        </PreviewBlock>
      </Flex>

      <Separator />

      {/* Example 4: Notifications */}
      <Flex direction="column" gap="5">
        <SectionHeader.Root>
          <SectionHeader.Content>
            <SectionHeader.Title>Notifications</SectionHeader.Title>
            <SectionHeader.Description>Size 1 chips work well for compact notification items. The solid variant creates stronger visual indicators for unread items.</SectionHeader.Description>
          </SectionHeader.Content>
        </SectionHeader.Root>
        <PreviewBlock
          background="none"
          code={`<Flex gap="4" align="start">
  <Avatar
    size="3"
    fallback="JD"
    color="blue"
    variant="soft"
  />
  <Flex direction="column" gap="0" style={{ flex: 1 }}>
    <Flex justify="between" align="center">
      <Flex gap="3" align="center">
        <Text size="2" weight="medium">John Doe</Text>
        <Text size="1" emphasis="medium">2 min ago</Text>
      </Flex>
      <Chip size="1" color="blue" variant="solid">New</Chip>
    </Flex>
    <Text size="2">Commented on your pull request</Text>
  </Flex>
</Flex>`}
        >
          <Card variant="raised" size="2" style={{ minWidth: 320, maxWidth: 400 }}>
            <Flex direction="column" gap="5">
              <Flex gap="4" align="start">
                <Avatar size="3" fallback="JD" color="blue" variant="soft" />
                <Flex direction="column" gap="0" style={{ flex: 1 }}>
                  <Flex justify="between" align="center">
                    <Flex gap="3" align="center">
                      <Text size="2" weight="medium">
                        John Doe
                      </Text>
                      <Text size="1" emphasis="medium">
                        2 min ago
                      </Text>
                    </Flex>
                    <Chip size="1" color="blue" variant="solid">
                      New
                    </Chip>
                  </Flex>
                  <Text size="2">Commented on your pull request</Text>
                </Flex>
              </Flex>
              <Separator />
              <Flex gap="4" align="start">
                <Avatar size="3" fallback="SK" color="green" variant="soft" />
                <Flex direction="column" gap="0" style={{ flex: 1 }}>
                  <Flex justify="between" align="center">
                    <Flex gap="3" align="center">
                      <Text size="2" weight="medium">
                        Sarah Kim
                      </Text>
                      <Text size="1" emphasis="medium">
                        1 hour ago
                      </Text>
                    </Flex>
                    <Button iconOnly variant="ghost" size="1" color="gray" aria-label="More options">
                      <HugeiconsIcon icon={MoreHorizontalIcon} strokeWidth={1.75} />
                    </Button>
                  </Flex>
                  <Text size="2">Approved your changes</Text>
                </Flex>
              </Flex>
            </Flex>
          </Card>
        </PreviewBlock>
      </Flex>
    </Flex>
  );
}
