import * as React from 'react';
import { Flex, Heading, Text } from '@kushagradhawan/kookie-ui';
import type { FlexProps, HeadingProps, TextProps } from '@kushagradhawan/kookie-ui';

type Breakpoint = 'initial' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
type Responsive<T> = T | Partial<Record<Breakpoint, T>>;
type Layout = 'stacked' | 'split';

function layoutToDirection(layout: Responsive<Layout>): Responsive<'row' | 'column'> {
  const toDirection = (value: Layout) => (value === 'split' ? 'row' : 'column');
  if (typeof layout === 'string') return toDirection(layout);

  const result: Partial<Record<Breakpoint, 'row' | 'column'>> = {};
  for (const [breakpoint, value] of Object.entries(layout) as [Breakpoint, Layout | undefined][]) {
    if (value) result[breakpoint] = toDirection(value);
  }
  return result;
}

type HeroRootProps = FlexProps & {
  /** `stacked` centers everything in a column; `split` places media beside the copy. Responsive. */
  layout?: Responsive<Layout>;
};

const HeroRoot = React.forwardRef<HTMLDivElement, HeroRootProps>(
  ({ layout = 'stacked', align = 'center', gap = '6', direction, ...props }, ref) => (
    <Flex ref={ref} direction={direction ?? layoutToDirection(layout)} align={align} gap={gap} {...props} />
  ),
);
HeroRoot.displayName = 'Hero.Root';

/** Logos, badges or announcements above the title. */
const HeroMeta = React.forwardRef<HTMLDivElement, FlexProps>(({ gap = '2', align = 'center', ...props }, ref) => (
  <Flex ref={ref} gap={gap} align={align} {...props} />
));
HeroMeta.displayName = 'Hero.Meta';

const HeroTitle = React.forwardRef<HTMLHeadingElement, HeadingProps>(
  ({ size = '9', weight = 'medium', align = 'center', ...props }, ref) => (
    <Heading ref={ref} size={size} weight={weight} align={align} {...props} />
  ),
);
HeroTitle.displayName = 'Hero.Title';

const HeroDescription = React.forwardRef<HTMLParagraphElement, TextProps>(
  ({ size = '4', align = 'center', ...props }, ref) => <Text ref={ref} size={size} align={align} {...props} />,
);
HeroDescription.displayName = 'Hero.Description';

const HeroActions = React.forwardRef<HTMLDivElement, FlexProps>(
  ({ gap = '2', direction = 'row', align = 'center', ...props }, ref) => (
    <Flex ref={ref} gap={gap} direction={direction} align={align} {...props} />
  ),
);
HeroActions.displayName = 'Hero.Actions';

/** Image, video or product shot. */
const HeroMedia = React.forwardRef<HTMLDivElement, FlexProps>((props, ref) => <Flex ref={ref} {...props} />);
HeroMedia.displayName = 'Hero.Media';

export const Hero = Object.assign(HeroRoot, {
  Root: HeroRoot,
  Meta: HeroMeta,
  Title: HeroTitle,
  Description: HeroDescription,
  Actions: HeroActions,
  Media: HeroMedia,
});
