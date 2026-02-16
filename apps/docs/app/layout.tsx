import type { Metadata } from 'next';
import { Providers } from '../components/providers';
import { DocsLayout } from '../components/docs-layout';
import './globals.css';
import Script from 'next/script';
import { Analytics } from '@vercel/analytics/next';

export const metadata: Metadata = {
  metadataBase: new URL('https://hellokookie.com'),
  title: {
    default: 'Kookie UI – Open-Source React Component Library by Kushagra Dhawan',
    template: '%s – Kookie UI',
  },
  description:
    'Kookie UI is an open-source React component library created by Kushagra Dhawan. Beautifully designed, accessible, and customizable components for building design systems.',
  keywords: [
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
    title: 'Kookie UI – Open-Source React Component Library by Kushagra Dhawan',
    description:
      'Kookie UI is an open-source React component library created by Kushagra Dhawan. Beautiful, accessible components for building design systems.',
    url: 'https://hellokookie.com',
    siteName: 'Kookie UI',
    images: [
      {
        url: '/kookie-ui-logo.png',
        width: 1200,
        height: 630,
        alt: 'Kookie UI – Open-Source React Component Library',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Kookie UI – Open-Source React Component Library by Kushagra Dhawan',
    description:
      'Kookie UI is an open-source React component library created by Kushagra Dhawan. Beautiful, accessible components for building design systems.',
    images: ['/kookie-ui-logo.png'],
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
                name: 'Kookie UI',
                description:
                  'Kookie UI is an open-source React component library created by Kushagra Dhawan. Beautifully designed, accessible, and customizable components for building design systems.',
                publisher: { '@id': 'https://kushagradhawan.com/#person' },
                inLanguage: 'en-US',
              },
              {
                '@type': 'SoftwareApplication',
                '@id': 'https://hellokookie.com/#software',
                name: 'Kookie UI',
                description:
                  'An open-source React component library for building design systems. A fork of Radix Themes focused on scalable, consistent UI components with a fresh visual style.',
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
                name: 'Kookie UI',
                description:
                  'Source code for Kookie UI — an open-source React component library by Kushagra Dhawan.',
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
                name: 'Kookie UI – Open-Source React Component Library by Kushagra Dhawan',
                isPartOf: { '@id': 'https://hellokookie.com/#website' },
                about: { '@id': 'https://hellokookie.com/#software' },
                description:
                  'Kookie UI is an open-source React component library created by Kushagra Dhawan. Beautifully designed, accessible, and customizable components for building design systems.',
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
