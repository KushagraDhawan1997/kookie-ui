import Link from 'next/link';
import { Button } from '@kushagradhawan/kookie-ui';

export default function OpenSettingsButton() {
  return (
    <Button asChild>
      <Link href="/start/theming">Open settings</Link>
    </Button>
  );
}
