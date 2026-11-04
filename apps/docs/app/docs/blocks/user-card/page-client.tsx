'use client';

import { BlockDocPage } from '@/components/block-doc-page';
import type { BlockFile } from '@/lib/block-source';
import type { DocMetadata } from '@/lib/frontmatter';
import ContentMDX from './content.mdx';

interface UserCardPageClientProps {
  metadata?: DocMetadata;
  files: BlockFile[];
}

export default function UserCardPageClient({ metadata, files }: UserCardPageClientProps) {
  return (
    <BlockDocPage slug="user-card" files={files} metadata={metadata}>
      <ContentMDX />
    </BlockDocPage>
  );
}
