import * as React from 'react';
import { Flex, Heading, IconButton, Link, Text } from '@kushagradhawan/kookie-ui';
import type { FlexProps, IconButtonProps, LinkProps, TextProps } from '@kushagradhawan/kookie-ui';

type FooterRootProps = Omit<FlexProps, 'align'> & {
  /** @default "left" */
  align?: 'left' | 'center';
};

const FooterRoot = React.forwardRef<HTMLDivElement, FooterRootProps>(
  ({ align = 'left', direction = 'column', gap = '6', children, ...props }, ref) => (
    <Flex ref={ref} asChild direction={direction} align={align === 'center' ? 'center' : 'stretch'} gap={gap} {...props}>
      <footer>{children}</footer>
    </Flex>
  ),
);
FooterRoot.displayName = 'Footer.Root';

/** Top section: brand on one side, link groups on the other. */
const FooterMain = React.forwardRef<HTMLDivElement, FlexProps>(
  ({ gap = '8', justify = 'between', align = 'start', wrap = 'wrap', ...props }, ref) => (
    <Flex ref={ref} gap={gap} justify={justify} align={align} wrap={wrap} {...props} />
  ),
);
FooterMain.displayName = 'Footer.Main';

/** Bottom bar for legal text and social links. */
const FooterBottom = React.forwardRef<HTMLDivElement, FlexProps>(
  ({ gap = '4', justify = 'between', align = 'center', wrap = 'wrap', ...props }, ref) => (
    <Flex ref={ref} gap={gap} justify={justify} align={align} wrap={wrap} {...props} />
  ),
);
FooterBottom.displayName = 'Footer.Bottom';

const FooterBrand = React.forwardRef<HTMLDivElement, FlexProps>(({ direction = 'column', gap = '3', ...props }, ref) => (
  <Flex ref={ref} direction={direction} gap={gap} {...props} />
));
FooterBrand.displayName = 'Footer.Brand';

const FooterBrandName = React.forwardRef<HTMLSpanElement, TextProps>(({ size = '4', weight = 'bold', ...props }, ref) => (
  <Text ref={ref} size={size} weight={weight} {...props} />
));
FooterBrandName.displayName = 'Footer.BrandName';

const FooterTagline = React.forwardRef<HTMLSpanElement, TextProps>(({ size = '2', emphasis = 'medium', ...props }, ref) => (
  <Text ref={ref} size={size} emphasis={emphasis} {...props} />
));
FooterTagline.displayName = 'Footer.Tagline';

/** Holds several `Footer.LinkGroup` columns. */
const FooterLinks = React.forwardRef<HTMLDivElement, FlexProps>(({ gap = '8', wrap = 'wrap', ...props }, ref) => (
  <Flex ref={ref} gap={gap} wrap={wrap} {...props} />
));
FooterLinks.displayName = 'Footer.Links';

type FooterLinkGroupProps = FlexProps & { title: string };

const FooterLinkGroup = React.forwardRef<HTMLDivElement, FooterLinkGroupProps>(
  ({ title, direction = 'column', gap = '3', children, ...props }, ref) => (
    <Flex ref={ref} direction={direction} gap={gap} {...props}>
      <Heading as="h3" size="2" weight="medium">
        {title}
      </Heading>
      <Flex direction="column" gap="2">
        {children}
      </Flex>
    </Flex>
  ),
);
FooterLinkGroup.displayName = 'Footer.LinkGroup';

/** A single row of links, for footers without groups. */
const FooterNav = React.forwardRef<HTMLDivElement, FlexProps>(
  ({ gap = '6', align = 'center', wrap = 'wrap', children, ...props }, ref) => (
    <Flex ref={ref} asChild gap={gap} align={align} wrap={wrap} {...props}>
      <nav>{children}</nav>
    </Flex>
  ),
);
FooterNav.displayName = 'Footer.Nav';

const FooterLink = React.forwardRef<HTMLAnchorElement, LinkProps>(({ size = '2', color = 'gray', ...props }, ref) => (
  <Link ref={ref} size={size} color={color} {...props} />
));
FooterLink.displayName = 'Footer.Link';

/** Copyright line and legal links. */
const FooterLegal = React.forwardRef<HTMLDivElement, FlexProps>(
  ({ gap = '4', align = 'center', wrap = 'wrap', ...props }, ref) => (
    <Flex ref={ref} gap={gap} align={align} wrap={wrap} {...props} />
  ),
);
FooterLegal.displayName = 'Footer.Legal';

const FooterSocial = React.forwardRef<HTMLDivElement, FlexProps>(({ gap = '4', align = 'center', ...props }, ref) => (
  <Flex ref={ref} gap={gap} align={align} {...props} />
));
FooterSocial.displayName = 'Footer.Social';

type FooterSocialLinkProps = Omit<IconButtonProps, 'children' | 'aria-label' | 'aria-labelledby' | 'asChild'> & {
  /** The icon to render, e.g. an SVG component. */
  icon: React.ComponentType;
  /** Accessible name, e.g. "GitHub". */
  label: string;
  href: string;
};

const FooterSocialLink = React.forwardRef<HTMLButtonElement, FooterSocialLinkProps>(
  ({ icon: Icon, label, href, variant = 'ghost', color = 'gray', size = '2', ...props }, ref) => (
    <IconButton ref={ref} asChild variant={variant} color={color} size={size} aria-label={label} {...props}>
      <a href={href} target="_blank" rel="noopener noreferrer">
        <Icon />
      </a>
    </IconButton>
  ),
);
FooterSocialLink.displayName = 'Footer.SocialLink';

export const Footer = Object.assign(FooterRoot, {
  Root: FooterRoot,
  Main: FooterMain,
  Bottom: FooterBottom,
  Brand: FooterBrand,
  BrandName: FooterBrandName,
  Tagline: FooterTagline,
  Links: FooterLinks,
  LinkGroup: FooterLinkGroup,
  Nav: FooterNav,
  Link: FooterLink,
  Legal: FooterLegal,
  Social: FooterSocial,
  SocialLink: FooterSocialLink,
});
