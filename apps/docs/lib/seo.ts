import type { Metadata } from 'next';
import type { DocMetadata } from './frontmatter';
import { BASE_URL } from './constants';

/**
 * Generates comprehensive per-page SEO metadata for doc pages.
 * Includes OpenGraph, Twitter Card, canonical URL, and keywords.
 */
export function generateDocPageMetadata(metadata: DocMetadata): Metadata {
  const url = `${BASE_URL}${metadata.pathname}`;
  const title = metadata.title;
  const description =
    metadata.description || `${metadata.title} — Womp UI React component documentation.`;

  const baseKeywords = ['Womp UI', 'React', metadata.title];
  const keywords = metadata.keywords
    ? [...baseKeywords, ...metadata.keywords]
    : [...baseKeywords, metadata.category, 'UI component', 'design system'];

  return {
    title,
    description,
    keywords,
    alternates: { canonical: metadata.pathname },
    openGraph: {
      title: `${title} – Womp UI`,
      description,
      url,
      siteName: 'Womp UI',
      locale: 'en_US',
      type: 'article',
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} – Womp UI`,
      description,
      site: '@kookieui',
      creator: '@kushagradhawan',
    },
  };
}
