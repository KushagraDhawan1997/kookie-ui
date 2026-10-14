import * as React from 'react';
import { useBreakpoint } from '../hooks/use-breakpoint.js';
import type { PresentationValue, ResponsivePresentation } from './shell.types.js';
import { tableOf, warnOnce } from './_internal/shell-store.js';

/**
 * @deprecated Since 0.8.0 the Shell resolves a responsive `presentation` in
 * its stylesheet, so the pane is placed before any script runs. This hook
 * resolves it in JS after mount, which is the behaviour the Shell left
 * behind. It keeps working until 1.0.
 */
function useResponsivePresentation(presentation: ResponsivePresentation): PresentationValue {
  React.useEffect(() => {
    warnOnce('Shell.useResponsivePresentation is deprecated and is removed in 1.0. The Shell resolves presentation in CSS.');
  }, []);
  const { breakpoint } = useBreakpoint(typeof presentation !== 'string');
  return tableOf<PresentationValue>(presentation, () => 'fixed')[breakpoint];
}

export { useResponsivePresentation };
