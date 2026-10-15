import { expect, test } from '@playwright/test';

test.describe('Docs sidebar navigation', () => {
  test('clicking a sidebar link navigates and marks it current', async ({ page }) => {
    await page.goto('/docs/button', { waitUntil: 'networkidle' });
    // Sidebar links carry role="menuitem", so they are found by href rather than role.
    const link = page.locator('a[href="/docs/badge"]').first();
    await link.click();
    await expect(page).toHaveURL(/\/docs\/badge$/);
    await expect(link).toHaveAttribute('aria-current', 'page');
  });
});
