'use client';

import * as React from 'react';
import { Button, Link, Text } from '@kushagradhawan/kookie-ui';
import { HugeiconsIcon } from '@hugeicons/react';
import { Copy01Icon, Tick01Icon } from '@hugeicons/core-free-icons';
import { PageHeader } from '../page-header/page-header';
import type { DocsPageMeta } from './docs-page';

type Space = '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9';

export interface DocsPageHeaderProps {
  meta: DocsPageMeta;
  /** Extra actions beside the title. */
  actions?: React.ReactNode;
  /** Show a button that copies the page as markdown-ish text. @default true */
  showCopyButton?: boolean;
  /** Tabs rendered under the header. */
  tabs?: React.ReactNode;
  /** @default "4" */
  contentGap?: Space;
  /** @default "4" */
  rootGap?: Space;
  separator?: boolean;
}

export function DocsPageHeader({
  meta,
  actions,
  showCopyButton = true,
  tabs,
  contentGap = '4',
  rootGap = '4',
  separator = false,
}: DocsPageHeaderProps) {
  const [copied, setCopied] = React.useState(false);

  React.useEffect(() => {
    if (!copied) return;
    const timeout = window.setTimeout(() => setCopied(false), 2000);
    return () => window.clearTimeout(timeout);
  }, [copied]);

  const handleCopyPage = async () => {
    const contentArea = document.querySelector('[data-content-area]');
    if (!contentArea) return;

    const parts = [`# ${meta.title}`];
    if (meta.description) parts.push(meta.description);
    if (meta.source) parts.push(`[View source](${meta.source})`);
    parts.push('---', (contentArea.textContent ?? '').trim());

    try {
      await navigator.clipboard.writeText(parts.join('\n\n'));
      setCopied(true);
    } catch (error) {
      if (process.env.NODE_ENV === 'development') {
        console.error('[DocsPageHeader] Failed to copy page:', error);
      }
    }
  };

  return (
    <PageHeader.Root gap={rootGap} separator={separator}>
      <PageHeader.Content gap={contentGap}>
        {meta.category && (
          <PageHeader.Meta>
            <Text size="2" weight="medium">
              {meta.category}
            </Text>
          </PageHeader.Meta>
        )}
        <PageHeader.Main layout={{ initial: 'stacked', md: 'inline' }} align={{ initial: 'start', md: 'center' }}>
          <PageHeader.Title>{meta.title}</PageHeader.Title>
          <PageHeader.Actions gap="4">
            {actions}
            {showCopyButton && (
              <Button size="2" variant="ghost" color="gray" highContrast onClick={handleCopyPage}>
                <HugeiconsIcon icon={copied ? Tick01Icon : Copy01Icon} strokeWidth={1.75} />
                {copied ? 'Copied' : 'Copy page'}
              </Button>
            )}
          </PageHeader.Actions>
        </PageHeader.Main>
        {meta.description && <PageHeader.Description size="3">{meta.description}</PageHeader.Description>}
        {meta.source && (
          <Link size="3" href={meta.source} target="_blank" rel="noreferrer" color="gray" highContrast>
            View source →
          </Link>
        )}
      </PageHeader.Content>
      {tabs && <PageHeader.Tabs mt="4">{tabs}</PageHeader.Tabs>}
    </PageHeader.Root>
  );
}
