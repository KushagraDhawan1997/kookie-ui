import { defineConfig } from 'vitest/config';

// Separate config for performance benchmarks so they never run in the normal
// test pass. Benchmarks run in `node` (no jsdom) because we measure the pure
// JS cost of prop extraction and server rendering, not DOM work.
export default defineConfig({
  test: {
    environment: 'node',
    globals: true,
    include: ['bench/**/*.bench.{ts,tsx}'],
    benchmark: {
      include: ['bench/**/*.bench.{ts,tsx}'],
    },
  },
});
