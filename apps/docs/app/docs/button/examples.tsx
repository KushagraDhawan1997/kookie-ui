'use client';

import * as React from 'react';
import { PreviewBlock } from '@/components/blocks/preview-block/preview-block';
import { SectionHeader } from '@/components/blocks/section-header/section-header';
import { Flex, Button, Text, Separator, Card, Heading, Spinner } from '@kushagradhawan/kookie-ui';
import { HugeiconsIcon } from '@hugeicons/react';
import {
  ArrowRight01Icon,
  Download01Icon,
  Add01Icon,
  Delete01Icon,
  Copy01Icon,
  Share01Icon,
  Tick01Icon,
  FilterIcon,
  SortingAZ01Icon,
  Settings01Icon,
  PlayIcon,
  Bookmark01Icon,
} from '@hugeicons/core-free-icons';

export function ButtonExamples() {
  const [isSubmitting, setIsSubmitting] = React.useState(false);
  const [isBookmarking, setIsBookmarking] = React.useState(false);
  const [selectedCount, setSelectedCount] = React.useState(0);

  const handleSubmit = () => {
    setIsSubmitting(true);
    setTimeout(() => setIsSubmitting(false), 2000);
  };

  const handleBookmark = () => {
    setIsBookmarking(true);
    setTimeout(() => setIsBookmarking(false), 2000);
  };

  const toggleSelection = () => {
    setSelectedCount((prev) => (prev === 0 ? 3 : 0));
  };

  return (
    <Flex direction="column" gap="9">
      {/* Example 1: Form Submission */}
      <Flex direction="column" gap="4">
        <SectionHeader.Root>
          <SectionHeader.Content>
            <SectionHeader.Title>Form Submission</SectionHeader.Title>
            <SectionHeader.Description>
              The classic variant commands attention for primary actions. Click to see the loading state - the button replaces all content with a centered spinner and disables interaction
              automatically.
            </SectionHeader.Description>
          </SectionHeader.Content>
        </SectionHeader.Root>
        <PreviewBlock
          background="none"
          code={`<Flex gap="2" align="center">
  <Button
    variant="soft"
    size="2"
    color="gray"
    disabled={isSubmitting}
  >
    Cancel
  </Button>
  <Button
    variant="classic"
    size="2"
    loading={isSubmitting}
    onClick={handleSubmit}
  >
    <HugeiconsIcon icon={Tick01Icon} strokeWidth={1.75} />
    Save Changes
  </Button>
</Flex>`}
        >
          <Flex gap="2" align="center">
            <Button variant="soft" size="2" color="gray" disabled={isSubmitting}>
              Cancel
            </Button>
            <Button variant="classic" size="2" loading={isSubmitting} onClick={handleSubmit}>
              <HugeiconsIcon icon={Tick01Icon} strokeWidth={1.75} />
              Save Changes
            </Button>
          </Flex>
        </PreviewBlock>
      </Flex>

      <Separator size="4" />

      {/* Example: Icon Loading with Spinner */}
      <Flex direction="column" gap="4">
        <SectionHeader.Root>
          <SectionHeader.Content>
            <SectionHeader.Title>Icon Loading State</SectionHeader.Title>
            <SectionHeader.Description>
              For a more sophisticated loading design, wrap the icon in a Spinner component. The spinner replaces just the icon while the text remains visible, providing clearer context during the
              action.
            </SectionHeader.Description>
          </SectionHeader.Content>
        </SectionHeader.Root>
        <PreviewBlock
          background="none"
          code={`<Button disabled={isBookmarking} variant="classic">
  <Spinner loading={isBookmarking}>
    <BookmarkIcon />
  </Spinner>
  Bookmark
</Button>`}
        >
          <Flex gap="2" align="center">
            <Button variant="classic" size="2" disabled={isBookmarking} onClick={handleBookmark}>
              <Spinner loading={isBookmarking}>
                <HugeiconsIcon icon={Bookmark01Icon} strokeWidth={1.75} />
              </Spinner>
              Bookmark
            </Button>
            <Button variant="soft" size="2" disabled={isBookmarking} onClick={handleBookmark}>
              <Spinner loading={isBookmarking}>
                <HugeiconsIcon icon={Bookmark01Icon} strokeWidth={1.75} />
              </Spinner>
              Bookmark
            </Button>
          </Flex>
        </PreviewBlock>
      </Flex>

      <Separator size="4" />

      {/* Example 2: Destructive Confirmation */}
      <Flex direction="column" gap="4">
        <SectionHeader.Root>
          <SectionHeader.Content>
            <SectionHeader.Title>Destructive Confirmation</SectionHeader.Title>
            <SectionHeader.Description>
              Red signals danger for irreversible actions. The outline variant on the safe option stays visible but secondary, letting users escape easily.
            </SectionHeader.Description>
          </SectionHeader.Content>
        </SectionHeader.Root>
        <PreviewBlock
          background="none"
          code={`<Flex gap="2" align="center">
  <Button variant="outline" size="2" color="gray">
    Cancel
  </Button>
  <Button variant="solid" size="2" color="red">
    <HugeiconsIcon icon={Delete01Icon} strokeWidth={1.75} />
    Delete Project
  </Button>
</Flex>`}
        >
          <Flex gap="2" align="center">
            <Button variant="outline" size="2" color="gray">
              Cancel
            </Button>
            <Button variant="solid" size="2" color="red">
              <HugeiconsIcon icon={Delete01Icon} strokeWidth={1.75} />
              Delete Project
            </Button>
          </Flex>
        </PreviewBlock>
      </Flex>

      <Separator size="4" />

      {/* Example 3: Card CTA */}
      <Flex direction="column" gap="4">
        <SectionHeader.Root>
          <SectionHeader.Content>
            <SectionHeader.Title>Card Call-to-Action</SectionHeader.Title>
            <SectionHeader.Description>
              Inside a classic card, use solid for the primary action to maintain clear hierarchy. The ghost secondary action stays minimal within the elevated surface.
            </SectionHeader.Description>
          </SectionHeader.Content>
        </SectionHeader.Root>
        <PreviewBlock
          background="none"
          code={`<Card
  variant="classic"
  size="2"
  style={{ maxWidth: 320 }}
>
  <Flex direction="column" gap="6" p="2">
    <Flex direction="column" gap="1">
      <Heading size="4" weight="medium">
        Pro Plan
      </Heading>
      <Text size="2" emphasis="medium">
        Unlimited projects and collaborators
      </Text>
    </Flex>
    <Flex direction="column" gap="1">
      <Button variant="solid" size="2">
        Upgrade Now
        <HugeiconsIcon icon={ArrowRight01Icon} strokeWidth={1.75} />
      </Button>
      <Button variant="ghost" size="2" color="gray">
        Compare Plans
      </Button>
    </Flex>
  </Flex>
</Card>`}
        >
          <Card variant="classic" size="2" style={{ maxWidth: 320 }}>
            <Flex direction="column" gap="6" p="2">
              <Flex direction="column" gap="1">
                <Heading size="4" weight="medium">
                  Pro Plan
                </Heading>
                <Text size="2" emphasis="medium">
                  Unlimited projects and collaborators
                </Text>
              </Flex>
              <Flex direction="column" gap="1">
                <Button variant="solid" size="2">
                  Upgrade Now
                  <HugeiconsIcon icon={ArrowRight01Icon} strokeWidth={1.75} />
                </Button>
                <Button variant="ghost" size="2" color="gray">
                  Compare Plans
                </Button>
              </Flex>
            </Flex>
          </Card>
        </PreviewBlock>
      </Flex>

      <Separator size="4" />

      {/* Example 4: Toolbar with Selection */}
      <Flex direction="column" gap="4">
        <SectionHeader.Root>
          <SectionHeader.Content>
            <SectionHeader.Title>Toolbar Actions</SectionHeader.Title>
            <SectionHeader.Description>
              Disabled buttons include tooltips explaining why they're unavailable. Click "Select items" to toggle the selection state and enable the export action.
            </SectionHeader.Description>
          </SectionHeader.Content>
        </SectionHeader.Root>
        <PreviewBlock
          background="none"
          code={`<Flex gap="2" align="center">
  <Button
    variant="soft"
    size="2"
    color="gray"
    onClick={toggleSelection}
  >
    {selectedCount > 0 ? \`\${selectedCount} selected\` : 'Select items'}
  </Button>
  <Button
    variant="soft"
    size="2"
    color="gray"
    disabled={selectedCount === 0}
    tooltip={selectedCount === 0 ? 'Select items first' : undefined}
  >
    <HugeiconsIcon icon={Download01Icon} strokeWidth={1.75} />
    Export
  </Button>
  <Button
    variant="soft"
    size="2"
    color="gray"
    tooltip="Copy link"
  >
    <HugeiconsIcon icon={Copy01Icon} strokeWidth={1.75} />
    Copy
  </Button>
</Flex>`}
        >
          <Flex gap="2" align="center">
            <Button variant="soft" size="2" color="gray" onClick={toggleSelection}>
              {selectedCount > 0 ? `${selectedCount} selected` : 'Select items'}
            </Button>
            <Button variant="soft" size="2" color="gray" disabled={selectedCount === 0} tooltip={selectedCount === 0 ? 'Select items first' : undefined}>
              <HugeiconsIcon icon={Download01Icon} strokeWidth={1.75} />
              Export
            </Button>
            <Button variant="soft" size="2" color="gray" tooltip="Copy link">
              <HugeiconsIcon icon={Copy01Icon} strokeWidth={1.75} />
              Copy
            </Button>
            <Button variant="soft" size="2" color="gray" tooltip="Share with team">
              <HugeiconsIcon icon={Share01Icon} strokeWidth={1.75} />
              Share
            </Button>
          </Flex>
        </PreviewBlock>
      </Flex>

      <Separator size="4" />

      {/* Example 5: Empty State CTA */}
      <Flex direction="column" gap="4">
        <SectionHeader.Root>
          <SectionHeader.Content>
            <SectionHeader.Title>Empty State</SectionHeader.Title>
            <SectionHeader.Description>
              The surface variant provides gentle elevation for empty state CTAs. Keep the default size for consistency with the rest of the interface.
            </SectionHeader.Description>
          </SectionHeader.Content>
        </SectionHeader.Root>
        <PreviewBlock
          background="none"
          code={`<Flex
  direction="column"
  align="center"
  justify="center"
  gap="4"
  py="5"
  style={{ textAlign: 'center' }}
>
  <Flex direction="column" gap="1">
    <Heading size="4" weight="medium">
      No projects yet
    </Heading>
    <Text size="2" emphasis="medium">
      Create your first project to get started
    </Text>
  </Flex>
  <Button variant="surface" size="2">
    <HugeiconsIcon icon={Add01Icon} strokeWidth={1.75} />
    Create Project
  </Button>
</Flex>`}
        >
          <Flex direction="column" align="center" justify="center" gap="4" py="5" style={{ textAlign: 'center' }}>
            <Flex direction="column" gap="1">
              <Heading size="4" weight="medium">
                No projects yet
              </Heading>
              <Text size="2" emphasis="medium">
                Create your first project to get started
              </Text>
            </Flex>
            <Button variant="surface" size="2">
              <HugeiconsIcon icon={Add01Icon} strokeWidth={1.75} />
              Create Project
            </Button>
          </Flex>
        </PreviewBlock>
      </Flex>

      <Separator size="4" />

      {/* Example 6: Compact Toolbar */}
      <Flex direction="column" gap="4">
        <SectionHeader.Root>
          <SectionHeader.Content>
            <SectionHeader.Title>Compact Toolbar</SectionHeader.Title>
            <SectionHeader.Description>
              Size 1 buttons fit tight interfaces like data tables and dense toolbars. The smaller footprint maintains functionality without overwhelming the content.
            </SectionHeader.Description>
          </SectionHeader.Content>
        </SectionHeader.Root>
        <PreviewBlock
          background="none"
          code={`<Flex gap="1" align="center">
  <Button
    variant="soft"
    size="1"
    color="gray"
  >
    <HugeiconsIcon icon={FilterIcon} strokeWidth={1.75} />
    Filter
  </Button>
  <Button
    variant="soft"
    size="1"
    color="gray"
  >
    <HugeiconsIcon icon={SortingAZ01Icon} strokeWidth={1.75} />
    Sort
  </Button>
  <Button variant="ghost" size="1" color="gray">
    <HugeiconsIcon icon={Settings01Icon} strokeWidth={1.75} />
    Settings
  </Button>
</Flex>`}
        >
          <Flex gap="1" align="center">
            <Button variant="soft" size="1" color="gray">
              <HugeiconsIcon icon={FilterIcon} strokeWidth={1.75} />
              Filter
            </Button>
            <Button variant="soft" size="1" color="gray">
              <HugeiconsIcon icon={SortingAZ01Icon} strokeWidth={1.75} />
              Sort
            </Button>
            <Button variant="ghost" size="1" color="gray">
              <HugeiconsIcon icon={Settings01Icon} strokeWidth={1.75} />
              Settings
            </Button>
          </Flex>
        </PreviewBlock>
      </Flex>

      <Separator size="4" />

      {/* Example 7: Translucent Material */}
      <Flex direction="column" gap="4">
        <SectionHeader.Root>
          <SectionHeader.Content>
            <SectionHeader.Title>Translucent Material</SectionHeader.Title>
            <SectionHeader.Description>
              The translucent material creates depth over images and dynamic backgrounds. Soft buttons keep their text on the strong ink, so they stay readable on complex surfaces.
            </SectionHeader.Description>
          </SectionHeader.Content>
        </SectionHeader.Root>
        <PreviewBlock
          showThemeToggle={false}
          appearance="dark"
          background={{
            backgroundColor: 'hsl(220, 20%, 10%)',
            backgroundImage:
              'url(https://images.unsplash.com/photo-1677246791329-ed88ad9d49d7?q=80&w=2670&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D)',
            backgroundSize: 'cover',
            backgroundPosition: 'center',
          }}
          code={`<Theme appearance="dark" material="translucent">
  <Flex gap="2" align="center">
    <Button variant="soft" size="2">
      <HugeiconsIcon icon={PlayIcon} strokeWidth={1.75} />
      Watch Demo
    </Button>
    <Button variant="soft" size="2" color="gray">
      Learn More
    </Button>
  </Flex>
</Theme>`}
        >
          <Flex gap="2" align="center">
            <Button variant="soft" size="2" material="translucent">
              <HugeiconsIcon icon={PlayIcon} strokeWidth={1.75} />
              Watch Demo
            </Button>
            <Button variant="soft" size="2" color="gray" material="translucent">
              Learn More
            </Button>
          </Flex>
        </PreviewBlock>
      </Flex>
    </Flex>
  );
}
