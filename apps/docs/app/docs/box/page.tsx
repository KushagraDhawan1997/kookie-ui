import React from 'react';
import { getCachedDocMetadata } from '@/lib/docs-metadata';
import { generateDocPageMetadata } from '@/lib/seo';
import { generateDocStructuredData } from '@/lib/structured-data';
import BoxPageClient from './page-client';
import type { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  const metadata = getCachedDocMetadata('/docs/box');

  if (!metadata) {
    return {};
  }

  return generateDocPageMetadata(metadata);
}

export default function BoxPage() {
  const metadata = getCachedDocMetadata('/docs/box');

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: metadata ? generateDocStructuredData(metadata) : '{}',
        }}
      />
      <BoxPageClient metadata={metadata || undefined} />
    </>
  );
}
