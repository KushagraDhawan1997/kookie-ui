import Link from 'next/link';
import { Button, DropdownMenu, Navbar, Text } from '@kushagradhawan/kookie-ui';
import { HugeiconsIcon } from '@hugeicons/react';
import { Menu01Icon } from '@hugeicons/core-free-icons';

const links = [
  { href: '/docs/button', label: 'Components' },
  { href: '/start/theming', label: 'Theming' },
];

export default function SiteHeader() {
  return (
    <Navbar.Root position="static">
      <Navbar.Logo asChild>
        <Link href="/" aria-label="Acme home">
          <Text weight="medium">Acme</Text>
        </Link>
      </Navbar.Logo>
      <Navbar.Navigation aria-label="Main" display={{ initial: 'none', md: 'flex' }}>
        {links.map((link) => (
          <Button key={link.href} asChild emphasis="quiet">
            <Link href={link.href}>{link.label}</Link>
          </Button>
        ))}
      </Navbar.Navigation>
      <Navbar.Actions display={{ initial: 'flex', md: 'none' }}>
        <DropdownMenu.Root>
          <DropdownMenu.Trigger>
            <Button iconOnly emphasis="quiet" aria-label="Menu">
              <HugeiconsIcon icon={Menu01Icon} strokeWidth={1.75} />
            </Button>
          </DropdownMenu.Trigger>
          <DropdownMenu.Content>
            {links.map((link) => (
              <DropdownMenu.Item key={link.href} asChild>
                <Link href={link.href}>{link.label}</Link>
              </DropdownMenu.Item>
            ))}
          </DropdownMenu.Content>
        </DropdownMenu.Root>
      </Navbar.Actions>
    </Navbar.Root>
  );
}
