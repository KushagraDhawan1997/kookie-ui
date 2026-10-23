'use client';

import { Theme, ThemePanel } from '@kushagradhawan/kookie-ui';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Theme accentColor="gray" grayColor="auto">
      {children}
      <ThemePanel defaultOpen={false} />
    </Theme>
  );
}
