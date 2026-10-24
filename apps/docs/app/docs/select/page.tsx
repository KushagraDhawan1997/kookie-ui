import React from 'react';
import { getCachedDocMetadata } from '@/lib/docs-metadata';
import { generateDocPageMetadata } from '@/lib/seo';
import { generateDocStructuredData } from '@/lib/structured-data';
import SelectPageClient from './page-client';
import type { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  const metadata = getCachedDocMetadata('/docs/select');

  if (!metadata) {
    return {};
  }

  return generateDocPageMetadata(metadata);
}

export default function SelectPage() {
  const metadata = getCachedDocMetadata('/docs/select');

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: metadata ? generateDocStructuredData(metadata) : '{}',
        }}
      />
      <SelectPageClient metadata={metadata || undefined} />
    </>
  );
}
