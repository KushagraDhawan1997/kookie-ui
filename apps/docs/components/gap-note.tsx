import type { ReactNode } from 'react';
import { Callout, Text } from '@kushagradhawan/kookie-ui';

/**
 * Marks a place where v1 does not yet follow the principle the chapter states (docs/LOG.md,
 * 2026-09-19). Each note is part of the migration backlog and is deleted when v1 is fixed, so
 * every chapter uses this one component and the notes are easy to find.
 */
export function GapNote({ children }: { children: ReactNode }) {
  return (
    <Callout.Root color="amber" variant="soft" size="2" my="5">
      {/* Text as a div, not Callout.Text (a paragraph), because MDX wraps the note's text in its
          own paragraphs. */}
      <Text as="div" size="2">
        <strong>Not yet in v1.</strong>
        {children}
      </Text>
    </Callout.Root>
  );
}
