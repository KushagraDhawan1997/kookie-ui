import type { DocMetadata } from './frontmatter';

const BASE_URL = 'https://hellokookie.com';

/**
 * Generates JSON-LD BreadcrumbList + TechArticle structured data for a doc page.
 * Returns a serialized JSON string to embed in a <script type="application/ld+json">.
 */
export function generateDocStructuredData(metadata: DocMetadata): string {
  const url = `${BASE_URL}${metadata.pathname}`;

  return JSON.stringify({
    '@context': 'https://schema.org',
    '@graph': [
      {
        '@type': 'BreadcrumbList',
        itemListElement: [
          { '@type': 'ListItem', position: 1, name: 'Home', item: BASE_URL },
          { '@type': 'ListItem', position: 2, name: 'Documentation', item: `${BASE_URL}/docs` },
          { '@type': 'ListItem', position: 3, name: metadata.category, item: `${BASE_URL}/docs` },
          { '@type': 'ListItem', position: 4, name: metadata.title, item: url },
        ],
      },
      {
        '@type': 'TechArticle',
        headline: `${metadata.title} – Kookie UI`,
        description:
          metadata.description ||
          `${metadata.title} component documentation for Kookie UI React library.`,
        url,
        author: {
          '@type': 'Person',
          '@id': 'https://kushagradhawan.com/#person',
          name: 'Kushagra Dhawan',
        },
        publisher: {
          '@type': 'Person',
          '@id': 'https://kushagradhawan.com/#person',
          name: 'Kushagra Dhawan',
        },
        isPartOf: { '@id': `${BASE_URL}/#website` },
        about: { '@id': `${BASE_URL}/#software` },
        inLanguage: 'en-US',
      },
    ],
  });
}
