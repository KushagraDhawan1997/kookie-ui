import { Avatar, Chip } from '@kushagradhawan/kookie-ui';

export default function UnreadMessagesAvatar() {
  return (
    <Avatar
      size="4"
      fallback="MK"
      alt="Mira Kapoor, 3 unread messages"
      badge={
        <Chip size="1" variant="solid" color="red">
          3
        </Chip>
      }
    />
  );
}
