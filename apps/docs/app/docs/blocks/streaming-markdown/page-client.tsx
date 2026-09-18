'use client';

import { BlockDocPage } from '@/components/block-doc-page';
import type { BlockFile } from '@/lib/block-source';
import type { DocMetadata } from '@/lib/frontmatter';
import ContentMDX from './content.mdx';

interface StreamingMarkdownPageClientProps {
  metadata?: DocMetadata;
  files: BlockFile[];
}

export default function StreamingMarkdownPageClient({ metadata, files }: StreamingMarkdownPageClientProps) {
  return (
    <BlockDocPage slug="streaming-markdown" files={files} metadata={metadata}>
      <ContentMDX />
    </BlockDocPage>
  );
}
