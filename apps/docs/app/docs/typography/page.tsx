import React from 'react';
import { getCachedDocMetadata } from '@/lib/docs-metadata';
import { generateDocPageMetadata } from '@/lib/seo';
import { generateDocStructuredData } from '@/lib/structured-data';
import TypographyPageClient from './page-client';
import type { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  const metadata = getCachedDocMetadata('/docs/typography');

  if (!metadata) {
    return {};
  }

  return generateDocPageMetadata(metadata);
}

export default function TypographyPage() {
  const metadata = getCachedDocMetadata('/docs/typography');

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: metadata ? generateDocStructuredData(metadata) : '{}',
        }}
      />
      <TypographyPageClient metadata={metadata || undefined} />
    </>
  );
}
