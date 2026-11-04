import React from 'react';
import { getCachedDocMetadata } from '@/lib/docs-metadata';
import { generateDocPageMetadata } from '@/lib/seo';
import { generateDocStructuredData } from '@/lib/structured-data';
import SwitchPageClient from './page-client';
import type { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  const metadata = getCachedDocMetadata('/docs/switch');

  if (!metadata) {
    return {};
  }

  return generateDocPageMetadata(metadata);
}

export default function SwitchPage() {
  const metadata = getCachedDocMetadata('/docs/switch');

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: metadata ? generateDocStructuredData(metadata) : '{}',
        }}
      />
      <SwitchPageClient metadata={metadata || undefined} />
    </>
  );
}
