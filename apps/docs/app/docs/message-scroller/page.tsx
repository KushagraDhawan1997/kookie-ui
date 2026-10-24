import React from 'react';
import { getCachedDocMetadata } from '@/lib/docs-metadata';
import { generateDocPageMetadata } from '@/lib/seo';
import { generateDocStructuredData } from '@/lib/structured-data';
import MessageScrollerPageClient from './page-client';
import type { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  const metadata = getCachedDocMetadata('/docs/message-scroller');

  if (!metadata) {
    return {};
  }

  return generateDocPageMetadata(metadata);
}

export default function MessageScrollerPage() {
  const metadata = getCachedDocMetadata('/docs/message-scroller');

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: metadata ? generateDocStructuredData(metadata) : '{}',
        }}
      />
      <MessageScrollerPageClient metadata={metadata || undefined} />
    </>
  );
}
