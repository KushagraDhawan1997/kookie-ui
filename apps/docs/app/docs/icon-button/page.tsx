import React from 'react';
import { getCachedDocMetadata } from '@/lib/docs-metadata';
import { generateDocPageMetadata } from '@/lib/seo';
import { generateDocStructuredData } from '@/lib/structured-data';
import IconButtonPageClient from './page-client';
import type { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  const metadata = getCachedDocMetadata('/docs/icon-button');

  if (!metadata) {
    return {};
  }

  return generateDocPageMetadata(metadata);
}

export default function IconButtonPage() {
  const metadata = getCachedDocMetadata('/docs/icon-button');

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: metadata ? generateDocStructuredData(metadata) : '{}',
        }}
      />
      <IconButtonPageClient metadata={metadata || undefined} />
    </>
  );
}
