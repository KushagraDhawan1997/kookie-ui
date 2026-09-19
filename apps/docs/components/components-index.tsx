'use client';

import NextLink from 'next/link';
import { Flex, Link } from '@kushagradhawan/kookie-ui';
import { SiteDocsPage } from '@/components/site-docs-page';
import { docsNavigation } from '../navigation-config';

const COMPONENTS = docsNavigation.groups.find((group) => group.label === 'Components')?.items ?? [];

/** The component index, the counterpart of v2's `/components`. */
export function ComponentsIndex({ description }: { description: string }) {
  return (
    <SiteDocsPage meta={{ title: 'Components', description }}>
      <Flex direction="column" gap="3" align="start">
        {COMPONENTS.map((item) => (
          <Link key={item.href} asChild size="3">
            <NextLink href={item.href}>{item.title}</NextLink>
          </Link>
        ))}
      </Flex>
    </SiteDocsPage>
  );
}
