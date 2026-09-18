'use client';

import { BlockDocPage } from '@/components/block-doc-page';
import type { BlockFile } from '@/lib/block-source';
import type { DocMetadata } from '@/lib/frontmatter';
import ContentMDX from './content.mdx';

interface CodeBlockPageClientProps {
  metadata?: DocMetadata;
  files: BlockFile[];
}

export default function CodeBlockPageClient({ metadata, files }: CodeBlockPageClientProps) {
  return (
    <BlockDocPage slug="code-block" files={files} metadata={metadata}>
      <ContentMDX />
    </BlockDocPage>
  );
}
