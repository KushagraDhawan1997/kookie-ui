import React from 'react';
import { getCachedDocMetadata } from '@/lib/docs-metadata';
import { generateDocPageMetadata } from '@/lib/seo';
import { generateDocStructuredData } from '@/lib/structured-data';
import ImagePageClient from './page-client';
import type { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  const metadata = getCachedDocMetadata('/docs/image');

  if (!metadata) {
    return {};
  }

  return generateDocPageMetadata(metadata);
}

export default function ImagePage() {
  const metadata = getCachedDocMetadata('/docs/image');

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: metadata ? generateDocStructuredData(metadata) : '{}',
        }}
      />
      <ImagePageClient metadata={metadata || undefined} />
    </>
  );
}
