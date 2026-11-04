import React from 'react';
import { getCachedDocMetadata } from '@/lib/docs-metadata';
import { generateDocPageMetadata } from '@/lib/seo';
import { generateDocStructuredData } from '@/lib/structured-data';
import LinkPageClient from './page-client';
import type { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  const metadata = getCachedDocMetadata('/docs/link');

  if (!metadata) {
    return {};
  }

  return generateDocPageMetadata(metadata);
}

export default function LinkPage() {
  const metadata = getCachedDocMetadata('/docs/link');

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: metadata ? generateDocStructuredData(metadata) : '{}',
        }}
      />
      <LinkPageClient metadata={metadata || undefined} />
    </>
  );
}
