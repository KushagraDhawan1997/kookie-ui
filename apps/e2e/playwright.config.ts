import { defineConfig, devices } from '@playwright/test';
import { BASE_URL as baseURL } from './tests/helpers/routes';

/** Runs against the docs dev server, which must already be up. */
export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: [['list'], ['html', { open: 'never' }]],
  timeout: 60_000,
  // The dev server compiles routes on first visit, so allow for slow navigations.
  expect: {
    timeout: 15_000,
    toHaveScreenshot: { maxDiffPixelRatio: 0.01, animations: 'disabled' },
  },
  snapshotPathTemplate: '{testDir}/__screenshots__/{arg}{ext}',
  workers: process.env.CI ? 2 : 4,
  use: {
    baseURL,
    trace: 'retain-on-failure',
  },
  projects: [{ name: 'chromium', use: { ...devices['Desktop Chrome'] } }],
});
