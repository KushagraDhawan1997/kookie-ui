'use client';

import { TableOfContents } from '@/components/blocks/table-of-contents/table-of-contents';
import { HugeiconsIcon } from '@hugeicons/react';
import { BookOpen01Icon, EyeIcon } from '@hugeicons/core-free-icons';
import { SiteDocsPage } from '@/components/site-docs-page';
import ContentMDX from './content.mdx';
import { DropdownMenuExamples } from './examples';
import type { DocMetadata } from '@/lib/frontmatter';

interface PageClientProps {
  metadata?: DocMetadata;
}

export default function PageClient({ metadata }: PageClientProps) {
  return (
    <SiteDocsPage
      meta={metadata}
      views={[
        { value: 'docs', label: 'Documentation', icon: <HugeiconsIcon icon={BookOpen01Icon} strokeWidth={1.75} />, content: <ContentMDX /> },
        { value: 'examples', label: 'Examples', icon: <HugeiconsIcon icon={EyeIcon} strokeWidth={1.75} />, content: <DropdownMenuExamples /> },
      ]}
      tableOfContents={<TableOfContents renderContainer={(content) => content || null} />}
    />
  );
}
