import { playwright } from '@vitest/browser-playwright';
import { defineConfig } from 'vitest/config';

/**
 * Two projects.
 *
 * `jsdom` covers behaviour that needs a DOM but no layout: props, ARIA, events, state.
 *
 * `browser` mounts components in real Chromium through Playwright. It answers what jsdom cannot:
 * layout, scrolling, focus, computed CSS. A component that ships in Womp's Kookie is tested here,
 * because this repo has no docs site to test it through. Browser tests are named
 * `*.browser.test.tsx` and live beside the jsdom tests for the same component.
 */
export default defineConfig({
  test: {
    restoreMocks: true,
    clearMocks: true,
    projects: [
      {
        extends: true,
        test: {
          name: 'jsdom',
          environment: 'jsdom',
          globals: true,
          setupFiles: ['tests/setup.ts'],
          include: ['tests/**/*.{test,spec}.{ts,tsx}'],
          exclude: ['dist', 'node_modules', 'tests/**/*.browser.test.{ts,tsx}'],
          css: true,
          // Run test files one at a time in forks to avoid EPERM errors on macOS
          pool: 'forks',
          fileParallelism: false,
          testTimeout: 2000,
          hookTimeout: 2000,
        },
      },
      {
        extends: true,
        // Pre-bundled up front: a dependency discovered mid-run makes Vite reload the page.
        optimizeDeps: {
          include: ['react', 'react-dom', 'react-dom/client', 'react/jsx-dev-runtime', 'radix-ui', 'motion/react', 'react-dropzone', '@shadcn/react/message-scroller', 'classnames'],
        },
        test: {
          name: 'browser',
          include: ['tests/**/*.browser.test.{ts,tsx}'],
          setupFiles: ['tests/browser-setup.ts'],
          testTimeout: 15000,
          browser: {
            enabled: true,
            provider: playwright(),
            headless: true,
            viewport: { width: 1280, height: 800 },
            instances: [{ browser: 'chromium' }],
          },
        },
      },
    ],
  },
});
