'use client';

import * as React from 'react';
import { Flex, IconButton, Shell } from '@kushagradhawan/kookie-ui';
import { HugeiconsIcon } from '@hugeicons/react';
import { SidebarLeft01Icon, SidebarLeftIcon } from '@hugeicons/core-free-icons';
import { createPortal } from 'react-dom';
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
  /** Width of the collapsed sidebar, in pixels. @default 80 */
  sidebarThinSize?: number;
  /** @default true */
  sidebarResizable?: boolean;
  /** Replaces the icon of the sidebar button in the top bar. */
  mobileTriggerIcon?: React.ReactNode;
  /** Current path, used to mark the active item. */
  pathname?: string;
  /** Your router's link, e.g. `next/link`. Defaults to a plain anchor. */
  linkComponent?: DocsLinkComponent;
  /** Add a collapse/expand button to the sidebar footer. @default false */
  sidebarToggle?: boolean;
}

/** Where a page puts its own actions: the end of the shell's top bar. */
const PageActionsSlot = React.createContext<HTMLElement | null>(null);

/**
 * Renders a page's actions (copy page, source and so on) in the shell's top bar, not in the page
 * header, so the header holds only the title and the description. Renders nothing outside a shell.
 */
export function DocsShellPageActions({ children }: { children: React.ReactNode }) {
  const slot = React.useContext(PageActionsSlot);
  return slot ? createPortal(children, slot) : null;
}

function SidebarThinToggle() {
  const { sidebarMode, setSidebarMode } = Shell.useSidebarMode();
  const isThin = sidebarMode === 'thin';

  return (
    <IconButton
      variant="ghost"
      size="2"
      color="gray"
      highContrast
      onClick={() => setSidebarMode(isThin ? 'expanded' : 'thin')}
      aria-label={isThin ? 'Expand sidebar' : 'Collapse sidebar'}
    >
      <HugeiconsIcon icon={isThin ? SidebarLeftIcon : SidebarLeft01Icon} strokeWidth={1.75} />
    </IconButton>
  );
}

/** Documentation app frame: a searchable, collapsible sidebar beside the page content. */
export function DocsShell({
  children,
  navigation,
  logo,
  headerActions,
  sidebarFooter,
  height,
  sidebarThinSize = 80,
  sidebarResizable = true,
  mobileTriggerIcon,
  pathname = '',
  linkComponent,
  sidebarToggle = false,
}: DocsShellProps) {
  const [presentation, setPresentation] = React.useState<'thin' | 'expanded'>('expanded');
  const [actionsSlot, setActionsSlot] = React.useState<HTMLElement | null>(null);

  const footer = sidebarToggle ? (
    <Flex justify="between" align="center" width="100%" gap="1">
      {sidebarFooter}
      <SidebarThinToggle />
    </Flex>
  ) : (
    sidebarFooter
  );

  return (
    <Shell.Root height={height}>
      <Shell.Sidebar
        toggleModes="single"
        thinSize={sidebarThinSize}
        resizable={sidebarResizable}
        defaultState={{ initial: 'collapsed', sm: 'expanded' }}
        onStateChange={(state) => setPresentation(state === 'thin' ? 'thin' : 'expanded')}
        presentation={{ initial: 'overlay', sm: 'fixed' }}
      >
        <DocsSidebar
          navigation={navigation}
          logo={logo}
          presentation={presentation}
          headerActions={headerActions}
          footer={footer}
          pathname={pathname}
          linkComponent={linkComponent}
        />
      </Shell.Sidebar>

      <Shell.Content>
        {/* The top bar: the sidebar button at the start, the current page's actions at the end. */}
        <Flex align="center" justify="between" gap="3" px={{ initial: '4', sm: '5' }} pt="4">
          <IconButton variant="ghost" size="3" color="gray" highContrast asChild aria-label="Toggle navigation">
            <Shell.Trigger target="sidebar">
              {mobileTriggerIcon ?? <HugeiconsIcon icon={SidebarLeftIcon} strokeWidth={1.75} />}
            </Shell.Trigger>
          </IconButton>
          <Flex ref={setActionsSlot} align="center" gap="4" />
        </Flex>

        <PageActionsSlot.Provider value={actionsSlot}>{children}</PageActionsSlot.Provider>
      </Shell.Content>
    </Shell.Root>
  );
}
