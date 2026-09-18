'use client';

import { BlockDocPage } from '@/components/block-doc-page';
import type { BlockFile } from '@/lib/block-source';
import type { DocMetadata } from '@/lib/frontmatter';
import ContentMDX from './content.mdx';

interface TableOfContentsPageClientProps {
  metadata?: DocMetadata;
  files: BlockFile[];
}

export default function TableOfContentsPageClient({ metadata, files }: TableOfContentsPageClientProps) {
  return (
    <BlockDocPage slug="table-of-contents" files={files} metadata={metadata}>
      <ContentMDX />
    </BlockDocPage>
  );
}
