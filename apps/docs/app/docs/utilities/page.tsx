import React from 'react';
import { getCachedDocMetadata } from '@/lib/docs-metadata';
import { generateDocPageMetadata } from '@/lib/seo';
import { generateDocStructuredData } from '@/lib/structured-data';
import UtilitiesPageClient from './page-client';
import type { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  const metadata = getCachedDocMetadata('/docs/utilities');

  if (!metadata) {
    return {};
  }

  return generateDocPageMetadata(metadata);
}

export default function UtilitiesPage() {
  const metadata = getCachedDocMetadata('/docs/utilities');

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: metadata ? generateDocStructuredData(metadata) : '{}',
        }}
      />
      <UtilitiesPageClient metadata={metadata || undefined} />
    </>
  );
}
