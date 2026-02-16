import React from 'react';
import { getCachedDocMetadata } from '@/lib/docs-metadata';
import { generateDocPageMetadata } from '@/lib/seo';
import { generateDocStructuredData } from '@/lib/structured-data';
import TextFieldPageClient from './page-client';
import type { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  const metadata = getCachedDocMetadata('/docs/text-field');

  if (!metadata) {
    return {};
  }

  return generateDocPageMetadata(metadata);
}

export default function TextFieldPage() {
  const metadata = getCachedDocMetadata('/docs/text-field');

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: metadata ? generateDocStructuredData(metadata) : '{}',
        }}
      />
      <TextFieldPageClient metadata={metadata || undefined} />
    </>
  );
}
