import React from 'react';
import { getCachedDocMetadata } from '@/lib/docs-metadata';
import { generateDocPageMetadata } from '@/lib/seo';
import { generateDocStructuredData } from '@/lib/structured-data';
import InstallationPageClient from './page-client';
import type { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  const metadata = getCachedDocMetadata('/docs/installation');

  if (!metadata) {
    return {};
  }

  return generateDocPageMetadata(metadata);
}

export default function InstallationPage() {
  const metadata = getCachedDocMetadata('/docs/installation');

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: metadata ? generateDocStructuredData(metadata) : '{}',
        }}
      />
      <InstallationPageClient metadata={metadata || undefined} />
    </>
  );
}
