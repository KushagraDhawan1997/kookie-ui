'use client';

import type { ComponentPropsWithoutRef } from 'react';
import { Chip } from '@kushagradhawan/kookie-ui';
import { SiteDocsPage } from '@/components/site-docs-page';
import { createMarkdownComponents } from '@/components/blocks/markdown/markdown';
import ContentMDX from './content.mdx';
import type { DocMetadata } from '@/lib/frontmatter';

interface PageClientProps {
  metadata?: DocMetadata;
}

// Built once, like the site's own renderers, so the page does not remount on every update.
const { code: MarkdownCode } = createMarkdownComponents();
const TIERS = new Set(['Major', 'Minor', 'Quiet']);

/** The tier words before each item render as a chip; any other inline code renders as usual. */
function TierCode(props: ComponentPropsWithoutRef<'code'>) {
  const { children } = props;
  if (typeof children === 'string' && TIERS.has(children)) {
    return (
      <Chip size="1" variant="soft" color="gray">
        {children}
      </Chip>
    );
  }
  if (!MarkdownCode || typeof MarkdownCode === 'string') return <code {...props} />;
  return <MarkdownCode {...props} />;
}

const components = { code: TierCode };

export default function PageClient({ metadata }: PageClientProps) {
  return (
    <SiteDocsPage meta={metadata}>
      <ContentMDX components={components} />
    </SiteDocsPage>
  );
}
