'use client';

import type { ReactNode } from 'react';
import { DocsPage, type DocsPageMeta } from '@/components/blocks/docs-page/docs-page';
import { SiteFooter } from '@/components/site-footer';

interface SiteDocsPageProps {
  children: ReactNode;
  meta?: DocsPageMeta;
  tableOfContents?: ReactNode;
  headerActions?: ReactNode;
  headerTabs?: ReactNode;
  header?: ReactNode;
  showCopyButton?: boolean;
}


/** DocsPage with this site's footer. */
export function SiteDocsPage(props: SiteDocsPageProps) {
  return <DocsPage {...props} footer={<SiteFooter />} />;
}
