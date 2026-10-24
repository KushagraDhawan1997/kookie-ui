import React from 'react';
import { getCachedDocMetadata } from '@/lib/docs-metadata';
import { generateDocPageMetadata } from '@/lib/seo';
import { generateDocStructuredData } from '@/lib/structured-data';
import SpinnerPageClient from './page-client';
import type { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  const metadata = getCachedDocMetadata('/docs/spinner');

  if (!metadata) {
    return {};
  }

  return generateDocPageMetadata(metadata);
}

export default function SpinnerPage() {
  const metadata = getCachedDocMetadata('/docs/spinner');

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: metadata ? generateDocStructuredData(metadata) : '{}',
        }}
      />
      <SpinnerPageClient metadata={metadata || undefined} />
    </>
  );
}
