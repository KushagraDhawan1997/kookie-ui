import { expect, test } from '@playwright/test';

test.describe('Combobox', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/docs/combobox', { waitUntil: 'networkidle' });
  });

  test('filters options by typing and selects one', async ({ page }) => {
    const combo = page.getByRole('combobox', { name: 'Country' });
    await expect(combo).toHaveText(/France/);
    await combo.click();
    await page.keyboard.type('Ger');
    const option = page.getByRole('option', { name: /Germany/ });
    await expect(option).toBeVisible();
    await expect(page.getByRole('option', { name: /France/ })).toHaveCount(0);
    await option.click();
    await expect(combo).toHaveText(/Germany/);
  });

  test('Escape closes without changing the value', async ({ page }) => {
    const combo = page.getByRole('combobox', { name: 'Country' });
    await combo.click();
    await expect(page.getByRole('listbox')).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(page.getByRole('listbox')).toBeHidden();
    await expect(combo).toHaveText(/France/);
  });
});
