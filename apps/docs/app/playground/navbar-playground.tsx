'use client';

import React from 'react';
import { Box, Button, Flex, Heading, Navbar, Text } from '@kushagradhawan/kookie-ui';
import Playground from '@/components/playground';

const positions = ['fixed', 'sticky', 'static'] as const;
const sizes = ['1', '2', '3', '4'] as const;
const links = ['Product', 'Pricing', 'Docs'];
// The bar's height at each size: its padding plus a Button of the same size.
const barHeights = { '1': 44, '2': 56, '3': 72, '4': 96 } as const;

const DEFAULT_HEIGHT = '26rem';

type NavbarPlaygroundProps = {
  showControls?: boolean;
  showToolbar?: boolean;
  height?: string;
};

export default function NavbarPlayground({ showControls = false, showToolbar = true, height = DEFAULT_HEIGHT }: NavbarPlaygroundProps = {}) {
  const [position, setPosition] = React.useState<(typeof positions)[number]>('sticky');
  const [size, setSize] = React.useState<(typeof sizes)[number]>('2');
  const [navigation, setNavigation] = React.useState(true);
  const [signIn, setSignIn] = React.useState(true);

  const generateCode = () => {
    const rootProps: string[] = [];
    if (position !== 'fixed') rootProps.push(`position="${position}"`);
    if (size !== '2') rootProps.push(`size="${size}"`);

    const btnSize = size !== '2' ? ` size="${size}"` : '';
    const nav = navigation
      ? `
      <Navbar.Navigation aria-label="Main">
${links.map((link) => `        <Button asChild${btnSize} emphasis="quiet"><Link href="/${link.toLowerCase()}">${link}</Link></Button>`).join('\n')}
      </Navbar.Navigation>`
      : '';

    const actions = [
      signIn ? `        <Button asChild${btnSize} emphasis="quiet"><Link href="/login">Sign in</Link></Button>` : null,
      `        <Button asChild${btnSize} emphasis="loud"><Link href="/signup">Get started</Link></Button>`,
    ]
      .filter(Boolean)
      .join('\n');

    return `import { Button, Navbar, Text } from '@kushagradhawan/kookie-ui';
import Link from 'next/link';

export function SiteHeader() {
  return (
    <Navbar.Root${rootProps.length ? ` ${rootProps.join(' ')}` : ''}>
      <Navbar.Logo asChild>
        <Link href="/" aria-label="Acme home">
          <Text weight="medium">Acme</Text>
        </Link>
      </Navbar.Logo>${nav}
      <Navbar.Actions>
${actions}
      </Navbar.Actions>
    </Navbar.Root>
  );
}${position === 'fixed' ? '\n\n// A fixed bar takes no space. Pad the top of the page by its height.' : ''}`;
  };

  // The transform makes this box the containing block for a fixed bar, so it pins to the frame, not the window.
  const component = (
    <Box
      width="100%"
      height={`calc(${height} - 2 * var(--preview-block-padding))`}
      overflow="hidden"
      style={{ border: '1px solid var(--neutral-a4)', borderRadius: 'var(--radius-4)', transform: 'translateZ(0)' }}
    >
      <Box height="100%" overflowY="auto">
        <Navbar.Root position={position} size={size}>
          <Navbar.Logo>
            <Text weight="medium">Acme</Text>
          </Navbar.Logo>
          {navigation ? (
            <Navbar.Navigation aria-label="Main">
              {links.map((link) => (
                <Button key={link} size={size} emphasis="quiet">
                  {link}
                </Button>
              ))}
            </Navbar.Navigation>
          ) : null}
          <Navbar.Actions>
            {signIn ? <Button size={size} emphasis="quiet">Sign in</Button> : null}
            <Button size={size} emphasis="loud">Get started</Button>
          </Navbar.Actions>
        </Navbar.Root>
        <Flex direction="column" gap="4" px="6" pt={position === 'fixed' ? `${barHeights[size] + 24}px` : '6'} pb="6">
          <Heading size="6">Ship your next release faster</Heading>
          <Text emphasis="medium">Scroll this page to see how the bar behaves.</Text>
          {Array.from({ length: 6 }, (_, i) => (
            <Box key={i} height="5rem" style={{ background: 'var(--neutral-a2)', borderRadius: 'var(--radius-3)' }} />
          ))}
        </Flex>
      </Box>
    </Box>
  );

  const items = [
    {
      id: 'position',
      label: 'Position',
      type: 'select' as const,
      value: position,
      onChange: (next: string) => setPosition(next as (typeof positions)[number]),
      options: positions.map((option) => ({ label: option, value: option })),
      placeholder: 'Position',
    },
    {
      id: 'size',
      label: 'Size',
      type: 'select' as const,
      value: size,
      onChange: (next: string) => setSize(next as (typeof sizes)[number]),
      options: sizes.map((option) => ({ label: option, value: option })),
      placeholder: 'Size',
    },
    {
      id: 'navigation',
      label: 'Navigation',
      type: 'switch' as const,
      value: navigation,
      onChange: setNavigation,
    },
    {
      id: 'sign-in',
      label: 'Sign in action',
      type: 'switch' as const,
      value: signIn,
      onChange: setSignIn,
    },
  ];

  return <Playground component={component} code={generateCode()} items={items} showControls={showControls} showToolbar={showToolbar} height={height} />;
}
