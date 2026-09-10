import * as React from 'react';

const PANEL_BACKGROUND_MESSAGE = 'Warning: The `panelBackground` prop is deprecated and will be removed in a future version. Use `material` prop instead.';

const warned = new Set<string>();

function warnOnce(message: string) {
  if (warned.has(message)) return;
  warned.add(message);
  console.warn(message);
}

/**
 * Warns, in development only, that `panelBackground` is deprecated.
 *
 * The `process.env.NODE_ENV` check is a compile-time constant, so a production
 * bundle minifies the effect body away to an empty function instead of reading
 * props and formatting a message per mounted component. The message is also
 * logged once per session rather than once per component instance.
 */
export function useDeprecatedPanelBackgroundWarning(panelBackground: unknown) {
  React.useEffect(() => {
    if (process.env.NODE_ENV === 'production') return;
    if (panelBackground !== undefined) warnOnce(PANEL_BACKGROUND_MESSAGE);
  }, [panelBackground]);
}
