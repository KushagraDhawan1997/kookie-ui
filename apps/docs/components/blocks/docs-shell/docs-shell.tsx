'use client';

import * as React from 'react';
import { Box, Flex, Shell, Toolbar, ToolbarButton, ToolbarSlot } from '@kushagradhawan/kookie-ui';
import { HugeiconsIcon } from '@hugeicons/react';
import { SidebarLeftIcon } from '@hugeicons/core-free-icons';
import { DocsSidebar } from './docs-sidebar';
import type { DocsLinkComponent, DocsLogoConfig, DocsNavigationConfig } from './types';

export interface DocsShellProps {
  children: React.ReactNode;
  navigation: DocsNavigationConfig;
  logo?: DocsLogoConfig;
  /** Rendered next to the logo, e.g. a GitHub link or version badge. */
  headerActions?: React.ReactNode;
  sidebarFooter?: React.ReactNode;
  height?: React.ComponentProps<typeof Shell.Root>['height'];
  /** @default true */
  sidebarResizable?: boolean;
  /** Replaces the icon of the sidebar button in the top bar. */
  mobileTriggerIcon?: React.ReactNode;
  /** Current path, used to mark the active item. */
  pathname?: string;
  /** Your router's link, e.g. `next/link`. Defaults to a plain anchor. */
  linkComponent?: DocsLinkComponent;
  /** A band at the top of the content pane, edge to edge, with the top bar floating over it. */
  hero?: React.ReactNode;
  /**
   * Controls at the end of the top bar, inside its `Toolbar`: `ToolbarGroup`s, `ToolbarButton`s
   * or a `ToolbarOverflow`. The page's own actions follow them.
   */
  toolbar?: React.ReactNode;
}

/** The `ToolbarSlot` at the end of the top bar. A page fills it with `<ToolbarFill name={DOCS_PAGE_ACTIONS}>`. */
export const DOCS_PAGE_ACTIONS = 'docs-page-actions';

/** Documentation app frame: a searchable sidebar beside the page content. */
export function DocsShell({
  children,
  navigation,
  logo,
  headerActions,
  sidebarFooter,
  height,
  sidebarResizable = true,
  mobileTriggerIcon,
  pathname = '',
  linkComponent,
  hero,
  toolbar,
}: DocsShellProps) {
  return (
    <Shell.Root height={height}>
      <Shell.Sidebar
        aria-label="Documentation"
        resizable={sidebarResizable}
        defaultState={{ initial: 'collapsed', sm: 'expanded' }}
        presentation={{ initial: 'overlay', sm: 'fixed' }}
        // The soft sidebar fill that Sidebar.Root's `variant="soft"` used to paint.
        style={{ backgroundColor: 'var(--neutral-2)' }}
      >
        <DocsSidebar
          navigation={navigation}
          logo={logo}
          headerActions={headerActions}
          footer={sidebarFooter}
          pathname={pathname}
          linkComponent={linkComponent}
        />
      </Shell.Sidebar>

      <Shell.Content className="kd-shell-content">
        {/* The top bar floats over the page, the way the sidebar's header floats over its list:
            the pane gives it its inset and the page starts below it. The sidebar button comes
            first, then `toolbar`, then the current page's actions (Source and the like) through a
            ToolbarSlot. One Toolbar for the whole band, as in v2: one tab stop, arrow keys between
            every control, and `backdrop` gives each control and group a raised surface. Its size
            is one step above the Shell's. */}
        <Shell.PaneHeader float>
          <Toolbar backdrop aria-label="Page">
            <Shell.Trigger target="sidebar" asChild>
              <ToolbarButton iconOnly aria-label="Toggle navigation">
                {mobileTriggerIcon ?? <HugeiconsIcon icon={SidebarLeftIcon} strokeWidth={1.75} />}
              </ToolbarButton>
            </Shell.Trigger>
            {/* The trailing cluster grows, so a ToolbarOverflow in `toolbar` has the room to measure. */}
            <Flex align="center" justify="end" gap="3" flexGrow="1" minWidth="0">
              {toolbar}
              <ToolbarSlot name={DOCS_PAGE_ACTIONS} />
            </Flex>
          </Toolbar>
        </Shell.PaneHeader>

        <Shell.Scroll fade>
          {/* The page starts below the bar. A hero gives that room back, so it runs to the pane's
              top edge with the bar over it. */}
          {hero && <Box mt="calc(-1 * var(--kui-pane-inset-start))">{hero}</Box>}
          {children}
        </Shell.Scroll>
      </Shell.Content>
    </Shell.Root>
  );
}
