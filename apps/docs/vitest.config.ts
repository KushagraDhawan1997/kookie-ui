import path from 'node:path';
import { defineConfig } from 'vitest/config';

/** Docs tests: every live example on a component page renders without an error. */
export default defineConfig({
  // Vitest runs on Vite's oxc transform; the installed config types don't list `oxc` yet.
  // @ts-expect-error -- oxc is read at runtime
  oxc: { jsx: { runtime: 'automatic' } },
  resolve: { alias: { '@': path.resolve(import.meta.dirname) } },
  test: {
    name: 'docs',
    environment: 'jsdom',
    include: ['tests/**/*.test.{ts,tsx}'],
    setupFiles: ['tests/setup.ts'],
    // The transform cache keeps an old import.meta.glob result, so a new example file would go untested.
    fsModuleCache: false,
  },
});
