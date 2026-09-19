import * as React from 'react';
import { Avatar, Flex, Heading, Text } from '@kushagradhawan/kookie-ui';
import type { AvatarProps, FlexProps, HeadingProps, TextProps } from '@kushagradhawan/kookie-ui';

const TestimonialRoot = React.forwardRef<HTMLDivElement, FlexProps>(
  ({ direction = 'column', align = 'center', justify = 'center', gap = '6', ...props }, ref) => (
    <Flex ref={ref} direction={direction} align={align} justify={justify} gap={gap} {...props} />
  ),
);
TestimonialRoot.displayName = 'Testimonial.Root';

/** The quote. Pass the words only; quotation marks are added. */
const TestimonialQuote = React.forwardRef<HTMLHeadingElement, HeadingProps>(
  ({ size = '7', align = 'center', weight = 'medium', children, ...props }, ref) => (
    <Heading ref={ref} size={size} align={align} weight={weight} {...props}>
      “{children}”
    </Heading>
  ),
);
TestimonialQuote.displayName = 'Testimonial.Quote';

/** Groups the avatar and details. */
const TestimonialAuthor = React.forwardRef<HTMLDivElement, FlexProps>(
  ({ direction = 'column', align = 'center', gap = '2', ...props }, ref) => (
    <Flex ref={ref} direction={direction} align={align} gap={gap} {...props} />
  ),
);
TestimonialAuthor.displayName = 'Testimonial.Author';

const TestimonialAvatar = React.forwardRef<HTMLImageElement, AvatarProps>(
  ({ size = '4', radius = 'full', ...props }, ref) => <Avatar ref={ref} size={size} radius={radius} {...props} />,
);
TestimonialAvatar.displayName = 'Testimonial.Avatar';

/** Groups the name and role. */
const TestimonialDetails = React.forwardRef<HTMLDivElement, FlexProps>(
  ({ direction = 'column', align = 'center', gap = '0', ...props }, ref) => (
    <Flex ref={ref} direction={direction} align={align} gap={gap} {...props} />
  ),
);
TestimonialDetails.displayName = 'Testimonial.Details';

const TestimonialName = React.forwardRef<HTMLSpanElement, TextProps>(({ size = '3', weight = 'medium', ...props }, ref) => (
  <Text ref={ref} size={size} weight={weight} {...props} />
));
TestimonialName.displayName = 'Testimonial.Name';

const TestimonialRole = React.forwardRef<HTMLSpanElement, TextProps>(({ size = '2', emphasis = 'medium', ...props }, ref) => (
  <Text ref={ref} size={size} emphasis={emphasis} {...props} />
));
TestimonialRole.displayName = 'Testimonial.Role';

export const Testimonial = Object.assign(TestimonialRoot, {
  Root: TestimonialRoot,
  Quote: TestimonialQuote,
  Author: TestimonialAuthor,
  Avatar: TestimonialAvatar,
  Details: TestimonialDetails,
  Name: TestimonialName,
  Role: TestimonialRole,
});
