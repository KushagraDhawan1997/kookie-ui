'use client';

import { BlockDocPage } from '@/components/block-doc-page';
import type { BlockFile } from '@/lib/block-source';
import type { DocMetadata } from '@/lib/frontmatter';
import ContentMDX from './content.mdx';

interface PageHeaderPageClientProps {
  metadata?: DocMetadata;
  files: BlockFile[];
}

export default function PageHeaderPageClient({ metadata, files }: PageHeaderPageClientProps) {
  return (
    <BlockDocPage slug="page-header" files={files} metadata={metadata}>
      <ContentMDX />
    </BlockDocPage>
  );
}
