'use client';

import * as React from 'react';
import { Button, Separator } from '@kushagradhawan/kookie-ui';
import { HugeiconsIcon } from '@hugeicons/react';
import { ArrowUpRight01Icon, Copy01Icon, Tick01Icon } from '@hugeicons/core-free-icons';
import { PageHeader } from '../page-header/page-header';
import { DocsShellPageActions } from '../docs-shell/docs-shell';
import type { DocsPageMeta } from './docs-page';

export interface DocsPageHeaderProps {
  meta: DocsPageMeta;
  /** Extra actions, placed before "Copy page". */
  actions?: React.ReactNode;
  /** Show a button that copies the page's text. @default true */
  showCopyButton?: boolean;
  /** Tabs under the header, e.g. Documentation and Examples. */
  tabs?: React.ReactNode;
  /** Rule under the header. Ignored when there are tabs, which draw their own. @default false */
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

/**
 * The title, the description and optional tabs. The page's actions go to the shell's top bar. There
 * is no category line: the sidebar already shows which section the page is in.
 */
export function DocsPageHeader({ meta, actions, showCopyButton = true, tabs, separator = false }: DocsPageHeaderProps) {
  const { copied, copy } = useCopyPage(meta);

  return (
    <PageHeader.Root gap="0">
      <DocsShellPageActions>
        {actions}
        {meta.source && (
          <Button asChild size="2" variant="ghost" color="gray">
            <a href={meta.source} target="_blank" rel="noreferrer">
              Source
              <HugeiconsIcon icon={ArrowUpRight01Icon} strokeWidth={1.75} />
            </a>
          </Button>
        )}
        {showCopyButton && (
          <Button size="2" variant="ghost" color="gray" onClick={copy}>
            <HugeiconsIcon icon={copied ? Tick01Icon : Copy01Icon} strokeWidth={1.75} />
            {copied ? 'Copied' : 'Copy page'}
          </Button>
        )}
      </DocsShellPageActions>

      <PageHeader.Content gap="5">
        <PageHeader.Title size={{ initial: '8', sm: '9' }}>{meta.title}</PageHeader.Title>
        {meta.description && (
          <PageHeader.Description size={{ initial: '3', sm: '4' }} emphasis="loud">{meta.description}</PageHeader.Description>
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
