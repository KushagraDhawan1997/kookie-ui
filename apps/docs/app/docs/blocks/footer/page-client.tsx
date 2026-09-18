'use client';

import { BlockDocPage } from '@/components/block-doc-page';
import type { BlockFile } from '@/lib/block-source';
import type { DocMetadata } from '@/lib/frontmatter';
import ContentMDX from './content.mdx';

interface FooterPageClientProps {
  metadata?: DocMetadata;
  files: BlockFile[];
}

export default function FooterPageClient({ metadata, files }: FooterPageClientProps) {
  return (
    <BlockDocPage slug="footer" files={files} metadata={metadata}>
      <ContentMDX />
    </BlockDocPage>
  );
}
