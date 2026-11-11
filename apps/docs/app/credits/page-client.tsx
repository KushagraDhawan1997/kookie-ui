'use client';

import { SiteDocsPage } from '@/components/site-docs-page';
import ContentMDX from './content.mdx';
import type { DocMetadata } from '@/lib/frontmatter';

interface PageClientProps {
  metadata?: DocMetadata;
}

export default function PageClient({ metadata }: PageClientProps) {
  return (
    <SiteDocsPage meta={metadata}>
      <ContentMDX />
    </SiteDocsPage>
  );
}
