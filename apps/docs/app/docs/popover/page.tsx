import React from 'react';
import { getCachedDocMetadata } from '@/lib/docs-metadata';
import { generateDocPageMetadata } from '@/lib/seo';
import { generateDocStructuredData } from '@/lib/structured-data';
import PopoverPageClient from './page-client';
import type { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  const metadata = getCachedDocMetadata('/docs/popover');

  if (!metadata) {
    return {};
  }

  return generateDocPageMetadata(metadata);
}

export default function PopoverPage() {
  const metadata = getCachedDocMetadata('/docs/popover');

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: metadata ? generateDocStructuredData(metadata) : '{}',
        }}
      />
      <PopoverPageClient metadata={metadata || undefined} />
    </>
  );
}
