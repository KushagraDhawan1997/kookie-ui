import React from 'react';
import { getCachedDocMetadata } from '@/lib/docs-metadata';
import { generateDocPageMetadata } from '@/lib/seo';
import { generateDocStructuredData } from '@/lib/structured-data';
import CodePageClient from './page-client';
import type { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  const metadata = getCachedDocMetadata('/docs/code');

  if (!metadata) {
    return {};
  }

  return generateDocPageMetadata(metadata);
}

export default function CodePage() {
  const metadata = getCachedDocMetadata('/docs/code');

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: metadata ? generateDocStructuredData(metadata) : '{}',
        }}
      />
      <CodePageClient metadata={metadata || undefined} />
    </>
  );
}
