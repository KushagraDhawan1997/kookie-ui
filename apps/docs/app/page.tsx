'use client';

import { Link as KUILink, Callout, Flex, Grid, Heading, Text } from '@kushagradhawan/kookie-ui';
import { HugeiconsIcon } from '@hugeicons/react';
import { Wrench01Icon } from '@hugeicons/core-free-icons';
import Link from 'next/link';
import { SiteDocsPage } from '@/components/site-docs-page';
import { SECTIONS, chaptersIn } from '@/lib/chapters';
import { docsNavigation } from '../navigation-config';

const COMPONENT_COUNT = docsNavigation.groups.find((group) => group.label === 'Components')?.items.length ?? 0;

const DESCRIPTION =
  'Kookie UI v1 is the design system behind Womp. It gives you the foundations and the building blocks to make design decisions, and every screen reads each decision from one place.';

/**
 * The homepage has the same structure as v2's: a title, one paragraph on what the system is,
 * then the four sections and their pages (docs/LOG.md, 2026-09-19). Like v2's, it renders
 * through the same page block as every chapter, so its header, column and footer match them.
 * The look is v1's own.
 */
export default function Home() {
  return (
    <SiteDocsPage meta={{ title: "Womp's Design System", description: DESCRIPTION }} showCopyButton={false}>
      <Flex direction="column" gap="9">
        <Callout.Root color="amber" variant="soft" size="2">
          <Callout.Icon>
            <HugeiconsIcon icon={Wrench01Icon} strokeWidth={1.75} />
          </Callout.Icon>
          <Callout.Text>
            <strong>Work in progress.</strong> Many design decisions in v1 are still open. Where v1 does not yet follow its own principles, these pages say so.
          </Callout.Text>
        </Callout.Root>

        <Grid columns={{ initial: '1', sm: '2' }} gapX="7" gapY="9">
          {SECTIONS.map((section) => (
            <Flex key={section.id} direction="column" gap="4">
              <Flex direction="column" gap="3">
                <Heading asChild size="5" weight="medium">
                  <h2>{section.title}</h2>
                </Heading>
                <Text as="p" size="3" emphasis="medium">
                  {section.blurb}
                </Text>
              </Flex>
              <Flex direction="column" gap="3" align="start">
                {chaptersIn(section.id).map((chapter) => (
                  <KUILink key={chapter.slug} asChild size="3">
                    <Link href={`/${chapter.slug}`}>{chapter.title}</Link>
                  </KUILink>
                ))}
              </Flex>
            </Flex>
          ))}

          <Flex direction="column" gap="4">
            <Flex direction="column" gap="3">
              <Heading asChild size="5" weight="medium">
                <h2>Components</h2>
              </Heading>
              <Text as="p" size="3" emphasis="medium">
                Every component in the package. Each page covers what the component is, which props it takes and how to use it.
              </Text>
            </Flex>
            <Flex align="start">
              <KUILink asChild size="3">
                <Link href="/docs">All {COMPONENT_COUNT} components</Link>
              </KUILink>
            </Flex>
          </Flex>
        </Grid>
      </Flex>
    </SiteDocsPage>
  );
}
