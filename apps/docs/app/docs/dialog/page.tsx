import React from 'react';
import { getCachedDocMetadata } from '@/lib/docs-metadata';
import { generateDocPageMetadata } from '@/lib/seo';
import { generateDocStructuredData } from '@/lib/structured-data';
import DialogPageClient from './page-client';
import type { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  const metadata = getCachedDocMetadata('/docs/dialog');

  if (!metadata) {
    return {};
  }

  return generateDocPageMetadata(metadata);
}

export default function DialogPage() {
  const metadata = getCachedDocMetadata('/docs/dialog');

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: metadata ? generateDocStructuredData(metadata) : '{}',
        }}
      />
      <DialogPageClient metadata={metadata || undefined} />
    </>
  );
}
