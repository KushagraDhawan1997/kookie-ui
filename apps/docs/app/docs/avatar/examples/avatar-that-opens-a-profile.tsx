import Link from 'next/link';
import { Avatar } from '@kushagradhawan/kookie-ui';

export default function ProfileLinkAvatar() {
  return (
    <Avatar asChild fallback="MK">
      <Link href="/docs/avatar" aria-label="Mira Kapoor's profile" />
    </Avatar>
  );
}
