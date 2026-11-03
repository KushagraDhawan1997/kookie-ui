import Link from 'next/link';
import { Toolbar } from '@kushagradhawan/kookie-ui';

export default function DocumentToolbar() {
  return (
    <Toolbar aria-label="Document">
      <Toolbar.Title>Release notes</Toolbar.Title>
      <Toolbar.Button asChild>
        <Link href="/docs/toolbar">Help</Link>
      </Toolbar.Button>
    </Toolbar>
  );
}
