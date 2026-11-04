import React from 'react';
import { getCachedDocMetadata } from '@/lib/docs-metadata';
import { generateDocPageMetadata } from '@/lib/seo';
import { generateDocStructuredData } from '@/lib/structured-data';
import FlexPageClient from './page-client';
import type { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  const metadata = getCachedDocMetadata('/docs/flex');

  if (!metadata) {
    return {};
  }

  return generateDocPageMetadata(metadata);
}

export default function FlexPage() {
  const metadata = getCachedDocMetadata('/docs/flex');

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: metadata ? generateDocStructuredData(metadata) : '{}',
        }}
      />
      <FlexPageClient metadata={metadata || undefined} />
    </>
  );
}
