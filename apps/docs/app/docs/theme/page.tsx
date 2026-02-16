import React from 'react';
import { getCachedDocMetadata } from '@/lib/docs-metadata';
import { generateDocPageMetadata } from '@/lib/seo';
import { generateDocStructuredData } from '@/lib/structured-data';
import ThemePageClient from './page-client';
import type { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  const metadata = getCachedDocMetadata('/docs/theme');

  if (!metadata) {
    return {};
  }

  return generateDocPageMetadata(metadata);
}

export default function ThemePage() {
  const metadata = getCachedDocMetadata('/docs/theme');

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: metadata ? generateDocStructuredData(metadata) : '{}',
        }}
      />
      <ThemePageClient metadata={metadata || undefined} />
    </>
  );
}
