'use client';

import * as React from 'react';
import { PreviewBlock } from '@/components/blocks/preview-block/preview-block';
import { SectionHeader } from '@/components/blocks/section-header/section-header';
import { Flex, Card, Text, Heading, Button, Inset, Image } from '@kushagradhawan/kookie-ui';
import { HugeiconsIcon } from '@hugeicons/react';
import { ArrowRight01Icon } from '@hugeicons/core-free-icons';

const IMAGE_URL = 'https://images.unsplash.com/photo-1745613944320-1f14580bb0db?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1yZWxhdGVkfDQ5fHx8ZW58MHx8fHx8';

export function CardExamples() {
  return (
    <Flex direction="column" gap="10">
      {/* Example 1: Content Card with Media */}
      <Flex direction="column" gap="5">
        <SectionHeader.Root>
          <SectionHeader.Content>
            <SectionHeader.Title>Content Card</SectionHeader.Title>
            <SectionHeader.Description>
              Use Inset for edge-to-edge media placement within cards. The raised variant provides subtle elevation, with solid buttons for clear hierarchy.
            </SectionHeader.Description>
          </SectionHeader.Content>
        </SectionHeader.Root>
        <PreviewBlock
          background="dots"
          code={`<Card variant="raised" size="2" style={{ maxWidth: 320 }}>
  <Flex direction="column">
    <Inset clip="padding-box" side="top" pb="current">
      <Image
        src="/path/to/image.jpg"
        alt="Card media"
        radius="none"
        style={{ height: 320, objectFit: 'cover' }}
      />
    </Inset>
    <Flex direction="column" gap="5" p="3">
      <Flex direction="column" gap="3">
        <Heading size="6" weight="medium">Getting Started</Heading>
        <Text size="3" emphasis="medium">
          Learn the fundamentals of building modern interfaces
          with our comprehensive guide.
        </Text>
      </Flex>
      <Button variant="solid" size="2" color="gray">
        Read More
        <HugeiconsIcon icon={ArrowRight01Icon} strokeWidth={1.75} />
      </Button>
    </Flex>
  </Flex>
</Card>`}
        >
          <Card variant="raised" size="2" style={{ maxWidth: 320 }}>
            <Flex direction="column">
              <Inset clip="padding-box" side="top" pb="current">
                <Image
                  src={IMAGE_URL}
                  alt="Abstract gradient"
                  radius="none"
                  style={{
                    height: 320,
                    objectFit: 'cover',
                  }}
                />
              </Inset>
              <Flex direction="column" gap="5" p="3">
                <Flex direction="column" gap="3">
                  <Heading size="6" weight="medium">
                    Getting Started
                  </Heading>
                  <Text size="3" emphasis="medium">
                    Learn the fundamentals of building modern interfaces with our comprehensive guide.
                  </Text>
                </Flex>
                <Button variant="solid" size="2" color="gray">
                  Read More
                  <HugeiconsIcon icon={ArrowRight01Icon} strokeWidth={1.75} />
                </Button>
              </Flex>
            </Flex>
          </Card>
        </PreviewBlock>
      </Flex>
    </Flex>
  );
}
