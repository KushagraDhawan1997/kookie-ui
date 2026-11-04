import React from 'react';
import { getCachedDocMetadata } from '@/lib/docs-metadata';
import { generateDocPageMetadata } from '@/lib/seo';
import { generateDocStructuredData } from '@/lib/structured-data';
import TablePageClient from './page-client';
import type { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  const metadata = getCachedDocMetadata('/docs/table');

  if (!metadata) {
    return {};
  }

  return generateDocPageMetadata(metadata);
}

export default function TablePage() {
  const metadata = getCachedDocMetadata('/docs/table');

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: metadata ? generateDocStructuredData(metadata) : '{}',
        }}
      />
      <TablePageClient metadata={metadata || undefined} />
    </>
  );
}
