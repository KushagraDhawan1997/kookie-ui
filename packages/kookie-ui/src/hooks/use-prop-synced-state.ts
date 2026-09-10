import * as React from 'react';

/**
 * State that tracks a prop but can also be set imperatively — the shape `Theme`
 * needs, where a prop sets the value and `ThemePanel` can change it at runtime.
 *
 * Adjusts state during render rather than syncing in a `useEffect`. An effect
 * would commit one render carrying the *old* value and schedule a second one,
 * which for a provider means every consumer renders twice and the browser can
 * paint the stale value in between.
 *
 * @see https://react.dev/reference/react/useState#storing-information-from-previous-renders
 */
export function usePropSyncedState<T>(propValue: T) {
  const [value, setValue] = React.useState(propValue);
  const [previousPropValue, setPreviousPropValue] = React.useState(propValue);

  if (!Object.is(propValue, previousPropValue)) {
    setPreviousPropValue(propValue);
    setValue(propValue);
  }

  return [value, setValue] as const;
}
