import React from 'react';
import { getCachedDocMetadata } from '@/lib/docs-metadata';
import { generateDocPageMetadata } from '@/lib/seo';
import { generateDocStructuredData } from '@/lib/structured-data';
import ShadowsPageClient from './page-client';
import type { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  const metadata = getCachedDocMetadata('/docs/shadows');

  if (!metadata) {
    return {};
  }

  return generateDocPageMetadata(metadata);
}

export default function ShadowsPage() {
  const metadata = getCachedDocMetadata('/docs/shadows');

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: metadata ? generateDocStructuredData(metadata) : '{}',
        }}
      />
      <ShadowsPageClient metadata={metadata || undefined} />
    </>
  );
}
