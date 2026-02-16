import React from 'react';
import { getCachedDocMetadata } from '@/lib/docs-metadata';
import { generateDocPageMetadata } from '@/lib/seo';
import { generateDocStructuredData } from '@/lib/structured-data';
import ToggleIconButtonPageClient from './page-client';
import type { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  const metadata = getCachedDocMetadata('/docs/toggle-icon-button');

  if (!metadata) {
    return {};
  }

  return generateDocPageMetadata(metadata);
}

export default function ToggleIconButtonPage() {
  const metadata = getCachedDocMetadata('/docs/toggle-icon-button');

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: metadata ? generateDocStructuredData(metadata) : '{}',
        }}
      />
      <ToggleIconButtonPageClient metadata={metadata || undefined} />
    </>
  );
}
