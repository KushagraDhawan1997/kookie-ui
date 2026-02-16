import React from 'react';
import { getCachedDocMetadata } from '@/lib/docs-metadata';
import { generateDocPageMetadata } from '@/lib/seo';
import { generateDocStructuredData } from '@/lib/structured-data';
import SegmentedControlPageClient from './page-client';
import type { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  const metadata = getCachedDocMetadata('/docs/segmented-control');

  if (!metadata) {
    return {};
  }

  return generateDocPageMetadata(metadata);
}

export default function SegmentedControlPage() {
  const metadata = getCachedDocMetadata('/docs/segmented-control');

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: metadata ? generateDocStructuredData(metadata) : '{}',
        }}
      />
      <SegmentedControlPageClient metadata={metadata || undefined} />
    </>
  );
}
