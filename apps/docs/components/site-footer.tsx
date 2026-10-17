'use client';

import NextLink from 'next/link';
import { Link, Text } from '@kushagradhawan/kookie-ui';
import { Footer } from '@/components/blocks/footer/footer';
import { Logo } from '@/components/logo';
import { SECTIONS, chaptersIn } from '@/lib/chapters';

/**
 * This site's footer, after v2's: the mark, a column per section, a Reference column, and the
 * licence line. No ground, as in the Footer block's own examples. The section columns read the
 * same chapter registry as the sidebar, so the footer cannot list a page that does not exist.
 */
const REFERENCE = [
  { label: 'All components', href: '/docs' },
  { label: 'Blocks', href: '/docs/blocks' },
  { label: "What's new", href: '/whats-new' },
  { label: 'GitHub', href: 'https://github.com/KushagraDhawan1997/kookie-ui', external: true },
];

export function SiteFooter() {
  return (
    <Footer.Root gap="8">
      <Footer.Main>
        <Footer.Brand>
          <NextLink href="/" aria-label="Womp's Design System" style={{ color: 'inherit' }}>
            <Logo height="var(--line-height-7)" />
          </NextLink>
        </Footer.Brand>
        <Footer.Links>
          {SECTIONS.map((section) => (
            <Footer.LinkGroup key={section.id} title={section.title}>
              {chaptersIn(section.id).map((chapter) => (
                <Link key={chapter.slug} asChild size="2" color="gray">
                  <NextLink href={`/${chapter.slug}`}>{chapter.title}</NextLink>
                </Link>
              ))}
            </Footer.LinkGroup>
          ))}
          <Footer.LinkGroup title="Reference">
            {REFERENCE.map((link) =>
              link.external ? (
                <Footer.Link key={link.href} href={link.href} target="_blank" rel="noreferrer">
                  {link.label}
                </Footer.Link>
              ) : (
                <Link key={link.href} asChild size="2" color="gray">
                  <NextLink href={link.href}>{link.label}</NextLink>
                </Link>
              ),
            )}
          </Footer.LinkGroup>
        </Footer.Links>
      </Footer.Main>
      <Footer.Bottom>
        <Text size="2" emphasis="medium">
          MIT licensed. © {new Date().getFullYear()}{' '}
          <Link href="https://www.kushagradhawan.com" target="_blank" rel="noreferrer" color="gray">
            Kushagra Dhawan
          </Link>
          .
        </Text>
      </Footer.Bottom>
    </Footer.Root>
  );
}
