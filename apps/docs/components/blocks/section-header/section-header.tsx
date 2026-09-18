import * as React from 'react';
import { Flex, Heading, Separator, Text } from '@kushagradhawan/kookie-ui';
import type { FlexProps, HeadingProps, TextProps } from '@kushagradhawan/kookie-ui';

type Breakpoint = 'initial' | 'xs' | 'sm' | 'md' | 'lg' | 'xl';
type Responsive<T> = T | Partial<Record<Breakpoint, T>>;
type Layout = 'stacked' | 'inline';

/** Maps a (responsive) layout to a (responsive) Flex prop value. */
function mapLayout<T>(layout: Responsive<Layout>, map: (value: Layout) => T): Responsive<T> {
  if (typeof layout === 'string') return map(layout);

  const result: Partial<Record<Breakpoint, T>> = {};
  for (const [breakpoint, value] of Object.entries(layout) as [Breakpoint, Layout | undefined][]) {
    if (value) result[breakpoint] = map(value);
  }
  return result;
}

type SectionHeaderRootProps = Omit<FlexProps, 'align'> & {
  /** `inline` puts actions to the right of the title; `stacked` puts them below. @default "inline" */
  layout?: Responsive<Layout>;
  /** Cross-axis alignment. Defaults to `center` for inline and `start` for stacked. */
  align?: Responsive<'start' | 'center'>;
  /** Draw a separator under the header. */
  separator?: boolean;
};

const SectionHeaderRoot = React.forwardRef<HTMLDivElement, SectionHeaderRootProps>(
  ({ layout = 'inline', align, separator = false, gap = '4', direction, children, ...props }, ref) => (
    <Flex ref={ref} direction="column" gap={gap} {...props}>
      <Flex
        direction={direction ?? mapLayout(layout, (value) => (value === 'inline' ? 'row' : 'column'))}
        justify={mapLayout(layout, (value) => (value === 'inline' ? 'between' : 'start'))}
        align={align ?? mapLayout(layout, (value) => (value === 'inline' ? 'center' : 'start'))}
        gap={gap}
        wrap="wrap"
      >
        {children}
      </Flex>
      {separator && <Separator size="4" />}
    </Flex>
  ),
);
SectionHeaderRoot.displayName = 'SectionHeader.Root';

const SectionHeaderContent = React.forwardRef<HTMLDivElement, FlexProps>(
  ({ direction = 'column', gap = '1', ...props }, ref) => <Flex ref={ref} direction={direction} gap={gap} {...props} />,
);
SectionHeaderContent.displayName = 'SectionHeader.Content';

const SectionHeaderTitle = React.forwardRef<HTMLHeadingElement, HeadingProps>(
  ({ as = 'h2', size = '6', weight = 'medium', ...props }, ref) => (
    <Heading ref={ref} as={as} size={size} weight={weight} {...props} />
  ),
);
SectionHeaderTitle.displayName = 'SectionHeader.Title';

const SectionHeaderDescription = React.forwardRef<HTMLParagraphElement, TextProps>(
  ({ size = '3', color = 'gray', ...props }, ref) => <Text ref={ref} size={size} color={color} {...props} />,
);
SectionHeaderDescription.displayName = 'SectionHeader.Description';

const SectionHeaderActions = React.forwardRef<HTMLDivElement, FlexProps>(
  ({ gap = '2', align = 'center', ...props }, ref) => <Flex ref={ref} gap={gap} align={align} {...props} />,
);
SectionHeaderActions.displayName = 'SectionHeader.Actions';

const SectionHeaderTabs = React.forwardRef<HTMLDivElement, FlexProps>(({ width = '100%', ...props }, ref) => (
  <Flex ref={ref} width={width} {...props} />
));
SectionHeaderTabs.displayName = 'SectionHeader.Tabs';

export const SectionHeader = Object.assign(SectionHeaderRoot, {
  Root: SectionHeaderRoot,
  Content: SectionHeaderContent,
  Title: SectionHeaderTitle,
  Description: SectionHeaderDescription,
  Actions: SectionHeaderActions,
  Tabs: SectionHeaderTabs,
});
