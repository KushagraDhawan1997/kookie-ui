'use client';

import { BlockDocPage } from '@/components/block-doc-page';
import type { BlockFile } from '@/lib/block-source';
import type { DocMetadata } from '@/lib/frontmatter';
import ContentMDX from './content.mdx';

interface DocsPagePageClientProps {
  metadata?: DocMetadata;
  files: BlockFile[];
}

export default function DocsPagePageClient({ metadata, files }: DocsPagePageClientProps) {
  return (
    <BlockDocPage slug="docs-page" files={files} metadata={metadata}>
      <ContentMDX />
    </BlockDocPage>
  );
}
