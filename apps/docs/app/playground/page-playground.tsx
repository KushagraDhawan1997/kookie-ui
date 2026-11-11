'use client';

import React from 'react';
import { Box, Flex, Page, Shell, Text, Toolbar } from '@kushagradhawan/kookie-ui';
import Playground from '@/components/playground';

const NOTES = [
  'Billing runs on the first of each month.',
  'Seats you add mid-month are charged for the days left in it.',
  'Seats you remove stay active until the month ends.',
  'Invoices go to every owner of the workspace.',
  'A failed payment is retried three times over a week.',
  'After the last retry the workspace becomes read-only.',
  'Paying the open invoice restores it at once.',
  'Yearly plans renew on the date you started them.',
];

type PagePlaygroundProps = {
  showControls?: boolean;
  showToolbar?: boolean;
  height?: string;
};

export default function PagePlayground({ showControls = false, showToolbar = true, height = '28rem' }: PagePlaygroundProps = {}) {
  const [description, setDescription] = React.useState(true);
  const [float, setFloat] = React.useState(false);

  const items = [
    {
      id: 'description',
      label: 'Description',
      type: 'switch' as const,
      value: description,
      onChange: setDescription,
    },
    {
      id: 'float',
      label: 'Floating band',
      type: 'switch' as const,
      value: float,
      onChange: setFloat,
    },
  ];

  const code = `<Shell.Content>
  <Shell.PaneHeader${float ? ' float' : ''}>
    <Toolbar>
      <Toolbar.Title />
    </Toolbar>
  </Shell.PaneHeader>
  <Shell.Scroll>
    <Box px="5">
      <Page title="Billing"${description ? ' description="How and when your workspace is charged."' : ''}>
        …
      </Page>
    </Box>
  </Shell.Scroll>
</Shell.Content>`;

  return (
    <Playground
      component={
        <Box width="560px" maxWidth="100%" px="4">
          <Shell.Root height="360px" style={{ borderRadius: 'var(--radius-surface-2)', overflow: 'hidden', boxShadow: 'inset 0 0 0 1px var(--neutral-a5)' }}>
            <Shell.Content>
              <Shell.PaneHeader float={float}>
                <Toolbar>
                  <Toolbar.Title />
                </Toolbar>
              </Shell.PaneHeader>
              <Shell.Scroll>
                <Box px="5" pb="6">
                  <Page title="Billing" description={description ? 'How and when your workspace is charged.' : undefined}>
                    <Flex direction="column" gap="4" pt="6">
                      {NOTES.map((note) => (
                        <Text as="p" size="3" key={note}>
                          {note}
                        </Text>
                      ))}
                    </Flex>
                  </Page>
                </Box>
              </Shell.Scroll>
            </Shell.Content>
          </Shell.Root>
        </Box>
      }
      code={code}
      items={items}
      hint="Scroll the page: when the large title leaves, the band shows it."
      showControls={showControls}
      showToolbar={showToolbar}
      height={height}
    />
  );
}
