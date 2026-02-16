import React from 'react';
import { getCachedDocMetadata } from '@/lib/docs-metadata';
import { generateDocPageMetadata } from '@/lib/seo';
import { generateDocStructuredData } from '@/lib/structured-data';
import ConstantsPageClient from './page-client';
import type { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  const metadata = getCachedDocMetadata('/docs/constants');

  if (!metadata) {
    return {};
  }

  return generateDocPageMetadata(metadata);
}

export default function ConstantsPage() {
  const metadata = getCachedDocMetadata('/docs/constants');

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: metadata ? generateDocStructuredData(metadata) : '{}',
        }}
      />
      <ConstantsPageClient metadata={metadata || undefined} />
    </>
  );
}
