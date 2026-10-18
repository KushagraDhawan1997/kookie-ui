import { warnDeprecated } from './warn-deprecated.js';

/**
 * `classic` was renamed `raised` in 0.14.0. The old name still renders, as `raised`, with a
 * one-time warning in development. Button's `override` is not a look but a way out of the
 * styles, so it warns too. Both are removed in 0.15.0.
 */
function parseVariant(value: string): string {
  if (value === 'classic') {
    warnDeprecated('`variant="classic"` is deprecated and will be removed in 0.15.0. Use `variant="raised"`.');
    return 'raised';
  }
  if (value === 'override') {
    warnDeprecated(
      '`variant="override"` is deprecated and will be removed in 0.15.0. Style the component with `className`, `style` or its CSS variables instead.',
    );
  }
  return value;
}

export { parseVariant };
