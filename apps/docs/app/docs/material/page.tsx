import React from 'react';
import { getCachedDocMetadata } from '@/lib/docs-metadata';
import { generateDocPageMetadata } from '@/lib/seo';
import { generateDocStructuredData } from '@/lib/structured-data';
import MaterialPageClient from './page-client';
import type { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  const metadata = getCachedDocMetadata('/docs/material');

  if (!metadata) {
    return {};
  }

  return generateDocPageMetadata(metadata);
}

export default function MaterialPage() {
  const metadata = getCachedDocMetadata('/docs/material');

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: metadata ? generateDocStructuredData(metadata) : '{}',
        }}
      />
      <MaterialPageClient metadata={metadata || undefined} />
    </>
  );
}
