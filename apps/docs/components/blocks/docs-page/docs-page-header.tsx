'use client';

import * as React from 'react';
import { Button, Flex, Separator, Text } from '@kushagradhawan/kookie-ui';
import { HugeiconsIcon } from '@hugeicons/react';
import { ArrowUpRight01Icon, Copy01Icon, Tick01Icon } from '@hugeicons/core-free-icons';
import { PageHeader } from '../page-header/page-header';
import type { DocsPageMeta } from './docs-page';

export interface DocsPageHeaderProps {
  meta: DocsPageMeta;
  /** Extra actions, placed before "Copy page". */
  actions?: React.ReactNode;
  /** Show a button that copies the page's text. @default true */
  showCopyButton?: boolean;
  /** Tabs under the header, e.g. Documentation and Examples. */
  tabs?: React.ReactNode;
  /** Rule under the header. Ignored when there are tabs, which draw their own. @default true */
  separator?: boolean;
}

function useCopyPage(meta: DocsPageMeta) {
  const [copied, setCopied] = React.useState(false);

  React.useEffect(() => {
    if (!copied) return;
    const timeout = window.setTimeout(() => setCopied(false), 2000);
    return () => window.clearTimeout(timeout);
  }, [copied]);

  const copy = async () => {
    const contentArea = document.querySelector('[data-content-area]');
    if (!contentArea) return;

    const parts = [`# ${meta.title}`];
    if (meta.description) parts.push(meta.description);
    if (meta.source) parts.push(`Source: ${meta.source}`);
    parts.push((contentArea.textContent ?? '').trim());

    try {
      await navigator.clipboard.writeText(parts.join('\n\n'));
      setCopied(true);
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('[DocsPageHeader] Failed to copy page:', error);
      }
    }
  };

  return { copied, copy };
}

/** Category and actions on one row, then the title, the lead and optional tabs. */
export function DocsPageHeader({ meta, actions, showCopyButton = true, tabs, separator = true }: DocsPageHeaderProps) {
  const { copied, copy } = useCopyPage(meta);

  return (
    <PageHeader.Root gap="0">
      <Flex align="center" justify="between" gap="3" minHeight="var(--space-6)">
        <Text size="2" color="gray" weight="medium">
          {meta.category}
        </Text>
        <Flex align="center" gap="4">
          {actions}
          {meta.source && (
            <Button asChild size="1" variant="ghost" color="gray" highContrast>
              <a href={meta.source} target="_blank" rel="noreferrer">
                Source
                <HugeiconsIcon icon={ArrowUpRight01Icon} strokeWidth={1.75} />
              </a>
            </Button>
          )}
          {showCopyButton && (
            <Button size="1" variant="ghost" color="gray" highContrast onClick={copy}>
              <HugeiconsIcon icon={copied ? Tick01Icon : Copy01Icon} strokeWidth={1.75} />
              {copied ? 'Copied' : 'Copy page'}
            </Button>
          )}
        </Flex>
      </Flex>

      <PageHeader.Content gap="3" mt="4">
        <PageHeader.Title size={{ initial: '8', sm: '9' }}>{meta.title}</PageHeader.Title>
        {meta.description && (
          <PageHeader.Description size={{ initial: '3', sm: '4' }}>{meta.description}</PageHeader.Description>
        )}
      </PageHeader.Content>

      {tabs ? (
        <PageHeader.Tabs mt="6">{tabs}</PageHeader.Tabs>
      ) : (
        separator && <Separator size="4" mt="6" />
      )}
    </PageHeader.Root>
  );
}
