'use client';

import { usePathname } from 'next/navigation';
import Link from 'next/link';
import { DocsShell } from '@/components/blocks/docs-shell/docs-shell';
import { docsNavigation } from '../navigation-config';
import { DarkModeToggle } from './dark-mode';
import { IconButton, Flex, Badge } from '@kushagradhawan/kookie-ui';
import { HugeiconsIcon } from '@hugeicons/react';
import { GithubIcon } from '@hugeicons/core-free-icons';

export function DocsLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();

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
      sidebarFooter={
        <Flex gap="2" align="center">
          <DarkModeToggle />
          <IconButton asChild variant="ghost" highContrast aria-label="GitHub">
            <Link href="https://github.com/KushagraDhawan1997/kookie-ui" target="_blank" rel="noopener noreferrer">
              <HugeiconsIcon icon={GithubIcon} strokeWidth={1.75} />
            </Link>
          </IconButton>
          <Badge variant="classic" highContrast color="gray" size="1">
            v{process.env.KOOKIE_UI_VERSION}
          </Badge>
        </Flex>
      }
    >
      {children}
    </DocsShell>
  );
}
