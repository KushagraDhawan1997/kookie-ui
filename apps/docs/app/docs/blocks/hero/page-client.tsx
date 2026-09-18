'use client';

import { BlockDocPage } from '@/components/block-doc-page';
import type { BlockFile } from '@/lib/block-source';
import type { DocMetadata } from '@/lib/frontmatter';
import ContentMDX from './content.mdx';

interface HeroPageClientProps {
  metadata?: DocMetadata;
  files: BlockFile[];
}

export default function HeroPageClient({ metadata, files }: HeroPageClientProps) {
  return (
    <BlockDocPage slug="hero" files={files} metadata={metadata}>
      <ContentMDX />
    </BlockDocPage>
  );
}
