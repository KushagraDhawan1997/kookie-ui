import React from 'react';
import { Avatar, Card, Flex, Text } from '@kushagradhawan/kookie-ui';

type UserCardSize = '1' | '2' | '3' | '4';

interface UserCardProps extends Omit<React.ComponentPropsWithoutRef<typeof Card>, 'children' | 'size'> {
  /** The person's name. */
  name: string;
  /** A second line, such as a role or an email. */
  description?: string;
  /** Avatar image URL. */
  src?: string;
  /** Initials or an icon shown when there is no image. */
  fallback: NonNullable<React.ReactNode>;
  /** Card padding, avatar and text size. Default `2`. */
  size?: UserCardSize;
}

// Avatar size, name size, description size for each card size.
const SIZES = {
  '1': ['1', '1', '1'],
  '2': ['2', '2', '1'],
  '3': ['3', '3', '2'],
  '4': ['4', '4', '3'],
} as const;

export const UserCard = React.forwardRef<HTMLDivElement, UserCardProps>(({ name, description, src, fallback, size = '2', ...props }, ref) => {
  const [avatarSize, nameSize, descriptionSize] = SIZES[size];
  return (
    <Card size={size} {...props} ref={ref}>
      <Flex align="center" gap="4">
        <Avatar size={avatarSize} src={src} fallback={fallback} />
        <Flex direction="column" minWidth="0">
          <Text size={nameSize} weight="medium" truncate>
            {name}
          </Text>
          {description ? (
            <Text size={descriptionSize} emphasis="medium" truncate>
              {description}
            </Text>
          ) : null}
        </Flex>
      </Flex>
    </Card>
  );
});
UserCard.displayName = 'UserCard';
