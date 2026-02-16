import React from 'react';
import { getCachedDocMetadata } from '@/lib/docs-metadata';
import { generateDocPageMetadata } from '@/lib/seo';
import { generateDocStructuredData } from '@/lib/structured-data';
import ColorsPageClient from './page-client';
import type { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  const metadata = getCachedDocMetadata('/docs/colors');

  if (!metadata) {
    return {};
  }

  return generateDocPageMetadata(metadata);
}

export default function ColorsPage() {
  const metadata = getCachedDocMetadata('/docs/colors');

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: metadata ? generateDocStructuredData(metadata) : '{}',
        }}
      />
      <ColorsPageClient metadata={metadata || undefined} />
    </>
  );
}
