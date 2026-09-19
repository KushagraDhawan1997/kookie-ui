'use client';

import React from 'react';
import { Button, Link as KUILink, Callout, Flex, Grid, Heading, Text, Box } from '@kushagradhawan/kookie-ui';
import { Hero } from '@/components/blocks/hero/hero';
import { Footer } from '@/components/blocks/footer/footer';
import Link from 'next/link';
import { HugeiconsIcon } from '@hugeicons/react';
import { ArrowUpRight01Icon, ArrowRight01Icon } from '@hugeicons/core-free-icons';
import AvatarPlayground from './playground/avatar-playground';
import BadgePlayground from './playground/badge-playground';
import ButtonPlayground from './playground/button-playground';
import CalloutPlayground from './playground/callout-playground';
import CardPlayground from './playground/card-playground';
import ChatbarPlayground from './playground/chatbar-playground';
import ComboboxPlayground from './playground/combobox-playground';
import HeadingPlayground from './playground/heading-playground';
import IconButtonPlayground from './playground/icon-button-playground';
import SegmentedControlPlayground from './playground/segmented-control-playground';
import SheetPlayground from './playground/sheet-playground';
import TextPlayground from './playground/text-playground';
import TextAreaPlayground from './playground/text-area-playground';
import TextFieldPlayground from './playground/text-field-playground';
import ToggleButtonPlayground from './playground/toggle-button-playground';
import ToggleIconButtonPlayground from './playground/toggle-icon-button-playground';

const playgrounds = [
  { name: 'Avatar', slug: 'avatar', Component: AvatarPlayground },
  { name: 'Badge', slug: 'badge', Component: BadgePlayground },
  { name: 'Button', slug: 'button', Component: ButtonPlayground },
  { name: 'Callout', slug: 'callout', Component: CalloutPlayground },
  { name: 'Card', slug: 'card', Component: CardPlayground },
  { name: 'Chatbar', slug: 'chatbar', Component: ChatbarPlayground },
  { name: 'Combobox', slug: 'combobox', Component: ComboboxPlayground },
  { name: 'Heading', slug: 'heading', Component: HeadingPlayground },
  { name: 'Icon Button', slug: 'icon-button', Component: IconButtonPlayground },
  { name: 'Segmented Control', slug: 'segmented-control', Component: SegmentedControlPlayground },
  { name: 'Sheet', slug: 'sheet', Component: SheetPlayground },
  { name: 'Text', slug: 'text', Component: TextPlayground },
  { name: 'Text Area', slug: 'text-area', Component: TextAreaPlayground },
  { name: 'Text Field', slug: 'text-field', Component: TextFieldPlayground },
  { name: 'Toggle Button', slug: 'toggle-button', Component: ToggleButtonPlayground },
  { name: 'Toggle Icon Button', slug: 'toggle-icon-button', Component: ToggleIconButtonPlayground },
];

export default function HeroSection() {
  const currentYear = new Date().getFullYear();

  return (
    /* One centered reading column for the whole page: intro, playgrounds and footer share its edges. */
    <Box px={{ initial: '4', sm: '6' }} pt={{ initial: '6', sm: '9' }}>
      <Flex direction="column" gap={{ initial: '8', sm: '9' }} maxWidth="48rem" mx="auto">
        <Flex direction="column" align="start" gap="5">
          <Text size="2" weight="medium" color="gray">
            Built on Kookie UI v1
          </Text>

          <Hero.Root align="start" gap="6">
            <Hero.Title size={{ initial: '8', sm: '9' }} weight="medium" align="left">
              Womp&apos;s Design System
            </Hero.Title>

            <Hero.Description size="3" align="left">
              Kookie UI v1 is the design system behind{' '}
              <KUILink target="_blank" href="https://womp.com" rel="noopener noreferrer" underline="always" color="blue">
                Womp
              </KUILink>
              . It started as an open-source fork of{' '}
              <KUILink target="_blank" href="https://radix-ui.com/themes" rel="noopener noreferrer" underline="always" color="blue">
                Radix Themes
              </KUILink>{' '}
              and now powers every screen of the product. Built and maintained by{' '}
              <KUILink target="_blank" href="https://www.kushagradhawan.com" rel="noopener noreferrer" underline="always" color="blue">
                Kushagra Dhawan
              </KUILink>
              , Head of Product and Design at Womp.
            </Hero.Description>

            <Hero.Actions gap="3">
              <Button asChild variant="solid" size="3" highContrast>
                <Link href="/docs/installation">
                  Get Started
                  <HugeiconsIcon icon={ArrowUpRight01Icon} strokeWidth={1.75} />
                </Link>
              </Button>
              <Button asChild variant="soft" highContrast size="3">
                <a href="https://github.com/KushagraDhawan1997/kookie-ui" target="_blank" rel="noopener noreferrer">
                  GitHub
                  <HugeiconsIcon icon={ArrowRight01Icon} strokeWidth={1.75} />
                </a>
              </Button>
            </Hero.Actions>

            <Link href="https://www.kushagradhawan.com/articles/kookie-chatbar-update" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
              <Callout.Root highContrast variant="outline" color="gray" size="2" style={{ cursor: 'pointer' }}>
                <Callout.Text align="left">Read the latest → Chatbar component update</Callout.Text>
              </Callout.Root>
            </Link>
          </Hero.Root>
        </Flex>

        <Grid columns={{ initial: '1', sm: '2' }} gapX="4" gapY="6">
          {playgrounds.map(({ name, slug, Component }) => (
            <Flex key={slug} direction="column" gap="2" minWidth="0">
              <Box px="1">
                <KUILink asChild size="2" weight="medium" color="gray" highContrast>
                  <Link href={`/docs/${slug}`}>{name}</Link>
                </KUILink>
              </Box>
              <Component showControls={false} height="18rem" />
            </Flex>
          ))}
        </Grid>

        <Box mb={{ initial: '6', sm: '9' }}>
          <Footer.Root p={{ initial: '4', sm: '6' }} gap={{ initial: '6', sm: '8' }}>
            <Footer.Brand gap="6">
              <Flex direction="column" gap="4">
                <Heading asChild size="8" weight="medium" className="kd-wordmark" style={{ whiteSpace: 'normal' }}>
                  <p>Womp Design</p>
                </Heading>
                <Text size="2" color="gray">
                  Built on Kookie UI v1.
                </Text>
                <Footer.Legal>
                  <Text size="2" color="gray">
                    © {currentYear} Kushagra Dhawan.
                  </Text>
                  <Footer.Link href="https://github.com/KushagraDhawan1997/kookie-ui" target="_blank">
                    GitHub
                  </Footer.Link>
                  <Footer.Link href="/sitemap.xml">Sitemap</Footer.Link>
                </Footer.Legal>
              </Flex>
            </Footer.Brand>
            <Footer.Links>
              <Footer.LinkGroup title="Projects">
                <Footer.Link href="https://www.hellokookie.com/" target="_blank">
                  Kookie UI
                </Footer.Link>
                <Footer.Link href="https://womp.com" target="_blank">
                  Womp 3D
                </Footer.Link>
              </Footer.LinkGroup>
              <Footer.LinkGroup title="Support">
                <Footer.Link href="https://github.com/sponsors/KushagraDhawan1997" target="_blank">
                  GitHub Sponsors
                </Footer.Link>
              </Footer.LinkGroup>
            </Footer.Links>
          </Footer.Root>
        </Box>
      </Flex>
    </Box>
  );
}
