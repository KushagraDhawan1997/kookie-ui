import React from 'react';
import { getCachedDocMetadata } from '@/lib/docs-metadata';
import { generateDocPageMetadata } from '@/lib/seo';
import { generateDocStructuredData } from '@/lib/structured-data';
import PageClient from './page-client';
import type { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  const metadata = getCachedDocMetadata('/docs/badge');

  if (!metadata) {
    return {};
  }

  return generateDocPageMetadata(metadata);
}

export default function Page() {
  const metadata = getCachedDocMetadata('/docs/badge');

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: metadata ? generateDocStructuredData(metadata) : '{}',
        }}
      />
      <PageClient metadata={metadata || undefined} />
    </>
  );
}
