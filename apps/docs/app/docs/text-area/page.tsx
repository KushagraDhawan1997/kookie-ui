import React from 'react';
import { getCachedDocMetadata } from '@/lib/docs-metadata';
import { generateDocPageMetadata } from '@/lib/seo';
import { generateDocStructuredData } from '@/lib/structured-data';
import TextAreaPageClient from './page-client';
import type { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  const metadata = getCachedDocMetadata('/docs/text-area');

  if (!metadata) {
    return {};
  }

  return generateDocPageMetadata(metadata);
}

export default function TextAreaPage() {
  const metadata = getCachedDocMetadata('/docs/text-area');

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: metadata ? generateDocStructuredData(metadata) : '{}',
        }}
      />
      <TextAreaPageClient metadata={metadata || undefined} />
    </>
  );
}
