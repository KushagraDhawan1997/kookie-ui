'use client';

import type { ReactNode } from 'react';
import { DocsPage, type DocsPageMeta, type DocsPageView } from '@/components/blocks/docs-page/docs-page';
import { SiteFooter } from '@/components/site-footer';

interface SiteDocsPageProps {
  children?: ReactNode;
  /** Several views of one page, as tabs under the header. See `DocsPage`. */
  views?: DocsPageView[];
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
