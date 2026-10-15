import { expect, test } from '@playwright/test';
import { collectErrors } from './helpers/console';
import { getRoutes } from './helpers/routes';

for (const route of getRoutes()) {
  test(`loads ${route}`, async ({ page }) => {
    const errors = collectErrors(page);
    const res = await page.goto(route, { waitUntil: 'networkidle' });
    expect(res?.status(), 'HTTP status').toBeLessThan(400);
    await expect(page.locator('main, [role="main"]').first()).toBeVisible();
    expect(errors, errors.join('\n')).toEqual([]);
  });
}

test('unknown route returns 404', async ({ page }) => {
  const res = await page.goto('/this-route-does-not-exist');
  expect(res?.status()).toBe(404);
});
