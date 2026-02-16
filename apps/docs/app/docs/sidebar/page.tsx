import React from 'react';
import { getCachedDocMetadata } from '@/lib/docs-metadata';
import { generateDocPageMetadata } from '@/lib/seo';
import { generateDocStructuredData } from '@/lib/structured-data';
import SidebarPageClient from './page-client';
import type { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  const metadata = getCachedDocMetadata('/docs/sidebar');

  if (!metadata) {
    return {};
  }

  return generateDocPageMetadata(metadata);
}

export default function SidebarPage() {
  const metadata = getCachedDocMetadata('/docs/sidebar');

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: metadata ? generateDocStructuredData(metadata) : '{}',
        }}
      />
      <SidebarPageClient metadata={metadata || undefined} />
    </>
  );
}

