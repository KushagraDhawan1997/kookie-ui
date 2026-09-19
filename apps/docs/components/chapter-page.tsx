'use client';

import { TableOfContents } from '@/components/blocks/table-of-contents/table-of-contents';
import { SiteDocsPage } from '@/components/site-docs-page';
import { CHAPTER_CONTENT } from '@/lib/chapter-content';
import type { DocMetadata } from '@/lib/frontmatter';

/** A chapter: the site's docs page with its table of contents. Every chapter renders through this. */
export function ChapterPage({ slug, metadata }: { slug: string; metadata: DocMetadata }) {
  const Content = CHAPTER_CONTENT[slug];
  return (
    <SiteDocsPage meta={metadata} tableOfContents={<TableOfContents renderContainer={(content) => content || null} />}>
      <Content />
    </SiteDocsPage>
  );
}
