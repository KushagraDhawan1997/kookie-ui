import React from 'react';
import { getCachedDocMetadata } from '@/lib/docs-metadata';
import { generateDocPageMetadata } from '@/lib/seo';
import { generateDocStructuredData } from '@/lib/structured-data';
import ProgressPageClient from './page-client';
import type { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  const metadata = getCachedDocMetadata('/docs/progress');

  if (!metadata) {
    return {};
  }

  return generateDocPageMetadata(metadata);
}

export default function ProgressPage() {
  const metadata = getCachedDocMetadata('/docs/progress');

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: metadata ? generateDocStructuredData(metadata) : '{}',
        }}
      />
      <ProgressPageClient metadata={metadata || undefined} />
    </>
  );
}
