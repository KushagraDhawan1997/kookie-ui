'use client';

import React from 'react';
import { TableOfContents } from "@/components/blocks/table-of-contents/table-of-contents";
import { SiteDocsPage } from "@/components/site-docs-page";
import ContentMDX from './shadows.mdx';
import type { DocMetadata } from "@/lib/frontmatter";

interface ShadowsPageClientProps {
  metadata?: DocMetadata;
}

export default function ShadowsPageClient({ metadata }: ShadowsPageClientProps) {
  return (
    <SiteDocsPage
      meta={metadata}
      tableOfContents={
        <TableOfContents renderContainer={(content) => content || null} />
      }
    >
      <ContentMDX />
    </SiteDocsPage>
  );
}
