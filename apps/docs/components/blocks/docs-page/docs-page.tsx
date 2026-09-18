import * as React from 'react';
import { Box, Flex, Link, Text } from '@kushagradhawan/kookie-ui';
import { DocsPageHeader } from './docs-page-header';

export interface DocsPageMeta {
  title: string;
  description?: string;
  /** Shown above the title, e.g. "Components". */
  category?: string;
  /** Link to the page's source, shown as a "Source" button. */
  source?: string;
}

export interface DocsPageProps {
  children: React.ReactNode;
  /** Builds the default header. Ignored when `header` is set. */
  meta?: DocsPageMeta;
  /** Replaces the meta-based header entirely. */
  header?: React.ReactNode;
  /** Extra buttons in the header's action row. */
  headerActions?: React.ReactNode;
  /** Tabs under the header, e.g. Documentation and Examples. */
  headerTabs?: React.ReactNode;
  /** Rendered in a sticky column from the `lg` breakpoint. */
  tableOfContents?: React.ReactNode;
  /** Maximum width of the reading column. @default "44rem" */
  maxWidth?: string;
  /** Copyright line under the content. */
  footer?: { name: string; url?: string; githubUrl?: string };
}

/**
 * A documentation page: header, a reading column and an optional table of contents. The column
 * carries `data-content-area`, which the table of contents and "Copy page" read from.
 */
export function DocsPage({
  children,
  meta,
  header,
  headerActions,
  headerTabs,
  tableOfContents,
  maxWidth = '44rem',
  footer,
}: DocsPageProps) {
  return (
    <Flex
      justify="center"
      align="start"
      gap="9"
      px={{ initial: '5', sm: '7', md: '9' }}
      pt={{ initial: '8', sm: '9' }}
      pb="9"
    >
      <Box flexGrow="1" minWidth="0" maxWidth={maxWidth}>
        <Flex direction="column" gap={{ initial: '6', sm: '7' }} minWidth="0">
          {header ?? (meta && <DocsPageHeader meta={meta} actions={headerActions} tabs={headerTabs} />)}

          <Box minWidth="0" data-content-area>
            {children}
          </Box>

          {footer && (
            <Text as="p" size="2" color="gray" mt="9">
              © {new Date().getFullYear()}{' '}
              {footer.url ? (
                <Link href={footer.url} target="_blank" rel="noreferrer" color="gray" highContrast>
                  {footer.name}
                </Link>
              ) : (
                footer.name
              )}
              . Licensed under MIT.
              {footer.githubUrl && (
                <>
                  {' '}
                  <Link href={footer.githubUrl} target="_blank" rel="noreferrer" color="gray" highContrast>
                    GitHub
                  </Link>
                  .
                </>
              )}
            </Text>
          )}
        </Flex>
      </Box>

      {tableOfContents && (
        <Box
          display={{ initial: 'none', lg: 'block' }}
          width="13rem"
          flexShrink="0"
          position="sticky"
          top="6"
        >
          {tableOfContents}
        </Box>
      )}
    </Flex>
  );
}
