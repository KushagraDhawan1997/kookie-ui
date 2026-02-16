import React from 'react';
import { getCachedDocMetadata } from '@/lib/docs-metadata';
import { generateDocPageMetadata } from '@/lib/seo';
import { generateDocStructuredData } from '@/lib/structured-data';
import NavbarPageClient from './page-client';
import type { Metadata } from 'next';

export async function generateMetadata(): Promise<Metadata> {
  const metadata = getCachedDocMetadata('/docs/navbar');

  if (!metadata) {
    return {};
  }

  return generateDocPageMetadata(metadata);
}

export default function NavbarPage() {
  const metadata = getCachedDocMetadata('/docs/navbar');

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: metadata ? generateDocStructuredData(metadata) : '{}',
        }}
      />
      <NavbarPageClient metadata={metadata || undefined} />
    </>
  );
}
