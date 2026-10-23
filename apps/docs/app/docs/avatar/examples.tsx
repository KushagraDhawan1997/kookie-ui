'use client';

import * as React from 'react';
import { PreviewBlock } from '@/components/blocks/preview-block/preview-block';
import { SectionHeader } from '@/components/blocks/section-header/section-header';
import { Flex, Avatar, Text, Card, Badge, Separator, Heading, IconButton, Button } from '@kushagradhawan/kookie-ui';
import { HugeiconsIcon } from '@hugeicons/react';
import { MoreHorizontalIcon, Mail01Icon, Clock01Icon, Add01Icon } from '@hugeicons/core-free-icons';

export function AvatarExamples() {
  return (
    <Flex direction="column" gap="10">
      {/* Example 1: Team Members */}
      <Flex direction="column" gap="5">
        <SectionHeader.Root>
          <SectionHeader.Content>
            <SectionHeader.Title>Team Members</SectionHeader.Title>
            <SectionHeader.Description>
              Solid variant avatars create consistent visual identity in team lists. Pair with role badges and action buttons for complete member cards.
            </SectionHeader.Description>
          </SectionHeader.Content>
        </SectionHeader.Root>
        <PreviewBlock
          background="none"
          code={`<Card variant="raised" size="2" style={{ minWidth: 320 }}>
  <Flex direction="column" gap="4">
    <Flex justify="between" align="center">
      <Flex gap="4" align="center">
        <Avatar
          size="4"
          fallback="SK"
          color="violet"
          variant="solid"
        />
        <Flex direction="column" gap="0">
          <Text size="2" weight="medium">Sarah Kim</Text>
          <Text size="1" emphasis="medium">Product Lead</Text>
        </Flex>
      </Flex>
      <Badge size="1" color="violet" variant="soft">Admin</Badge>
    </Flex>
  </Flex>
</Card>`}
        >
          <Card variant="raised" size="2" style={{ minWidth: 320, maxWidth: 400 }}>
            <Flex direction="column" gap="4">
              <Flex justify="between" align="center">
                <Flex gap="4" align="center">
                  <Avatar size="4" fallback="SK" color="violet" variant="solid" />
                  <Flex direction="column" gap="0">
                    <Text size="2" weight="medium">
                      Sarah Kim
                    </Text>
                    <Text size="1" emphasis="medium">
                      Product Lead
                    </Text>
                  </Flex>
                </Flex>
                <Badge size="1" color="violet" variant="soft">
                  Admin
                </Badge>
              </Flex>
              <Separator />
              <Flex justify="between" align="center">
                <Flex gap="4" align="center">
                  <Avatar size="4" fallback="JD" color="blue" variant="solid" />
                  <Flex direction="column" gap="0">
                    <Text size="2" weight="medium">
                      John Doe
                    </Text>
                    <Text size="1" emphasis="medium">
                      Engineer
                    </Text>
                  </Flex>
                </Flex>
                <Badge size="1" color="blue" variant="soft">
                  Member
                </Badge>
              </Flex>
              <Separator />
              <Flex justify="between" align="center">
                <Flex gap="4" align="center">
                  <Avatar size="4" fallback="AL" color="green" variant="solid" />
                  <Flex direction="column" gap="0">
                    <Text size="2" weight="medium">
                      Alex Lee
                    </Text>
                    <Text size="1" emphasis="medium">
                      Designer
                    </Text>
                  </Flex>
                </Flex>
                <Badge size="1" color="green" variant="soft">
                  Member
                </Badge>
              </Flex>
            </Flex>
          </Card>
        </PreviewBlock>
      </Flex>

      <Separator />

      {/* Example 2: Messages */}
      <Flex direction="column" gap="5">
        <SectionHeader.Root>
          <SectionHeader.Content>
            <SectionHeader.Title>Messages</SectionHeader.Title>
            <SectionHeader.Description>
              Smaller avatars (size 3) work well in dense interfaces like message lists. The soft variant provides subtle distinction without overwhelming the content.
            </SectionHeader.Description>
          </SectionHeader.Content>
        </SectionHeader.Root>
        <PreviewBlock
          background="none"
          code={`<Flex gap="4" align="start">
  <Avatar
    size="3"
    fallback="MJ"
    color="blue"
    variant="soft"
  />
  <Flex direction="column" gap="0" style={{ flex: 1 }}>
    <Flex justify="between" align="center">
      <Flex gap="3" align="center">
        <Text size="2" weight="medium">Mike Johnson</Text>
        <Text size="1" emphasis="medium">2 hours ago</Text>
      </Flex>
      <IconButton variant="ghost" size="1" color="gray">
        <HugeiconsIcon icon={MoreHorizontalIcon} />
      </IconButton>
    </Flex>
    <Text size="2">This looks great!</Text>
  </Flex>
</Flex>`}
        >
          <Card variant="raised" size="2" style={{ maxWidth: 440 }}>
            <Flex direction="column" gap="5">
              <Flex gap="4" align="start">
                <Avatar size="3" fallback="MJ" color="blue" variant="soft" />
                <Flex direction="column" gap="0" style={{ flex: 1 }}>
                  <Flex justify="between" align="center">
                    <Flex gap="3" align="center">
                      <Text size="2" weight="medium">
                        Mike Johnson
                      </Text>
                      <Text size="1" emphasis="medium">
                        2 hours ago
                      </Text>
                    </Flex>
                    <IconButton variant="ghost" size="1" color="gray" aria-label="More options">
                      <HugeiconsIcon icon={MoreHorizontalIcon} strokeWidth={1.75} />
                    </IconButton>
                  </Flex>
                  <Text size="2">This looks great! Love the new design direction.</Text>
                </Flex>
              </Flex>
              <Separator />
              <Flex gap="4" align="start">
                <Avatar size="3" fallback="EW" color="pink" variant="soft" />
                <Flex direction="column" gap="0" style={{ flex: 1 }}>
                  <Flex justify="between" align="center">
                    <Flex gap="3" align="center">
                      <Text size="2" weight="medium">
                        Emma Wilson
                      </Text>
                      <Text size="1" emphasis="medium">
                        1 hour ago
                      </Text>
                    </Flex>
                    <IconButton variant="ghost" size="1" color="gray" aria-label="More options">
                      <HugeiconsIcon icon={MoreHorizontalIcon} strokeWidth={1.75} />
                    </IconButton>
                  </Flex>
                  <Text size="2">Thanks! We're excited about the direction too.</Text>
                </Flex>
              </Flex>
            </Flex>
          </Card>
        </PreviewBlock>
      </Flex>

      <Separator />

      {/* Example 3: Profile Header */}
      <Flex direction="column" gap="5">
        <SectionHeader.Root>
          <SectionHeader.Content>
            <SectionHeader.Title>Profile Header</SectionHeader.Title>
            <SectionHeader.Description>Large avatars (size 6-7) anchor profile headers. Use solid variant for visual weight and pair with clear typography hierarchy.</SectionHeader.Description>
          </SectionHeader.Content>
        </SectionHeader.Root>
        <PreviewBlock
          background="none"
          code={`<Card variant="raised" size="3">
  <Flex direction="column" gap="6" align="center" p="2">
    <Avatar
      size="6"
      fallback="SK"
      color="violet"
      variant="solid"
    />
    <Flex direction="column" gap="2">
      <Flex align="center" justify="center" gap="3">
        <Heading size="4">Sarah Kim</Heading>
        <Badge size="1" color="violet">Pro</Badge>
      </Flex>
      <Text size="2" emphasis="medium">Senior Product Designer</Text>
    </Flex>
    <Flex gap="3">
      <Button variant="solid" size="2">
        <HugeiconsIcon icon={Mail01Icon} />
        Message
      </Button>
      <Button variant="soft" size="2" color="gray">
        Follow
      </Button>
    </Flex>
  </Flex>
</Card>`}
        >
          <Card variant="raised" size="3" style={{ maxWidth: 360 }}>
            <Flex direction="column" gap="6" align="center" p="2" style={{ textAlign: 'center' }}>
              <Avatar size="6" fallback="SK" color="violet" variant="solid" />
              <Flex direction="column" gap="2">
                <Flex align="center" justify="center" gap="3">
                  <Heading size="4">Sarah Kim</Heading>
                  <Badge size="1" color="violet">
                    Pro
                  </Badge>
                </Flex>
                <Text size="2" emphasis="medium">
                  Senior Product Designer
                </Text>
                <Flex gap="2" align="center" justify="center">
                  <HugeiconsIcon icon={Clock01Icon} strokeWidth={1.75} size={14} />
                  <Text size="1" emphasis="medium">
                    Joined March 2023
                  </Text>
                </Flex>
              </Flex>
              <Flex gap="3">
                <Button variant="solid" size="2">
                  <HugeiconsIcon icon={Mail01Icon} strokeWidth={1.75} />
                  Message
                </Button>
                <Button variant="soft" size="2" color="gray">
                  Follow
                </Button>
              </Flex>
            </Flex>
          </Card>
        </PreviewBlock>
      </Flex>

      <Separator />

      {/* Example 4: Status Indicators */}
      <Flex direction="column" gap="5">
        <SectionHeader.Root>
          <SectionHeader.Content>
            <SectionHeader.Title>Status Indicators</SectionHeader.Title>
            <SectionHeader.Description>Use the native status prop to show presence with a colored dot. The indicator scales automatically with avatar size.</SectionHeader.Description>
          </SectionHeader.Content>
        </SectionHeader.Root>
        <PreviewBlock
          background="none"
          code={`<Avatar
  size="4"
  fallback="JD"
  variant="soft"
  status="green"
/>
<Avatar
  size="4"
  fallback="AB"
  variant="soft"
  status="amber"
/>
<Avatar
  size="4"
  fallback="CD"
  variant="soft"
  status="gray"
/>`}
        >
          <Card variant="raised" size="2" style={{ maxWidth: 340 }}>
            <Flex direction="column" gap="4">
              <Flex justify="between" align="center">
                <Flex gap="4" align="center">
                  <Avatar size="4" fallback="JD" variant="soft" status="green" />
                  <Flex direction="column" gap="0">
                    <Text size="2" weight="medium">
                      John Doe
                    </Text>
                    <Text size="1" color="green">
                      Online
                    </Text>
                  </Flex>
                </Flex>
              </Flex>
              <Separator />
              <Flex justify="between" align="center">
                <Flex gap="4" align="center">
                  <Avatar size="4" fallback="AB" variant="soft" status="amber" />
                  <Flex direction="column" gap="0">
                    <Text size="2" weight="medium">
                      Alice Brown
                    </Text>
                    <Text size="1" color="amber">
                      Away
                    </Text>
                  </Flex>
                </Flex>
              </Flex>
              <Separator />
              <Flex justify="between" align="center">
                <Flex gap="4" align="center">
                  <Avatar size="4" fallback="CD" variant="soft" status="gray" />
                  <Flex direction="column" gap="0">
                    <Text size="2" weight="medium">
                      Chris Davis
                    </Text>
                    <Text size="1" emphasis="medium">
                      Offline
                    </Text>
                  </Flex>
                </Flex>
              </Flex>
            </Flex>
          </Card>
        </PreviewBlock>
      </Flex>

      <Separator />

      {/* Example 5: Custom Badge */}
      <Flex direction="column" gap="5">
        <SectionHeader.Root>
          <SectionHeader.Content>
            <SectionHeader.Title>Custom Badge</SectionHeader.Title>
            <SectionHeader.Description>Use the badge prop for custom content like notification counts or verification icons.</SectionHeader.Description>
          </SectionHeader.Content>
        </SectionHeader.Root>
        <PreviewBlock
          background="none"
          code={`<Avatar
  size="5"
  fallback="JD"
  variant="surface"
  badge={
    <Badge size="2" color="red" variant="solid" radius="full">
      3
    </Badge>
  }
/>`}
        >
          <Avatar
            size="5"
            fallback="JD"
            variant="surface"
            badge={
              <Badge size="2" color="red" variant="solid" radius="full">
                3
              </Badge>
            }
          />
        </PreviewBlock>
      </Flex>

      <Separator />

      {/* Example 6: Company Logos */}
      <Flex direction="column" gap="5">
        <SectionHeader.Root>
          <SectionHeader.Content>
            <SectionHeader.Title>Company Logos</SectionHeader.Title>
            <SectionHeader.Description>Use fit="contain" to display logos without cropping. This ensures the entire logo is visible within the avatar bounds.</SectionHeader.Description>
          </SectionHeader.Content>
        </SectionHeader.Root>
        <PreviewBlock
          background="none"
          code={`<Avatar
  size="4"
  src="/company-logo.svg"
  fallback="CO"
  fit="contain"
  variant="surface"
/>`}
        >
          <Card variant="raised" size="2" style={{ minWidth: 320, maxWidth: 400 }}>
            <Flex direction="column" gap="4">
              <Flex justify="between" align="center">
                <Flex gap="4" align="center">
                  <Avatar size="4" src="https://upload.wikimedia.org/wikipedia/commons/a/a9/Amazon_logo.svg" fallback="AZ" fit="contain" variant="surface" />
                  <Flex direction="column" gap="0">
                    <Text size="2" weight="medium">
                      Amazon
                    </Text>
                    <Text size="1" emphasis="medium">
                      E-commerce
                    </Text>
                  </Flex>
                </Flex>
              </Flex>
              <Separator />
              <Flex justify="between" align="center">
                <Flex gap="4" align="center">
                  <Avatar size="4" src="https://upload.wikimedia.org/wikipedia/commons/2/2f/Google_2015_logo.svg" fallback="GO" fit="contain" variant="surface" />
                  <Flex direction="column" gap="0">
                    <Text size="2" weight="medium">
                      Google
                    </Text>
                    <Text size="1" emphasis="medium">
                      Technology
                    </Text>
                  </Flex>
                </Flex>
              </Flex>
              <Separator />
              <Flex justify="between" align="center">
                <Flex gap="4" align="center">
                  <Avatar size="4" src="https://upload.wikimedia.org/wikipedia/commons/f/fa/Apple_logo_black.svg" fallback="AP" fit="contain" variant="surface" />
                  <Flex direction="column" gap="0">
                    <Text size="2" weight="medium">
                      Apple
                    </Text>
                    <Text size="1" emphasis="medium">
                      Consumer Electronics
                    </Text>
                  </Flex>
                </Flex>
              </Flex>
            </Flex>
          </Card>
        </PreviewBlock>
      </Flex>

      <Separator />

      {/* Example 7: Invite Members */}
      <Flex direction="column" gap="5">
        <SectionHeader.Root>
          <SectionHeader.Content>
            <SectionHeader.Title>Invite Members</SectionHeader.Title>
            <SectionHeader.Description>Use IconButton with outline variant as an "add member" action that blends with existing avatars.</SectionHeader.Description>
          </SectionHeader.Content>
        </SectionHeader.Root>
        <PreviewBlock
          background="none"
          code={`<Flex gap="4" align="center">
  <Avatar
    size="4"
    fallback="JD"
    variant="soft"
    radius="full"
  />
  <Avatar
    size="4"
    fallback="SK"
    variant="soft"
    radius="full"
  />
  <Avatar
    size="4"
    fallback="AL"
    variant="soft"
    radius="full"
  />
  <IconButton
    size="4"
    variant="outline"
    color="gray"
    radius="full"
    aria-label="Add member"
  >
    <HugeiconsIcon icon={Add01Icon} />
  </IconButton>
</Flex>`}
        >
          <Flex gap="4" align="center">
            <Avatar size="4" fallback="JD" variant="soft" radius="full" />
            <Avatar size="4" fallback="SK" variant="soft" radius="full" />
            <Avatar size="4" fallback="AL" variant="soft" radius="full" />
            <IconButton size="4" variant="outline" color="gray" radius="full" aria-label="Add member">
              <HugeiconsIcon icon={Add01Icon} strokeWidth={1.75} />
            </IconButton>
          </Flex>
        </PreviewBlock>
      </Flex>
    </Flex>
  );
}
