import React from 'react';
import { getCachedDocMetadata } from '@/lib/docs-metadata';
import { generateDocPageMetadata } from '@/lib/seo';
import { generateDocStructuredData } from '@/lib/structured-data';
import KbdPageClient from './page-client';
import type { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  const metadata = getCachedDocMetadata('/docs/kbd');

  if (!metadata) {
    return {};
  }

  return generateDocPageMetadata(metadata);
}

export default function KbdPage() {
  const metadata = getCachedDocMetadata('/docs/kbd');

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: metadata ? generateDocStructuredData(metadata) : '{}',
        }}
      />
      <KbdPageClient metadata={metadata || undefined} />
    </>
  );
}
