import { getCachedDocMetadata } from '@/lib/docs-metadata';
import { generateDocPageMetadata } from '@/lib/seo';
import { generateDocStructuredData } from '@/lib/structured-data';
import { getBlockFiles } from '@/lib/block-source';
import HeroPageClient from './page-client';
import type { Metadata } from 'next';

const PATHNAME = '/docs/blocks/hero';

export async function generateMetadata(): Promise<Metadata> {
  const metadata = getCachedDocMetadata(PATHNAME);
  return metadata ? generateDocPageMetadata(metadata) : {};
}

export default function HeroPage() {
  const metadata = getCachedDocMetadata(PATHNAME);

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: metadata ? generateDocStructuredData(metadata) : '{}' }}
      />
      <HeroPageClient metadata={metadata ?? undefined} files={getBlockFiles('hero')} />
    </>
  );
}
