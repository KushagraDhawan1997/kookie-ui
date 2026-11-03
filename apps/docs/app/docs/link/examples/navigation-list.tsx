import { Flex, Link } from '@kushagradhawan/kookie-ui';

const pages = [
  { href: '#account', label: 'Account' },
  { href: '#billing', label: 'Billing' },
  { href: '#notifications', label: 'Notifications' },
];

export default function SettingsNav() {
  return (
    <Flex asChild direction="column" gap="2">
      <nav aria-label="Settings">
        {pages.map((page) => (
          <Link key={page.href} href={page.href} size="2" underline="hover">
            {page.label}
          </Link>
        ))}
      </nav>
    </Flex>
  );
}
