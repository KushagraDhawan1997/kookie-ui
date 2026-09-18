'use client';

import { BlockDocPage } from '@/components/block-doc-page';
import type { BlockFile } from '@/lib/block-source';
import type { DocMetadata } from '@/lib/frontmatter';
import ContentMDX from './content.mdx';

interface TestimonialPageClientProps {
  metadata?: DocMetadata;
  files: BlockFile[];
}

export default function TestimonialPageClient({ metadata, files }: TestimonialPageClientProps) {
  return (
    <BlockDocPage slug="testimonial" files={files} metadata={metadata}>
      <ContentMDX />
    </BlockDocPage>
  );
}
