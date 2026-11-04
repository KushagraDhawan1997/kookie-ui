'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { DocsShell } from '@/components/blocks/docs-shell/docs-shell';
import { docsNavigation } from '../navigation-config';
import { DarkModeToggle } from './dark-mode';
import { Chip } from '@kushagradhawan/kookie-ui';
import { PageToolbar } from './page-toolbar/page-toolbar';

export function DocsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

  // Full-screen tools draw their own Shell, so the docs chrome steps aside.
  if (pathname?.startsWith('/playground/')) return <>{children}</>;

  return (
    <DocsShell
      navigation={docsNavigation}
      logo={{
        label: 'Womp Design',
        alt: 'Womp Design',
        href: '/',
      }}
      pathname={pathname}
      linkComponent={Link}
      headerActions={
        <Chip variant="raised" color="gray" size="2">
          v{process.env.KOOKIE_UI_VERSION}
        </Chip>
      }
      // The repository moved to the page's top bar, as in v2.
      sidebarFooter={<DarkModeToggle />}
      toolbar={<PageToolbar />}
    >
      {children}
    </DocsShell>
  );
}
