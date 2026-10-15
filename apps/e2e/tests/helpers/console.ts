import type { Page } from '@playwright/test';

/** Noise from the dev server that is not an app error. */
const IGNORED = [/Download the React DevTools/, /\[HMR\]/, /\[Fast Refresh\]/, /webpack-hmr/, /favicon/];

/** Collects console errors and uncaught exceptions for the life of the page. */
export function collectErrors(page: Page): string[] {
  const errors: string[] = [];
  page.on('console', (msg) => {
    if (msg.type() !== 'error') return;
    const text = msg.text();
    if (!IGNORED.some((re) => re.test(text))) errors.push(text);
  });
  page.on('pageerror', (err) => errors.push(`pageerror: ${err.message}`));
  return errors;
}
