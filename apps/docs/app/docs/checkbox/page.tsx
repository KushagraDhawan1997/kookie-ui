import React from 'react';
import { getCachedDocMetadata } from '@/lib/docs-metadata';
import { generateDocPageMetadata } from '@/lib/seo';
import { generateDocStructuredData } from '@/lib/structured-data';
import CheckboxPageClient from './page-client';
import type { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  const metadata = getCachedDocMetadata('/docs/checkbox');

  if (!metadata) {
    return {};
  }

  return generateDocPageMetadata(metadata);
}

export default function CheckboxPage() {
  const metadata = getCachedDocMetadata('/docs/checkbox');

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: metadata ? generateDocStructuredData(metadata) : '{}',
        }}
      />
      <CheckboxPageClient metadata={metadata || undefined} />
    </>
  );
}
