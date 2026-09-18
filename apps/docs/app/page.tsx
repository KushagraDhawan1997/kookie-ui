'use client';

import React from 'react';
import { Button, Container, Section, Link as KUILink, Callout, Flex, Grid, Heading, Text, Box } from '@kushagradhawan/kookie-ui';
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
    <>
      <Section position="relative" size="4">
        <Container size="4">
          <Flex direction="column" align="start" gap={{ initial: '5', sm: '8' }} py={{ initial: '4', sm: '6' }} px={{ initial: '4', sm: '6' }}>
            <Heading size="3" weight="medium">
              Kookie UI v1
            </Heading>

            <Hero.Root align="start" gap={{ initial: '6', sm: '8' }}>
              <Hero.Title size={{ initial: '8', sm: '9', lg: '10' }} weight="medium" align="left">
                Womp&apos;s Design System
              </Hero.Title>

              <Hero.Description size={{ initial: '3', sm: '4' }} color="gray" align="left">
                An open-source{' '}
                <KUILink target="_blank" href="https://github.com/KushagraDhawan1997/kookie-ui" rel="noopener noreferrer" underline="always" color="blue">
                  fork
                </KUILink>{' '}
                of{' '}
                <KUILink target="_blank" href="https://radix-ui.com/themes" rel="noopener noreferrer" underline="always" color="blue">
                  Radix Themes
                </KUILink>
                , focused on building scalable, consistent UI components with a fresh visual style and practical foundations.
              </Hero.Description>

              <Hero.Actions gap="3">
                <Button asChild variant="solid" size="3" highContrast>
                  <Link href="/docs/installation">
                    Get Started
                    <HugeiconsIcon icon={ArrowUpRight01Icon} />
                  </Link>
                </Button>
                <Button asChild variant="soft" highContrast size="3">
                  <a href="https://github.com/KushagraDhawan1997/kookie-ui" target="_blank" rel="noopener noreferrer">
                    GitHub
                    <HugeiconsIcon icon={ArrowRight01Icon} />
                  </a>
                </Button>
              </Hero.Actions>

              <Flex justify="start">
                <Link href="https://www.kushagradhawan.com/articles/kookie-chatbar-update" target="_blank" rel="noopener noreferrer" style={{ textDecoration: 'none' }}>
                  <Callout.Root highContrast variant="outline" color="gray" size="2" style={{ cursor: 'pointer' }}>
                    <Callout.Text align="left">Read the latest → Chatbar component update</Callout.Text>
                  </Callout.Root>
                </Link>
              </Flex>
            </Hero.Root>
          </Flex>
        </Container>
      </Section>

      <Section size="4">
        <Container size="4">
          <Flex direction="column" py={{ initial: '4', sm: '6' }} px={{ initial: '4', sm: '6' }}>
            <Grid columns={{ initial: '1', sm: '2', lg: '2' }} gap="4">
              {playgrounds.map(({ name, slug, Component }) => (
                <Flex key={slug} direction="column">
                  <Box px="1">
                    <KUILink asChild size="2" weight="medium" color="gray" highContrast>
                      <Link href={`/docs/${slug}`}>{name}</Link>
                    </KUILink>
                  </Box>
                  <Component showControls={false} height="360px" />
                </Flex>
              ))}
            </Grid>
          </Flex>
        </Container>
      </Section>

      <Box mb={{ initial: '6', sm: '9' }}>
        <Container size="4">
          <Footer.Root p={{ initial: '4', sm: '8' }} gap={{ initial: '6', sm: '8' }} px={{ initial: '4', sm: '6' }}>
            <Footer.Brand gap="6">
              <Flex direction="column" gap="4">
                <Heading asChild size="8" weight="medium" className="kd-wordmark" style={{ whiteSpace: 'normal' }}>
                  <p>Kookie UI - Womp&apos;s Design System</p>
                </Heading>
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
        </Container>
      </Box>
    </>
  );
}
