'use client';

import { BlockDocPage } from '@/components/block-doc-page';
import type { BlockFile } from '@/lib/block-source';
import type { DocMetadata } from '@/lib/frontmatter';
import ContentMDX from './content.mdx';

interface DocsShellPageClientProps {
  metadata?: DocMetadata;
  files: BlockFile[];
}

export default function DocsShellPageClient({ metadata, files }: DocsShellPageClientProps) {
  return (
    <BlockDocPage slug="docs-shell" files={files} metadata={metadata}>
      <ContentMDX />
    </BlockDocPage>
  );
}
