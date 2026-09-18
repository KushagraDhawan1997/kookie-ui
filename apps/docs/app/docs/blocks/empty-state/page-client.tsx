'use client';

import { BlockDocPage } from '@/components/block-doc-page';
import type { BlockFile } from '@/lib/block-source';
import type { DocMetadata } from '@/lib/frontmatter';
import ContentMDX from './content.mdx';

interface EmptyStatePageClientProps {
  metadata?: DocMetadata;
  files: BlockFile[];
}

export default function EmptyStatePageClient({ metadata, files }: EmptyStatePageClientProps) {
  return (
    <BlockDocPage slug="empty-state" files={files} metadata={metadata}>
      <ContentMDX />
    </BlockDocPage>
  );
}
