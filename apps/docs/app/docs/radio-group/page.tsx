import React from 'react';
import { getCachedDocMetadata } from '@/lib/docs-metadata';
import { generateDocPageMetadata } from '@/lib/seo';
import { generateDocStructuredData } from '@/lib/structured-data';
import RadioGroupPageClient from './page-client';
import type { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  const metadata = getCachedDocMetadata('/docs/radio-group');

  if (!metadata) {
    return {};
  }

  return generateDocPageMetadata(metadata);
}

export default function RadioGroupPage() {
  const metadata = getCachedDocMetadata('/docs/radio-group');

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: metadata ? generateDocStructuredData(metadata) : '{}',
        }}
      />
      <RadioGroupPageClient metadata={metadata || undefined} />
    </>
  );
}
