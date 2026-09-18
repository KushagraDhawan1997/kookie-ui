import { getCachedDocMetadata } from '@/lib/docs-metadata';
import { generateDocPageMetadata } from '@/lib/seo';
import { generateDocStructuredData } from '@/lib/structured-data';
import { getBlockFiles } from '@/lib/block-source';
import PageHeaderPageClient from './page-client';
import type { Metadata } from 'next';

const PATHNAME = '/docs/blocks/page-header';

export async function generateMetadata(): Promise<Metadata> {
  const metadata = getCachedDocMetadata(PATHNAME);
  return metadata ? generateDocPageMetadata(metadata) : {};
}

export default function PageHeaderPage() {
  const metadata = getCachedDocMetadata(PATHNAME);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: metadata ? generateDocStructuredData(metadata) : '{}' }}
      />
      <PageHeaderPageClient metadata={metadata ?? undefined} files={getBlockFiles('page-header')} />
    </>
  );
}
