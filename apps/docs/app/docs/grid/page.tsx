import React from 'react';
import { getCachedDocMetadata } from '@/lib/docs-metadata';
import { generateDocPageMetadata } from '@/lib/seo';
import { generateDocStructuredData } from '@/lib/structured-data';
import GridPageClient from './page-client';
import type { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  const metadata = getCachedDocMetadata('/docs/grid');

  if (!metadata) {
    return {};
  }

  return generateDocPageMetadata(metadata);
}

export default function GridPage() {
  const metadata = getCachedDocMetadata('/docs/grid');

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: metadata ? generateDocStructuredData(metadata) : '{}',
        }}
      />
      <GridPageClient metadata={metadata || undefined} />
    </>
  );
}
