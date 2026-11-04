import type { Metadata } from 'next';
import { Providers } from '../components/providers';
import { DocsLayout } from '../components/docs-layout';
import './globals.css';
import Script from 'next/script';
import { Analytics } from '@vercel/analytics/next';
import { appearanceScript } from '@kushagradhawan/kookie-ui/appearance-script';
import { BASE_URL } from '../lib/constants';
import { DevOutlineGate } from '../components/dev-outline';

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),
  title: {
    default: 'Womp Design System',
    template: '%s – Womp Design',
  },
  description:
    "Womp's design system: React components built on Kookie UI v1, an open-source fork of Radix Themes by Kushagra Dhawan.",
  keywords: [
    'Womp Design',
    'Womp',
    'Kookie UI',
    'React UI components',
    'Design system',
    'Radix Themes',
    'Accessible components',
    'TypeScript UI library',
    'Kushagra Dhawan',
    'open-source React library',
    'React design system',
    'UI component library',
  ],
  authors: [{ name: 'Kushagra Dhawan', url: 'https://kushagradhawan.com' }],
  creator: 'Kushagra Dhawan',
  publisher: 'Kushagra Dhawan',
  alternates: { canonical: '/' },
  openGraph: {
    title: 'Womp Design System',
    description:
      "Womp's design system: React components built on Kookie UI v1, an open-source fork of Radix Themes by Kushagra Dhawan.",
    url: BASE_URL,
    siteName: 'Womp Design',
    images: [
      {
        url: '/logos/kookie-ui/kookie-ui.png',
        width: 1200,
        height: 630,
        alt: 'Womp Design System',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Womp Design System',
    description:
      "Womp's design system: React components built on Kookie UI v1, an open-source fork of Radix Themes by Kushagra Dhawan.",
    images: ['/logos/kookie-ui/kookie-ui.png'],
    site: '@kookieui',
    creator: '@kushagradhawan',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
  // Icons come from the app/ file convention: favicon.ico, icon.svg (its prefers-color-scheme style
  // turns the mark white on a dark tab) and apple-icon.png. An `icons` key here would replace them.
  manifest: '/site.webmanifest',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // The pre-paint script writes the mode on <html>, so React must not flag the class it added.
    <html lang="en" suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: appearanceScript }} />
      </head>
      <body>
        <Providers>
          <DocsLayout>{children}</DocsLayout>
        </Providers>
        <Script id="ld-json-graph" type="application/ld+json" strategy="afterInteractive">
          {JSON.stringify({
            '@context': 'https://schema.org',
            '@graph': [
              {
                '@type': 'Person',
                '@id': 'https://kushagradhawan.com/#person',
                name: 'Kushagra Dhawan',
                url: 'https://kushagradhawan.com',
                sameAs: [
                  'https://github.com/KushagraDhawan1997',
                  'https://twitter.com/kushagradhawan',
                  'https://www.linkedin.com/in/kushagra-dhawan/',
                  'https://www.kushagradhawan.com',
                ],
                jobTitle: 'Software Engineer',
                knowsAbout: [
                  'React',
                  'TypeScript',
                  'UI Design Systems',
                  'Frontend Engineering',
                  'Open Source Software',
                ],
              },
              {
                '@type': 'WebSite',
                '@id': `${BASE_URL}/#website`,
                url: BASE_URL,
                name: 'Womp Design',
                description:
                  "Womp's design system: React components built on Kookie UI v1, an open-source fork of Radix Themes by Kushagra Dhawan.",
                publisher: { '@id': 'https://kushagradhawan.com/#person' },
                inLanguage: 'en-US',
              },
              {
                '@type': 'SoftwareApplication',
                '@id': `${BASE_URL}/#software`,
                name: 'Womp Design',
                description:
                  "Womp's design system, built on Kookie UI v1, an open-source fork of Radix Themes.",
                url: BASE_URL,
                applicationCategory: 'DeveloperApplication',
                operatingSystem: 'Cross-platform',
                offers: {
                  '@type': 'Offer',
                  price: '0',
                  priceCurrency: 'USD',
                },
                author: { '@id': 'https://kushagradhawan.com/#person' },
                license: 'https://opensource.org/licenses/MIT',
              },
              {
                '@type': 'SoftwareSourceCode',
                '@id': `${BASE_URL}/#sourcecode`,
                name: 'Kookie UI v1',
                description:
                  'Source code for Kookie UI v1, the open-source library Womp Design is built on.',
                url: BASE_URL,
                codeRepository: 'https://github.com/KushagraDhawan1997/kookie-ui',
                programmingLanguage: ['TypeScript', 'React'],
                runtimePlatform: 'Node.js',
                author: { '@id': 'https://kushagradhawan.com/#person' },
                license: 'https://opensource.org/licenses/MIT',
              },
              {
                '@type': 'WebPage',
                '@id': `${BASE_URL}/#webpage`,
                url: BASE_URL,
                name: 'Womp Design System',
                isPartOf: { '@id': `${BASE_URL}/#website` },
                about: { '@id': `${BASE_URL}/#software` },
                description:
                  "Womp's design system: React components built on Kookie UI v1, an open-source fork of Radix Themes by Kushagra Dhawan.",
                inLanguage: 'en-US',
              },
              {
                '@type': 'BreadcrumbList',
                '@id': `${BASE_URL}/#breadcrumb`,
                itemListElement: [
                  {
                    '@type': 'ListItem',
                    position: 1,
                    name: 'Home',
                    item: BASE_URL,
                  },
                  {
                    '@type': 'ListItem',
                    position: 2,
                    name: 'Documentation',
                    item: `${BASE_URL}/docs`,
                  },
                ],
              },
            ],
          })}
        </Script>
        <Analytics />
        <DevOutlineGate />
      </body>
    </html>
  );
}
