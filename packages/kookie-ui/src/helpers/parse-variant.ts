const warned = new Set<string>();

/**
 * `classic` was renamed `raised` in 0.14.0. The old name still works and renders as `raised`,
 * with a one-time warning in development. It is removed in 0.15.0.
 */
function parseVariant(value: string): string {
  if (value !== 'classic') return value;
  if (process.env.NODE_ENV !== 'production' && !warned.has(value)) {
    warned.add(value);
    console.warn('[kookie-ui] `variant="classic"` is deprecated and will be removed in 0.15.0. Use `variant="raised"`.');
  }
  return 'raised';
}

export { parseVariant };
