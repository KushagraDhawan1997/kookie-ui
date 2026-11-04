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
  /** @deprecated Copying moved to the docs toolbar, shown on every page with a Markdown twin. Ignored. */
  showCopyButton?: boolean;
  /** Rendered in a sticky column from the `lg` breakpoint. Without it, the column is centred. */
  tableOfContents?: React.ReactNode;
  /** Maximum width of the reading column. @default "44rem" */
  maxWidth?: string;
  /** Copyright line under the content, or your own footer element to render there instead. */
  footer?: { name: string; url?: string; githubUrl?: string; links?: { label: string; href: string }[] } | React.ReactElement;
}

/**
 * A documentation page: header, a reading column and an optional table of contents. The column
 * carries `data-content-area`, which the table of contents reads from.
 */
export function DocsPage({
  children,
  meta,
  header,
  headerActions,
  headerTabs,
  showCopyButton,
  tableOfContents,
  maxWidth = '44rem',
  footer,
}: DocsPageProps) {
  return (
    <Flex
      justify="center"
      align="start"
      gap="10"
      px={{ initial: '6', sm: '8', md: '10' }}
      pt={{ initial: '7', sm: '8' }}
      pb="10"
    >
      <Box flexGrow="1" minWidth="0" maxWidth={maxWidth}>
        <Flex direction="column" gap={{ initial: '7', sm: '8' }} minWidth="0">
          {header ?? (meta && <DocsPageHeader meta={meta} actions={headerActions} tabs={headerTabs} showCopyButton={showCopyButton} />)}

          <Box minWidth="0" data-content-area>
            {children}
          </Box>

          {React.isValidElement(footer) ? (
            <Box mt="10">{footer}</Box>
          ) : footer && (
            <Box mt="10">
              <Text as="p" size="2" emphasis="medium">
                © {new Date().getFullYear()}{' '}
                {footer.url ? (
                  <Link href={footer.url} target="_blank" rel="noreferrer" color="gray">
                    {footer.name}
                  </Link>
                ) : (
                  footer.name
                )}
                . Licensed under MIT.
                {footer.githubUrl && (
                  <>
                    {' '}
                    <Link href={footer.githubUrl} target="_blank" rel="noreferrer" color="gray">
                      GitHub
                    </Link>
                    .
                  </>
                )}
                {footer.links?.map((link) => (
                  <React.Fragment key={link.href}>
                    {' '}
                    <Link href={link.href} color="gray">
                      {link.label}
                    </Link>
                    .
                  </React.Fragment>
                ))}
              </Text>
            </Box>
          )}
        </Flex>
      </Box>

      {/* Chapters always pass one, so their column sits in the same place whether or not the
          page has headings. A page without one, like the homepage, centres its column instead. */}
      {tableOfContents && (
        <Box
          display={{ initial: 'none', lg: 'block' }}
          width="13rem"
          flexShrink="0"
          position="sticky"
          // Clears a floating toolbar over the page, as in Docs Shell.
          top="var(--kui-pane-inset-start, var(--space-7))"
        >
          {tableOfContents}
        </Box>
      )}
    </Flex>
  );
}
