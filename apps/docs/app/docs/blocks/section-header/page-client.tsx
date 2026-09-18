'use client';

import { BlockDocPage } from '@/components/block-doc-page';
import type { BlockFile } from '@/lib/block-source';
import type { DocMetadata } from '@/lib/frontmatter';
import ContentMDX from './content.mdx';

interface SectionHeaderPageClientProps {
  metadata?: DocMetadata;
  files: BlockFile[];
}

export default function SectionHeaderPageClient({ metadata, files }: SectionHeaderPageClientProps) {
  return (
    <BlockDocPage slug="section-header" files={files} metadata={metadata}>
      <ContentMDX />
    </BlockDocPage>
  );
}
