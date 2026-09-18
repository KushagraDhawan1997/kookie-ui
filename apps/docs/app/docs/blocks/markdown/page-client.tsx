'use client';

import { BlockDocPage } from '@/components/block-doc-page';
import type { BlockFile } from '@/lib/block-source';
import type { DocMetadata } from '@/lib/frontmatter';
import ContentMDX from './content.mdx';

interface MarkdownPageClientProps {
  metadata?: DocMetadata;
  files: BlockFile[];
}

export default function MarkdownPageClient({ metadata, files }: MarkdownPageClientProps) {
  return (
    <BlockDocPage slug="markdown" files={files} metadata={metadata}>
      <ContentMDX />
    </BlockDocPage>
  );
}
