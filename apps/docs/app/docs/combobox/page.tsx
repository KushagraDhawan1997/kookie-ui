import React from 'react';
import { getCachedDocMetadata } from '@/lib/docs-metadata';
import { generateDocPageMetadata } from '@/lib/seo';
import { generateDocStructuredData } from '@/lib/structured-data';
import ComboboxPageClient from './page-client';
import type { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  const metadata = getCachedDocMetadata('/docs/combobox');

  if (!metadata) {
    return {};
  }

  return generateDocPageMetadata(metadata);
}

export default function ComboboxPage() {
  const metadata = getCachedDocMetadata('/docs/combobox');

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: metadata ? generateDocStructuredData(metadata) : '{}',
        }}
      />
      <ComboboxPageClient metadata={metadata || undefined} />
    </>
  );
}
