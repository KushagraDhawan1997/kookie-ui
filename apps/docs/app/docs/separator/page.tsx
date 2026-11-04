import React from 'react';
import { getCachedDocMetadata } from '@/lib/docs-metadata';
import { generateDocPageMetadata } from '@/lib/seo';
import { generateDocStructuredData } from '@/lib/structured-data';
import SeparatorPageClient from './page-client';
import type { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  const metadata = getCachedDocMetadata('/docs/separator');

  if (!metadata) {
    return {};
  }

  return generateDocPageMetadata(metadata);
}

export default function SeparatorPage() {
  const metadata = getCachedDocMetadata('/docs/separator');

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: metadata ? generateDocStructuredData(metadata) : '{}',
        }}
      />
      <SeparatorPageClient metadata={metadata || undefined} />
    </>
  );
}
