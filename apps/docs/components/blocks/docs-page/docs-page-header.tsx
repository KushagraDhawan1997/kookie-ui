'use client';

import * as React from 'react';
import { Box, Separator, ToolbarButton, ToolbarFill } from '@kushagradhawan/kookie-ui';
import { HugeiconsIcon } from '@hugeicons/react';
import { SourceCodeIcon } from '@hugeicons/core-free-icons';
import { PageHeader } from '../page-header/page-header';
import { DOCS_PAGE_ACTIONS } from '../docs-shell/docs-shell';
import type { DocsPageMeta } from './docs-page';

export interface DocsPageHeaderProps {
  meta: DocsPageMeta;
  /** Extra actions at the end of the shell's top bar, before Source. Use `ToolbarButton`s so they join its arrow keys. */
  actions?: React.ReactNode;
  /**
   * @deprecated Copying moved to the docs toolbar (`components/page-toolbar`), which shows it on
   * every page that has a Markdown twin. Ignored.
   */
  showCopyButton?: boolean;
  /** Tabs under the header, e.g. Documentation and Examples. */
  tabs?: React.ReactNode;
  /** Rule under the header. Ignored when there are tabs, which draw their own. @default false */
  separator?: boolean;
}

/**
 * The title, the description and optional tabs. The page's actions go to the shell's top bar. There
 * is no category line: the sidebar already shows which section the page is in.
 */
export function DocsPageHeader({ meta, actions, tabs, separator = false }: DocsPageHeaderProps) {
  return (
    <PageHeader.Root gap="0">
      {/* Rendered inside the shell's top bar through its ToolbarSlot, so these join its
          arrow-key row and take its size. Outside a shell they render nothing. */}
      <ToolbarFill name={DOCS_PAGE_ACTIONS}>
        {actions}
        {meta.source && (
          <ToolbarButton asChild iconOnly aria-label="View source on GitHub" tooltip="Source" tooltipSide="bottom">
            <a href={meta.source} target="_blank" rel="noreferrer">
              <HugeiconsIcon icon={SourceCodeIcon} strokeWidth={1.75} />
            </a>
          </ToolbarButton>
        )}
      </ToolbarFill>

      <PageHeader.Content gap="6">
        <PageHeader.Title size={{ initial: '8', sm: '9' }}>{meta.title}</PageHeader.Title>
        {meta.description && (
          <PageHeader.Description size={{ initial: '3', sm: '4' }} emphasis="loud">{meta.description}</PageHeader.Description>
        )}
      </PageHeader.Content>

      {tabs ? (
        <PageHeader.Tabs mt="7">{tabs}</PageHeader.Tabs>
      ) : (
        separator && (
          <Box mt="7">
            <Separator />
          </Box>
        )
      )}
    </PageHeader.Root>
  );
}
