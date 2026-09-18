import { getCachedDocMetadata } from '@/lib/docs-metadata';
import { generateDocPageMetadata } from '@/lib/seo';
import { generateDocStructuredData } from '@/lib/structured-data';
import { getBlockFiles } from '@/lib/block-source';
import SectionHeaderPageClient from './page-client';
import type { Metadata } from 'next';

const PATHNAME = '/docs/blocks/section-header';

export async function generateMetadata(): Promise<Metadata> {
  const metadata = getCachedDocMetadata(PATHNAME);
  return metadata ? generateDocPageMetadata(metadata) : {};
}

export default function SectionHeaderPage() {
  const metadata = getCachedDocMetadata(PATHNAME);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: metadata ? generateDocStructuredData(metadata) : '{}' }}
      />
      <SectionHeaderPageClient metadata={metadata ?? undefined} files={getBlockFiles('section-header')} />
    </>
  );
}
