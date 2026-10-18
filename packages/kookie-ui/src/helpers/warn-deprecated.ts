const warned = new Set<string>();

/**
 * Warns once per session, in development only, that something a caller used is deprecated.
 * `process.env.NODE_ENV` is a compile-time constant, so production bundles drop the body.
 */
function warnDeprecated(message: string) {
  if (process.env.NODE_ENV === 'production' || warned.has(message)) return;
  warned.add(message);
  console.warn(`[kookie-ui] ${message}`);
}

export { warnDeprecated };
