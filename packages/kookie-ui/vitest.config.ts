import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: ['tests/setup.ts'],
    include: ['tests/**/*.{test,spec}.{ts,tsx}'],
    exclude: ['dist', 'node_modules'],
    css: true,
    restoreMocks: true,
    clearMocks: true,
    // Run test files one at a time in forks to avoid EPERM errors on macOS
    pool: 'forks',
    fileParallelism: false,
    testTimeout: 2000,
    hookTimeout: 2000,
  },
});
