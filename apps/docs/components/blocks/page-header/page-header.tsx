'use client';

import * as React from 'react';
import { Avatar, Box, Flex, Heading, Separator, Text } from '@kushagradhawan/kookie-ui';
import type { AvatarProps, BoxProps, FlexProps, HeadingProps, TextProps } from '@kushagradhawan/kookie-ui';

type Breakpoint = 'initial' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
type Responsive<T> = T | Partial<Record<Breakpoint, T>>;
type Layout = 'inline' | 'stacked';

function layoutToDirection(layout: Responsive<Layout>): Responsive<'row' | 'column'> {
  const toDirection = (value: Layout) => (value === 'stacked' ? 'column' : 'row');
  if (typeof layout === 'string') return toDirection(layout);

  const result: Partial<Record<Breakpoint, 'row' | 'column'>> = {};
  for (const [breakpoint, value] of Object.entries(layout) as [Breakpoint, Layout | undefined][]) {
    if (value) result[breakpoint] = toDirection(value);
  }
  return result;
}

const PageHeaderContext = React.createContext({ hasBanner: false });

/* -------------------------------------------------------------------------------------------------
 * Root
 * -----------------------------------------------------------------------------------------------*/

type PageHeaderRootProps = FlexProps & {
  /** Draw a separator under the header. Leave off when using `PageHeader.Tabs`. */
  separator?: boolean;
};

const PageHeaderRoot = React.forwardRef<HTMLDivElement, PageHeaderRootProps>(
  ({ direction = 'column', gap = '4', separator = false, children, ...props }, ref) => {
    const hasBanner = React.Children.toArray(children).some(
      (child) => React.isValidElement(child) && child.type === PageHeaderBanner,
    );
    const context = React.useMemo(() => ({ hasBanner }), [hasBanner]);

    return (
      <PageHeaderContext.Provider value={context}>
        <Flex ref={ref} direction={direction} gap={gap} {...props}>
          {children}
          {separator && <Separator size="4" />}
        </Flex>
      </PageHeaderContext.Provider>
    );
  },
);
PageHeaderRoot.displayName = 'PageHeader.Root';

/* -------------------------------------------------------------------------------------------------
 * Banner
 * -----------------------------------------------------------------------------------------------*/

type PageHeaderBannerProps = Omit<BoxProps, 'height'> & {
  src: string;
  alt?: string;
  /** @default "200px" */
  height?: string;
};

const PageHeaderBanner = React.forwardRef<HTMLDivElement, PageHeaderBannerProps>(
  ({ src, alt = '', height = '200px', style, ...props }, ref) => (
    <Box
      ref={ref}
      width="100%"
      height={height}
      role="img"
      aria-label={alt}
      style={{
        backgroundImage: `url(${src})`,
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        borderRadius: 'var(--radius-3)',
        ...style,
      }}
      {...props}
    />
  ),
);
PageHeaderBanner.displayName = 'PageHeader.Banner';

/* -------------------------------------------------------------------------------------------------
 * Main — row holding media, content and actions
 * -----------------------------------------------------------------------------------------------*/

type PageHeaderMainProps = FlexProps & {
  /** `inline` puts actions beside the title; `stacked` puts them below. Responsive. */
  layout?: Responsive<Layout>;
};

const PageHeaderMain = React.forwardRef<HTMLDivElement, PageHeaderMainProps>(
  ({ layout = 'inline', gap = '4', align = 'center', justify = 'between', direction, ...props }, ref) => (
    <Flex
      ref={ref}
      direction={direction ?? layoutToDirection(layout)}
      gap={gap}
      align={align}
      justify={justify}
      {...props}
    />
  ),
);
PageHeaderMain.displayName = 'PageHeader.Main';

/* -------------------------------------------------------------------------------------------------
 * Media — logo or avatar
 * -----------------------------------------------------------------------------------------------*/

type PageHeaderMediaProps = Omit<AvatarProps, 'radius'> & {
  /** `logo` is square, `avatar` is round. @default "avatar" */
  type?: 'logo' | 'avatar';
  /** Pull an avatar up over the banner. Needs a `PageHeader.Banner`. */
  overlap?: boolean;
};

const PageHeaderMedia = React.forwardRef<HTMLImageElement, PageHeaderMediaProps>(
  ({ type = 'avatar', overlap = false, size = '6', style, ...props }, ref) => {
    const { hasBanner } = React.useContext(PageHeaderContext);
    const shouldOverlap = overlap && hasBanner && type === 'avatar';

    return (
      <Avatar
        ref={ref}
        radius={type === 'logo' ? 'small' : 'full'}
        size={size}
        style={{
          ...(shouldOverlap && {
            marginTop: 'calc(var(--space-9) * -1)',
            border: '4px solid var(--color-background)',
          }),
          ...style,
        }}
        {...props}
      />
    );
  },
);
PageHeaderMedia.displayName = 'PageHeader.Media';

/* -------------------------------------------------------------------------------------------------
 * Text parts
 * -----------------------------------------------------------------------------------------------*/

const PageHeaderContent = React.forwardRef<HTMLDivElement, FlexProps>(
  ({ direction = 'column', gap = '2', flexGrow = '1', ...props }, ref) => (
    <Flex ref={ref} direction={direction} gap={gap} flexGrow={flexGrow} {...props} />
  ),
);
PageHeaderContent.displayName = 'PageHeader.Content';

const PageHeaderMeta = React.forwardRef<HTMLDivElement, FlexProps>(
  ({ gap = '2', align = 'center', wrap = 'wrap', ...props }, ref) => (
    <Flex ref={ref} gap={gap} align={align} wrap={wrap} {...props} />
  ),
);
PageHeaderMeta.displayName = 'PageHeader.Meta';

const PageHeaderTitle = React.forwardRef<HTMLHeadingElement, HeadingProps>(
  ({ as = 'h1', size = '9', weight = 'medium', ...props }, ref) => (
    <Heading ref={ref} as={as} size={size} weight={weight} {...props} />
  ),
);
PageHeaderTitle.displayName = 'PageHeader.Title';

const PageHeaderDescription = React.forwardRef<HTMLParagraphElement, TextProps>(
  ({ size = '4', color = 'gray', ...props }, ref) => <Text ref={ref} size={size} color={color} {...props} />,
);
PageHeaderDescription.displayName = 'PageHeader.Description';

const PageHeaderActions = React.forwardRef<HTMLDivElement, FlexProps>(
  ({ gap = '2', align = 'center', ...props }, ref) => <Flex ref={ref} gap={gap} align={align} {...props} />,
);
PageHeaderActions.displayName = 'PageHeader.Actions';

const PageHeaderTabs = React.forwardRef<HTMLDivElement, FlexProps>(
  ({ direction = 'column', width = '100%', ...props }, ref) => (
    <Flex ref={ref} direction={direction} width={width} {...props} />
  ),
);
PageHeaderTabs.displayName = 'PageHeader.Tabs';

export const PageHeader = Object.assign(PageHeaderRoot, {
  Root: PageHeaderRoot,
  Banner: PageHeaderBanner,
  Main: PageHeaderMain,
  Media: PageHeaderMedia,
  Content: PageHeaderContent,
  Meta: PageHeaderMeta,
  Title: PageHeaderTitle,
  Description: PageHeaderDescription,
  Actions: PageHeaderActions,
  Tabs: PageHeaderTabs,
});
