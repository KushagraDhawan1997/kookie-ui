import React from 'react';
import { getCachedDocMetadata } from '@/lib/docs-metadata';
import { generateDocPageMetadata } from '@/lib/seo';
import { generateDocStructuredData } from '@/lib/structured-data';
import ToggleButtonPageClient from './page-client';
import type { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  const metadata = getCachedDocMetadata('/docs/toggle-button');

  if (!metadata) {
    return {};
  }

  return generateDocPageMetadata(metadata);
}

export default function ToggleButtonPage() {
  const metadata = getCachedDocMetadata('/docs/toggle-button');

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: metadata ? generateDocStructuredData(metadata) : '{}',
        }}
      />
      <ToggleButtonPageClient metadata={metadata || undefined} />
    </>
  );
}
