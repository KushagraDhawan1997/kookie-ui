'use client';

import * as React from 'react';
import { PreviewBlock } from '@/components/blocks/preview-block/preview-block';
import { SectionHeader } from '@/components/blocks/section-header/section-header';
import { Flex, IconButton, Separator, Card, Skeleton } from '@kushagradhawan/kookie-ui';
import { HugeiconsIcon } from '@hugeicons/react';
import { Settings01Icon, Notification01Icon, Search01Icon, MoreHorizontalIcon, Cancel01Icon, Share05Icon, BookmarkAdd01Icon, FilterIcon, Add01Icon } from '@hugeicons/core-free-icons';

export function IconButtonExamples() {
  return (
    <Flex direction="column" gap="9">
      {/* Example 1: Toolbar Actions */}
      <Flex direction="column" gap="4">
        <SectionHeader.Root>
          <SectionHeader.Content>
            <SectionHeader.Title>Toolbar Actions</SectionHeader.Title>
            <SectionHeader.Description>Icon buttons with tooltips for common toolbar actions. Tooltips provide context for icon-only buttons.</SectionHeader.Description>
          </SectionHeader.Content>
        </SectionHeader.Root>
        <PreviewBlock
          background="none"
          code={`<Card variant="classic" size="2">
  <Flex justify="between" align="center" p="1">
    <Skeleton width="80px" height="14px" />
    <Flex gap="1" align="center">
      <IconButton variant="soft" size="2" color="gray" aria-label="Search" tooltip="Search">
        <HugeiconsIcon icon={Search01Icon} strokeWidth={1.75} />
      </IconButton>
      <IconButton variant="soft" size="2" color="gray" aria-label="Notifications" tooltip="Notifications">
        <HugeiconsIcon icon={Notification01Icon} strokeWidth={1.75} />
      </IconButton>
      <IconButton variant="soft" size="2" color="gray" aria-label="Settings" tooltip="Settings">
        <HugeiconsIcon icon={Settings01Icon} strokeWidth={1.75} />
      </IconButton>
    </Flex>
  </Flex>
</Card>`}
        >
          <Card variant="classic" size="2" style={{ width: '100%', maxWidth: 400 }}>
            <Flex justify="between" align="center" p="1">
              <Skeleton width="80px" height="14px" />
              <Flex gap="1" align="center">
                <IconButton variant="soft" size="2" color="gray" aria-label="Search" tooltip="Search">
                  <HugeiconsIcon icon={Search01Icon} strokeWidth={1.75} />
                </IconButton>
                <IconButton variant="soft" size="2" color="gray" aria-label="Notifications" tooltip="Notifications">
                  <HugeiconsIcon icon={Notification01Icon} strokeWidth={1.75} />
                </IconButton>
                <IconButton variant="soft" size="2" color="gray" aria-label="Settings" tooltip="Settings">
                  <HugeiconsIcon icon={Settings01Icon} strokeWidth={1.75} />
                </IconButton>
              </Flex>
            </Flex>
          </Card>
        </PreviewBlock>
      </Flex>

      <Separator size="4" />

      {/* Example 2: Card Actions */}
      <Flex direction="column" gap="4">
        <SectionHeader.Root>
          <SectionHeader.Content>
            <SectionHeader.Title>Card Actions</SectionHeader.Title>
            <SectionHeader.Description>Icon buttons positioned at the bottom of a card for quick actions like share, bookmark, and menu.</SectionHeader.Description>
          </SectionHeader.Content>
        </SectionHeader.Root>
        <PreviewBlock
          background="none"
          code={`<Card variant="classic" size="2" style={{ maxWidth: 320 }}>
  <Flex direction="column" gap="3" p="1">
    <Flex direction="column" gap="1">
      <Skeleton width="140px" height="12px" />
      <Skeleton width="200px" height="10px" />
    </Flex>
    <Flex justify="end" gap="0">
      <IconButton color="gray" variant="ghost" size="2" aria-label="Share" tooltip="Share">
        <HugeiconsIcon icon={Share05Icon} strokeWidth={1.75} />
      </IconButton>
      <IconButton color="gray" variant="ghost" size="2" aria-label="More options" tooltip="More options">
        <HugeiconsIcon icon={MoreHorizontalIcon} strokeWidth={1.75} />
      </IconButton>
    </Flex>
  </Flex>
</Card>`}
        >
          <Card variant="classic" size="2" style={{ maxWidth: 320 }}>
            <Flex direction="column" gap="3" p="1">
              <Flex direction="column" gap="1">
                <Skeleton width="140px" height="12px" />
                <Skeleton width="200px" height="10px" />
              </Flex>
              <Flex justify="end" gap="0">
                <IconButton color="gray" variant="ghost" size="2" aria-label="Share" tooltip="Share">
                  <HugeiconsIcon icon={Share05Icon} strokeWidth={1.75} />
                </IconButton>
                <IconButton color="gray" variant="ghost" size="2" aria-label="More options" tooltip="More options">
                  <HugeiconsIcon icon={MoreHorizontalIcon} strokeWidth={1.75} />
                </IconButton>
              </Flex>
            </Flex>
          </Card>
        </PreviewBlock>
      </Flex>

      <Separator size="4" />

      {/* Example 3: Compact Data Table Controls */}
      <Flex direction="column" gap="4">
        <SectionHeader.Root>
          <SectionHeader.Content>
            <SectionHeader.Title>Data Table Controls</SectionHeader.Title>
            <SectionHeader.Description>Size 1 icon buttons for dense interfaces like data tables. The soft variant provides subtle visual weight.</SectionHeader.Description>
          </SectionHeader.Content>
        </SectionHeader.Root>
        <PreviewBlock
          background="none"
          code={`<Card variant="classic" size="1">
  <Flex justify="between" align="center" p="1">
    <Skeleton width="60px" height="12px" />
    <Flex gap="1" align="center">
      <IconButton variant="soft" size="1" color="gray" aria-label="Add" tooltip="Add">
        <HugeiconsIcon icon={Add01Icon} strokeWidth={1.75} />
      </IconButton>
      <IconButton variant="soft" size="1" color="gray" aria-label="Filter" tooltip="Filter">
        <HugeiconsIcon icon={FilterIcon} strokeWidth={1.75} />
      </IconButton>
      <IconButton variant="soft" size="1" color="gray" aria-label="More" tooltip="More">
        <HugeiconsIcon icon={MoreHorizontalIcon} strokeWidth={1.75} />
      </IconButton>
    </Flex>
  </Flex>
</Card>`}
        >
          <Card variant="classic" size="1" style={{ width: '100%', maxWidth: 400 }}>
            <Flex justify="between" align="center" p="1">
              <Skeleton width="60px" height="12px" />
              <Flex gap="1" align="center">
                <IconButton variant="soft" size="1" color="gray" aria-label="Add" tooltip="Add">
                  <HugeiconsIcon icon={Add01Icon} strokeWidth={1.75} />
                </IconButton>
                <IconButton variant="soft" size="1" color="gray" aria-label="Filter" tooltip="Filter">
                  <HugeiconsIcon icon={FilterIcon} strokeWidth={1.75} />
                </IconButton>
                <IconButton variant="soft" size="1" color="gray" aria-label="More" tooltip="More">
                  <HugeiconsIcon icon={MoreHorizontalIcon} strokeWidth={1.75} />
                </IconButton>
              </Flex>
            </Flex>
          </Card>
        </PreviewBlock>
      </Flex>

      <Separator size="4" />

      {/* Example 4: Dialog Close */}
      <Flex direction="column" gap="4">
        <SectionHeader.Root>
          <SectionHeader.Content>
            <SectionHeader.Title>Dialog Close</SectionHeader.Title>
            <SectionHeader.Description>Ghost variant for dismiss actions. Position in dialog headers for consistent close button placement.</SectionHeader.Description>
          </SectionHeader.Content>
        </SectionHeader.Root>
        <PreviewBlock
          background="none"
          code={`<Card variant="classic" size="2" style={{ maxWidth: 400, position: 'relative' }}>
  <Flex position="absolute" top="2" right="2">
    <IconButton color="gray" variant="ghost" size="2" aria-label="Close dialog" tooltip="Close">
      <HugeiconsIcon icon={Cancel01Icon} strokeWidth={1.75} />
    </IconButton>
  </Flex>
  <Flex direction="column" gap="1" p="1" pr="6">
    <Skeleton width="120px" height="16px" />
    <Skeleton width="180px" height="12px" />
  </Flex>
</Card>`}
        >
          <Card variant="classic" size="2" style={{ maxWidth: 400, position: 'relative' }}>
            <Flex position="absolute" top="2" right="2">
              <IconButton color="gray" variant="ghost" size="2" aria-label="Close dialog" tooltip="Close">
                <HugeiconsIcon icon={Cancel01Icon} strokeWidth={1.75} />
              </IconButton>
            </Flex>
            <Flex direction="column" gap="1" p="1" pr="6">
              <Skeleton width="120px" height="16px" />
              <Skeleton width="180px" height="12px" />
            </Flex>
          </Card>
        </PreviewBlock>
      </Flex>
    </Flex>
  );
}
