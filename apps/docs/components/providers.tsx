'use client';

import { Theme, TooltipProvider } from '@kushagradhawan/kookie-ui';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <Theme accentColor="gray" grayColor="auto">
      <TooltipProvider>{children}</TooltipProvider>
    </Theme>
  );
}
