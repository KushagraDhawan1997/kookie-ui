import { expect, test } from '@playwright/test';

test.describe('SegmentedControl', () => {
  // WAI-ARIA radio groups select on arrow keys. Skipped until SegmentedControl does.
  test.fixme('arrow keys move the selection', async ({ page }) => {
    await page.goto('/ui-test/segmented-control', { waitUntil: 'networkidle' });
    const group = page.getByRole('radiogroup').first();
    const radios = group.getByRole('radio');
    await radios.nth(1).click();
    await page.keyboard.press('ArrowRight');
    await expect(radios.nth(2)).toHaveAttribute('aria-checked', 'true');
  });

  test('arrow keys move focus and Space selects', async ({ page }) => {
    await page.goto('/ui-test/segmented-control', { waitUntil: 'networkidle' });
    const radios = page.getByRole('radiogroup').first().getByRole('radio');
    await radios.nth(1).click();
    await page.keyboard.press('ArrowRight');
    await expect(radios.nth(2)).toBeFocused();
    await page.keyboard.press('Space');
    await expect(radios.nth(2)).toHaveAttribute('aria-checked', 'true');
  });

  test('clicking a segment selects it', async ({ page }) => {
    await page.goto('/ui-test/segmented-control', { waitUntil: 'networkidle' });
    const group = page.getByRole('radiogroup').first();
    const last = group.getByRole('radio').last();
    await last.click();
    await expect(last).toHaveAttribute('aria-checked', 'true');
  });
});
