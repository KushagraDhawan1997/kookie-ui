'use client';

import { TableOfContents } from '@/components/blocks/table-of-contents/table-of-contents';
import { SiteDocsPage } from '@/components/site-docs-page';
import type { DocMetadata } from '@/lib/frontmatter';
import ContentMDX from './content.mdx';

interface BlocksPageClientProps {
  metadata?: DocMetadata;
}

export default function BlocksPageClient({ metadata }: BlocksPageClientProps) {
  return (
    <SiteDocsPage meta={metadata} tableOfContents={<TableOfContents />}>
      <ContentMDX />
    </SiteDocsPage>
  );
}
