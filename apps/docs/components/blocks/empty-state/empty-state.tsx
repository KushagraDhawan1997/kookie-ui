import * as React from 'react';
import { Box, Flex, Heading, Text } from '@kushagradhawan/kookie-ui';
import type { BoxProps, FlexProps, HeadingProps, TextProps } from '@kushagradhawan/kookie-ui';
import './empty-state.css';

type EmptyStateRootProps = Omit<FlexProps, 'direction' | 'align'> & {
  /** @default "center" */
  align?: 'start' | 'center';
};

const EmptyStateRoot = React.forwardRef<HTMLDivElement, EmptyStateRootProps>(
  ({ align = 'center', gap = '4', ...props }, ref) => <Flex ref={ref} direction="column" align={align} gap={gap} {...props} />,
);
EmptyStateRoot.displayName = 'EmptyState.Root';

/** Sizes and tints the icon or illustration inside it. */
const EmptyStateIcon = React.forwardRef<HTMLDivElement, BoxProps>(({ className, ...props }, ref) => (
  <Box ref={ref} className={className ? `empty-state-icon ${className}` : 'empty-state-icon'} {...props} />
));
EmptyStateIcon.displayName = 'EmptyState.Icon';

/** Groups the title and description. */
const EmptyStateContent = React.forwardRef<HTMLDivElement, FlexProps>(({ direction = 'column', gap = '1', ...props }, ref) => (
  <Flex ref={ref} direction={direction} gap={gap} {...props} />
));
EmptyStateContent.displayName = 'EmptyState.Content';

const EmptyStateTitle = React.forwardRef<HTMLHeadingElement, HeadingProps>(
  ({ as = 'h3', size = '5', weight = 'medium', align = 'center', ...props }, ref) => (
    <Heading ref={ref} as={as} size={size} weight={weight} align={align} {...props} />
  ),
);
EmptyStateTitle.displayName = 'EmptyState.Title';

const EmptyStateDescription = React.forwardRef<HTMLParagraphElement, TextProps>(
  ({ size = '2', color = 'gray', align = 'center', ...props }, ref) => (
    <Text ref={ref} size={size} color={color} align={align} {...props} />
  ),
);
EmptyStateDescription.displayName = 'EmptyState.Description';

const EmptyStateActions = React.forwardRef<HTMLDivElement, FlexProps>(
  ({ gap = '2', align = 'center', justify = 'center', ...props }, ref) => (
    <Flex ref={ref} gap={gap} align={align} justify={justify} {...props} />
  ),
);
EmptyStateActions.displayName = 'EmptyState.Actions';

export const EmptyState = Object.assign(EmptyStateRoot, {
  Root: EmptyStateRoot,
  Icon: EmptyStateIcon,
  Content: EmptyStateContent,
  Title: EmptyStateTitle,
  Description: EmptyStateDescription,
  Actions: EmptyStateActions,
});
