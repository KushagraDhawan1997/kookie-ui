import type { ReactNode } from 'react';
import { Flex, Text, Toolbar } from '@kushagradhawan/kookie-ui';

function NotesLayout({ children }: { children: ReactNode }) {
  return (
    <Flex direction="column" gap="3" width="100%" maxWidth="360px">
      <Toolbar aria-label="Page">
        <Toolbar.Button>All notes</Toolbar.Button>
        <Toolbar.Slot name="note-actions" />
      </Toolbar>
      {children}
    </Flex>
  );
}

export default function NotePage() {
  return (
    <NotesLayout>
      <Toolbar.Fill name="note-actions">
        <Toolbar.Button emphasis="loud">Publish</Toolbar.Button>
      </Toolbar.Fill>
      <Text size="2">Draft saved a minute ago.</Text>
    </NotesLayout>
  );
}
