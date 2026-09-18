import * as React from 'react';
import { Box, Container, Flex, Link, Text } from '@kushagradhawan/kookie-ui';
import { DocsPageHeader } from './docs-page-header';

type Space = '0' | '1' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9';

export interface DocsPageMeta {
  title: string;
  description?: string;
  /** Shown above the title, e.g. "Components". */
  category?: string;
  /** Link to the page's source, shown under the description. */
  source?: string;
}

export interface DocsPageProps {
  children: React.ReactNode;
  /** Builds the default header. Ignored when `header` is set. */
  meta?: DocsPageMeta;
  /** Rendered in a sticky column on large screens. */
  tableOfContents?: React.ReactNode;
  /** @default "48rem" */
  maxWidth?: string;
  /** @default "4" */
  padding?: Space;
  paddingX?: Space;
  /** @default "6" */
  paddingY?: Space;
  headerActions?: React.ReactNode;
  headerTabs?: React.ReactNode;
  /** Replaces the meta-based header entirely. */
  header?: React.ReactNode;
  /** @default false */
  showFooter?: boolean;
  footerCopyright?: { name: string; url?: string };
  githubUrl?: string;
  /** @default "3" */
  containerSize?: '1' | '2' | '3' | '4';
  /** Gap between the header and the content. @default "8" */
  contentGap?: Space;
  /** @default "6" */
  outerMargin?: Space;
  /** @default { initial: "2", sm: "4" } */
  contentPadding?: { initial?: Space; sm?: Space };
  headerContentGap?: Space;
  headerRootGap?: Space;
  headerSeparator?: boolean;
}

const DEFAULT_CONTENT_PADDING = { initial: '2', sm: '4' } as const;

/**
 * A documentation page: header, content column and an optional table of contents. The content
 * column carries `data-content-area`, which the table of contents and "Copy page" read from.
 */
export function DocsPage({
  children,
  meta,
  tableOfContents,
  maxWidth = '48rem',
  padding = '4',
  paddingX,
  paddingY = '6',
  headerActions,
  headerTabs,
  header,
  showFooter = false,
  footerCopyright,
  githubUrl,
  containerSize = '3',
  contentGap = '8',
  outerMargin = '6',
  contentPadding = DEFAULT_CONTENT_PADDING,
  headerContentGap,
  headerRootGap,
  headerSeparator,
}: DocsPageProps) {
  return (
    <Flex my={outerMargin} gap="6" align="start" direction={{ initial: 'column', lg: 'row' }}>
      <Flex direction="column" gap="6" p={contentPadding} width="100%" minWidth="0" flexGrow="1" flexBasis="0">
        <Container size={containerSize} minWidth="0" data-content-area>
          <Box p={padding} px={paddingX} py={paddingY} maxWidth={maxWidth} minWidth="0">
            <Flex direction="column" gap={contentGap} minWidth="0">
              {header ??
                (meta && (
                  <DocsPageHeader
                    meta={meta}
                    actions={headerActions}
                    tabs={headerTabs}
                    contentGap={headerContentGap}
                    rootGap={headerRootGap}
                    separator={headerSeparator}
                  />
                ))}

              <Flex direction="column" minWidth="0">
                {children}
              </Flex>
            </Flex>

            {showFooter && (
              <Flex align="center" justify="center" width="100%" pt="8">
                <Text size="2" color="gray" align="center">
                  © {new Date().getFullYear()}{' '}
                  {footerCopyright?.url ? (
                    <Link href={footerCopyright.url} target="_blank" rel="noreferrer">
                      {footerCopyright.name}
                    </Link>
                  ) : (
                    (footerCopyright?.name ?? 'Your Company')
                  )}
                  . Licensed under MIT.
                  {githubUrl && (
                    <>
                      {' '}
                      <Link href={githubUrl} target="_blank" rel="noreferrer">
                        GitHub
                      </Link>
                      .
                    </>
                  )}
                </Text>
              </Flex>
            )}
          </Box>
        </Container>
      </Flex>

      {tableOfContents && (
        <Box width="240px" minWidth="160px" position="sticky" top="200px" display={{ initial: 'none', lg: 'block' }}>
          {tableOfContents}
        </Box>
      )}
    </Flex>
  );
}
