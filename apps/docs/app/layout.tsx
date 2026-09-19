import type { Metadata } from 'next';
import { Providers } from '../components/providers';
import { DocsLayout } from '../components/docs-layout';
import './globals.css';
import Script from 'next/script';
import { Analytics } from '@vercel/analytics/next';

export const metadata: Metadata = {
  metadataBase: new URL('https://hellokookie.com'),
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
    url: 'https://hellokookie.com',
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
  icons: {
    icon: [
      { url: '/favicon.ico', sizes: '48x48' },
      { url: '/favicon.svg', type: 'image/svg+xml' },
      { url: '/favicon-96x96.png', sizes: '96x96', type: 'image/png' },
    ],
    apple: '/apple-touch-icon.png',
    shortcut: '/favicon.ico',
  },
  manifest: '/site.webmanifest',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
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
                '@id': 'https://hellokookie.com/#website',
                url: 'https://hellokookie.com',
                name: 'Womp Design',
                description:
                  "Womp's design system: React components built on Kookie UI v1, an open-source fork of Radix Themes by Kushagra Dhawan.",
                publisher: { '@id': 'https://kushagradhawan.com/#person' },
                inLanguage: 'en-US',
              },
              {
                '@type': 'SoftwareApplication',
                '@id': 'https://hellokookie.com/#software',
                name: 'Womp Design',
                description:
                  "Womp's design system, built on Kookie UI v1, an open-source fork of Radix Themes.",
                url: 'https://hellokookie.com',
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
                '@id': 'https://hellokookie.com/#sourcecode',
                name: 'Kookie UI v1',
                description:
                  'Source code for Kookie UI v1, the open-source library Womp Design is built on.',
                url: 'https://hellokookie.com',
                codeRepository: 'https://github.com/KushagraDhawan1997/kookie-ui',
                programmingLanguage: ['TypeScript', 'React'],
                runtimePlatform: 'Node.js',
                author: { '@id': 'https://kushagradhawan.com/#person' },
                license: 'https://opensource.org/licenses/MIT',
              },
              {
                '@type': 'WebPage',
                '@id': 'https://hellokookie.com/#webpage',
                url: 'https://hellokookie.com',
                name: 'Womp Design System',
                isPartOf: { '@id': 'https://hellokookie.com/#website' },
                about: { '@id': 'https://hellokookie.com/#software' },
                description:
                  "Womp's design system: React components built on Kookie UI v1, an open-source fork of Radix Themes by Kushagra Dhawan.",
                inLanguage: 'en-US',
              },
              {
                '@type': 'BreadcrumbList',
                '@id': 'https://hellokookie.com/#breadcrumb',
                itemListElement: [
                  {
                    '@type': 'ListItem',
                    position: 1,
                    name: 'Home',
                    item: 'https://hellokookie.com',
                  },
                  {
                    '@type': 'ListItem',
                    position: 2,
                    name: 'Documentation',
                    item: 'https://hellokookie.com/docs',
                  },
                ],
              },
            ],
          })}
        </Script>
        <Analytics />
      </body>
    </html>
  );
}
