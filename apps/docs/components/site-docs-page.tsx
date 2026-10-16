'use client';

import type { ReactNode } from 'react';
import { DocsPage, type DocsPageMeta } from '@/components/blocks/docs-page/docs-page';

interface SiteDocsPageProps {
  children: ReactNode;
  meta?: DocsPageMeta;
  tableOfContents?: ReactNode;
  headerActions?: ReactNode;
  headerTabs?: ReactNode;
  header?: ReactNode;
  showCopyButton?: boolean;
}

const FOOTER = {
  name: 'Kushagra Dhawan',
  url: 'https://www.kushagradhawan.com',
  githubUrl: 'https://github.com/KushagraDhawan1997/kookie-ui',
};

/** DocsPage with this site's footer. */
export function SiteDocsPage(props: SiteDocsPageProps) {
  return <DocsPage {...props} footer={FOOTER} />;
}
