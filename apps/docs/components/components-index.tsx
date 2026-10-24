'use client';

import NextLink from 'next/link';
import { Flex, Grid, Heading, Link, Text } from '@kushagradhawan/kookie-ui';
import { SiteDocsPage } from '@/components/site-docs-page';
import { docsNavigation } from '../navigation-config';

const COMPONENTS = docsNavigation.groups.find((group) => group.label === 'Components')?.items ?? [];

/**
 * The component index, grouped by the job a person is doing, the same as Kookie UI v2's
 * `/components` (Kushagra, 2026-10-24). The jobs and their questions are v2's; each v1 component
 * sits under the job its v2 counterpart sits under.
 */
const JOBS: { job: string; question: string; slugs: string[] }[] = [
  { job: 'Act', question: 'Make something happen.', slugs: ['button', 'context-menu', 'dropdown-menu', 'toggle', 'toolbar'] },
  {
    job: 'Choose',
    question: 'Pick from options you can see or list.',
    slugs: ['checkbox', 'combobox', 'radio-group', 'segmented-control', 'select', 'slider', 'switch'],
  },
  { job: 'Enter', question: 'Supply a value by typing it.', slugs: ['text-area', 'text-field'] },
  { job: 'Go', question: 'Move to another place in the app.', slugs: ['link', 'navbar', 'shell', 'sidebar', 'tabs'] },
  { job: 'Browse', question: 'Scan a collection and find one item.', slugs: ['table', 'virtual-menu'] },
  {
    job: 'Read',
    question: 'Take in content.',
    slugs: ['accordion', 'avatar', 'blockquote', 'card', 'code', 'heading', 'image', 'kbd', 'text'],
  },
  { job: 'Know', question: 'Learn the state of something.', slugs: ['chip', 'notice', 'progress', 'spinner', 'tooltip'] },
  { job: 'Focus', question: 'Deal with one thing before going on.', slugs: ['alert-dialog', 'dialog', 'popover', 'sheet'] },
  { job: 'Converse', question: 'Talk back and forth.', slugs: ['chatbar', 'message-scroller'] },
  {
    job: 'Arrange',
    question: "Place things on the page. This is your job, not the person's.",
    slugs: ['box', 'flex', 'grid', 'scroll-area', 'separator', 'utilities'],
  },
];

/** Components that own the decisions their job needs, as v2 tags them. A leaf leaves them to you. */
const PATTERNS = new Set(['chatbar', 'message-scroller', 'shell', 'toolbar']);

export function ComponentsIndex({ description }: { description: string }) {
  return (
    <SiteDocsPage meta={{ title: 'Components', description }}>
      <Grid columns={{ initial: '1', sm: '2' }} gapX="7" gapY="9">
        {JOBS.map(({ job, question, slugs }) => {
          const members = COMPONENTS.filter((item) => slugs.includes(item.href.replace('/docs/', '')));
          if (members.length === 0) return null;
          return (
            <Flex key={job} direction="column" gap="4">
              <Flex direction="column" gap="1">
                <Flex gap="3" align="center">
                  <Heading asChild size="5" weight="medium">
                    <h2>{job}</h2>
                  </Heading>
                  <Text size="2" emphasis="quiet">
                    {members.length}
                  </Text>
                </Flex>
                <Text size="2" emphasis="quiet">
                  {question}
                </Text>
              </Flex>
              <Flex direction="column" gap="3" align="start">
                {members.map((item) => (
                  <Flex key={item.href} gap="2" align="baseline">
                    <Link asChild size="3">
                      <NextLink href={item.href}>{item.title}</NextLink>
                    </Link>
                    {PATTERNS.has(item.href.replace('/docs/', '')) ? (
                      <Text size="2" emphasis="quiet">
                        Pattern
                      </Text>
                    ) : null}
                  </Flex>
                ))}
              </Flex>
            </Flex>
          );
        })}
      </Grid>
    </SiteDocsPage>
  );
}
