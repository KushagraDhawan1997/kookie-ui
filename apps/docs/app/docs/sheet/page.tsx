import React from 'react';
import { getCachedDocMetadata } from '@/lib/docs-metadata';
import { generateDocPageMetadata } from '@/lib/seo';
import { generateDocStructuredData } from '@/lib/structured-data';
import SheetPageClient from './page-client';
import type { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  const metadata = getCachedDocMetadata('/docs/sheet');

  if (!metadata) {
    return {};
  }

  return generateDocPageMetadata(metadata);
}

export default function SheetPage() {
  const metadata = getCachedDocMetadata('/docs/sheet');

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: metadata ? generateDocStructuredData(metadata) : '{}',
        }}
      />
      <SheetPageClient metadata={metadata || undefined} />
    </>
  );
}
