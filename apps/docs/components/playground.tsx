'use client';

import React, { useEffect, useState } from 'react';
import NextImage from 'next/image';
import { Flex, Theme, Button, Box, Text, SegmentedControl, Popover, IconButton, Image } from '@kushagradhawan/kookie-ui';
import { HugeiconsIcon } from '@hugeicons/react';
import { Copy01Icon, Sun01Icon, Moon02Icon, SlidersHorizontalIcon, Tick01Icon } from '@hugeicons/core-free-icons';
import '@/components/blocks/preview-block/preview-block.css';
import { PropertyControl } from './property-control';

interface PlaygroundProps {
  /**
   * The component to render in the preview area
   */
  component: React.ReactNode;

  /**
   * The code string to display in the copy button
   */
  code: string;

  /**
   * Property control items for the right side
   */
  items: Array<
    | {
        id: string;
        label: string;
        type: 'select';
        value: string;
        onChange: (value: string) => void;
        options: Array<{ label: string; value: string }>;
        placeholder?: string;
        appearance?: 'swatch';
      }
    | {
        id: string;
        label: string;
        type: 'switch';
        value: boolean;
        onChange: (checked: boolean) => void;
      }
  >;

  /**
   * Show background image/pattern to demonstrate material prop effects
   */
  showBackground?: boolean;

  /**
   * Optional hint message to display below the preview
   */
  hint?: string;

  /**
   * Show property controls panel (default: false)
   */
  showControls?: boolean;

  /**
   * Show toolbar with copy button and theme toggle (default: true)
   */
  showToolbar?: boolean;

  /**
   * Stage height (default: 22rem)
   */
  height?: string;
}

export default function Playground({ component, code, items, showBackground = false, hint, showControls = false, showToolbar = true, height = '22rem' }: PlaygroundProps) {
  const [copied, setCopied] = useState(false);
  const [appearance, setAppearance] = useState<'light' | 'dark'>('light');

  useEffect(() => {
    if (!copied) return;
    const timeout = window.setTimeout(() => setCopied(false), 2000);
    return () => window.clearTimeout(timeout);
  }, [copied]);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
    } catch (error) {
      console.error('Failed to copy code:', error);
    }
  };

  return (
    <Flex direction={{ initial: 'column', md: showControls ? 'row' : 'column' }} gap="3" align="start">
      {/* Same frame as PreviewBlock, so playgrounds and examples read alike. */}
      <Flex direction="column" gap="2" width="100%" minWidth="0">
        <div className="preview-block">
          {showToolbar && (
            <div className="preview-block-toolbar">
              <Button size="1" variant="ghost" color="gray" highContrast onClick={handleCopy}>
                <HugeiconsIcon icon={copied ? Tick01Icon : Copy01Icon} strokeWidth={1.75} />
                {copied ? 'Copied' : 'Copy code'}
              </Button>
              <Flex gap="2" align="center" ml="auto">
                <SegmentedControl.Root size="1" value={appearance} onValueChange={(value) => setAppearance(value === 'dark' ? 'dark' : 'light')}>
                  <SegmentedControl.Item value="light" iconOnly aria-label="Light preview">
                    <HugeiconsIcon icon={Sun01Icon} strokeWidth={1.75} />
                  </SegmentedControl.Item>
                  <SegmentedControl.Item value="dark" iconOnly aria-label="Dark preview">
                    <HugeiconsIcon icon={Moon02Icon} strokeWidth={1.75} />
                  </SegmentedControl.Item>
                </SegmentedControl.Root>
                {!showControls && (
                  <Popover.Root>
                    <Popover.Trigger>
                      <IconButton size="1" variant="ghost" highContrast color="gray" aria-label="Properties">
                        <HugeiconsIcon icon={SlidersHorizontalIcon} strokeWidth={1.75} />
                      </IconButton>
                    </Popover.Trigger>
                    <Popover.Content size="1" side="bottom" align="end" width="280px">
                      <PropertyControl.Group width="100%" items={items} />
                    </Popover.Content>
                  </Popover.Root>
                )}
              </Flex>
            </div>
          )}

          <Theme appearance={appearance} fontFamily="sans" hasBackground className="preview-block-theme">
            <div className="preview-block-stage" style={{ position: 'relative', height }}>
              {showBackground && (
                <Image as={NextImage} src="/playground/image.jpg" alt="" fill sizes="100vw" style={{ objectFit: 'cover' }} />
              )}
              <Flex position="relative" align="center" justify="center">
                {component}
              </Flex>
            </div>
          </Theme>
        </div>

        {hint && (
          <Text size="1" color="gray">
            {hint}
          </Text>
        )}
      </Flex>

      {showControls && (
        <Box width={{ initial: '100%', md: '256px' }} flexShrink="0">
          <PropertyControl.Group width="100%" items={items} />
        </Box>
      )}
    </Flex>
  );
}
