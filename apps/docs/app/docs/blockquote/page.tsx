import React from 'react';
import { getCachedDocMetadata } from '@/lib/docs-metadata';
import { generateDocPageMetadata } from '@/lib/seo';
import { generateDocStructuredData } from '@/lib/structured-data';
import BlockquotePageClient from './page-client';
import type { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  const metadata = getCachedDocMetadata('/docs/blockquote');

  if (!metadata) {
    return {};
  }

  return generateDocPageMetadata(metadata);
}

export default function BlockquotePage() {
  const metadata = getCachedDocMetadata('/docs/blockquote');

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: metadata ? generateDocStructuredData(metadata) : '{}',
        }}
      />
      <BlockquotePageClient metadata={metadata || undefined} />
    </>
  );
}
