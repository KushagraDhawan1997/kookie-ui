import { expect, test } from '@playwright/test';

test.describe('Sheet', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/docs/sheet', { waitUntil: 'networkidle' });
  });

  test('opens as a modal dialog and closes on Escape, returning focus', async ({ page }) => {
    const trigger = page.getByRole('button', { name: 'Open Sheet' });
    await trigger.click();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    await expect(dialog).toHaveAttribute('aria-modal', 'true');
    await page.keyboard.press('Escape');
    await expect(dialog).toBeHidden();
    await expect(trigger).toBeFocused();
  });

  test('traps focus inside while open', async ({ page }) => {
    await page.getByRole('button', { name: 'Open Sheet' }).click();
    const dialog = page.getByRole('dialog');
    await expect(dialog).toBeVisible();
    for (let i = 0; i < 15; i++) {
      await page.keyboard.press('Tab');
      const inside = await dialog.evaluate((el) => el.contains(document.activeElement));
      expect(inside, `focus escaped after ${i + 1} tabs`).toBe(true);
    }
  });
});
