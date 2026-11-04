import React from 'react';
import { getCachedDocMetadata } from '@/lib/docs-metadata';
import { generateDocPageMetadata } from '@/lib/seo';
import { generateDocStructuredData } from '@/lib/structured-data';
import SliderPageClient from './page-client';
import type { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  const metadata = getCachedDocMetadata('/docs/slider');

  if (!metadata) {
    return {};
  }

  return generateDocPageMetadata(metadata);
}

export default function SliderPage() {
  const metadata = getCachedDocMetadata('/docs/slider');

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: metadata ? generateDocStructuredData(metadata) : '{}',
        }}
      />
      <SliderPageClient metadata={metadata || undefined} />
    </>
  );
}
