import React from 'react';
import { getCachedDocMetadata } from '@/lib/docs-metadata';
import { generateDocPageMetadata } from '@/lib/seo';
import { generateDocStructuredData } from '@/lib/structured-data';
import VirtualMenuPageClient from './page-client';
import type { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  const metadata = getCachedDocMetadata('/docs/virtual-menu');

  if (!metadata) {
    return {};
  }

  return generateDocPageMetadata(metadata);
}

export default function VirtualMenuPage() {
  const metadata = getCachedDocMetadata('/docs/virtual-menu');

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: metadata ? generateDocStructuredData(metadata) : '{}',
        }}
      />
      <VirtualMenuPageClient metadata={metadata || undefined} />
    </>
  );
}
