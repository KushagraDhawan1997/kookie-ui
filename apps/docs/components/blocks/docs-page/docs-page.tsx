'use client';

import * as React from 'react';
import { Box, Flex, Link, Tabs, Text } from '@kushagradhawan/kookie-ui';
import { DocsPageHeader } from './docs-page-header';

export interface DocsPageMeta {
  title: string;
  description?: string;
  /** Shown above the title, e.g. "Components". */
  category?: string;
  /** Link to the page's source, shown as a "Source" button. */
  source?: string;
}

/** One view of a page that has several, such as Documentation and Examples. */
export interface DocsPageView {
  value: string;
  label: string;
  /** Shown before the label in the tab. */
  icon?: React.ReactNode;
  content: React.ReactNode;
}

export interface DocsPageProps {
  /** The page's content. Leave it out when you pass `views`. */
  children?: React.ReactNode;
  /**
   * Several views of one page, shown as tabs under the header. Each tab controls the panel that
   * holds its view, so a screen reader can move from a tab to what it shows. The first view shows
   * first.
   */
  views?: DocsPageView[];
  /** Builds the default header. Ignored when `header` is set. */
  meta?: DocsPageMeta;
  /** Replaces the meta-based header entirely. */
  header?: React.ReactNode;
  /** Extra buttons in the header's action row. */
  headerActions?: React.ReactNode;
  /**
   * Your own tabs under the header. Prefer `views`: tabs passed here have no panel to control
   * unless you render one yourself.
   */
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
export function DocsPage({ children, views, meta, header, headerActions, headerTabs, showCopyButton, tableOfContents, maxWidth = '44rem', footer }: DocsPageProps) {
  const [view, setView] = React.useState(views?.[0]?.value);
  const active = views?.find((item) => item.value === view) ?? views?.[0];
  const tabs = views ? (
    <Tabs.List>
      {views.map((item) => (
        <Tabs.Trigger key={item.value} value={item.value}>
          {item.icon}
          {item.label}
        </Tabs.Trigger>
      ))}
    </Tabs.List>
  ) : (
    headerTabs
  );

  const column = (
    <Flex direction="column" gap={{ initial: '7', sm: '8' }} minWidth="0">
      {header ?? (meta && <DocsPageHeader meta={meta} actions={headerActions} tabs={tabs} showCopyButton={showCopyButton} />)}

      {active ? (
        // The panel the active tab controls. Its links and controls take focus, not the panel.
        <Tabs.Content value={active.value} tabIndex={-1}>
          <Box minWidth="0" data-content-area>
            {active.content}
          </Box>
        </Tabs.Content>
      ) : (
        <Box minWidth="0" data-content-area>
          {children}
        </Box>
      )}

      {React.isValidElement(footer) ? (
        <Box mt="10">{footer}</Box>
      ) : (
        footer && (
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
        )
      )}
    </Flex>
  );

  return (
    <Flex justify="center" align="start" gap="10" px={{ initial: '6', sm: '8', md: '10' }} pt={{ initial: '7', sm: '8' }} pb="10">
      <Box flexGrow="1" minWidth="0" maxWidth={maxWidth}>
        {active ? (
          <Tabs.Root value={active.value} onValueChange={setView}>
            {column}
          </Tabs.Root>
        ) : (
          column
        )}
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
