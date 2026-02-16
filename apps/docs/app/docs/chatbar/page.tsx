import React from 'react';
import { getCachedDocMetadata } from '@/lib/docs-metadata';
import { generateDocPageMetadata } from '@/lib/seo';
import { generateDocStructuredData } from '@/lib/structured-data';
import ChatbarPageClient from './page-client';
import type { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  const metadata = getCachedDocMetadata('/docs/chatbar');

  if (!metadata) {
    return {};
  }

  return generateDocPageMetadata(metadata);
}

export default function ChatbarPage() {
  const metadata = getCachedDocMetadata('/docs/chatbar');

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: metadata ? generateDocStructuredData(metadata) : '{}',
        }}
      />
      <ChatbarPageClient metadata={metadata || undefined} />
    </>
  );
}
