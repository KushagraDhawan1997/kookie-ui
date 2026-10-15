import { expect, test, type Page } from '@playwright/test';

/** The open popover menu. The docs sidebar also uses role="menu", so match on Radix content. */
const openMenu = (page: Page) => page.locator('[data-radix-menu-content][data-state="open"]');
const highlighted = (page: Page) => openMenu(page).locator('[data-highlighted]');

test.describe('DropdownMenu', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/ui-test/dropdown-menu', { waitUntil: 'networkidle' });
  });

  test('opens on click and closes on Escape, returning focus to the trigger', async ({ page }) => {
    const trigger = page.getByRole('button', { name: 'Open Standard Menu' });
    await trigger.click();
    const menu = openMenu(page);
    await expect(menu).toBeVisible();
    await page.keyboard.press('Escape');
    await expect(menu).toBeHidden();
    await expect(trigger).toBeFocused();
  });

  test('opens from the keyboard and moves focus with arrow keys', async ({ page }) => {
    const trigger = page.getByRole('button', { name: 'Open Standard Menu' });
    await trigger.focus();
    await page.keyboard.press('Enter');
    await expect(highlighted(page)).toHaveText('Item 1');
    await page.keyboard.press('ArrowDown');
    await expect(highlighted(page)).toHaveText('Item 2');
    await page.keyboard.press('ArrowUp');
    await expect(highlighted(page)).toHaveText('Item 1');
  });

  test('selecting an item closes the menu', async ({ page }) => {
    await page.getByRole('button', { name: 'Open Standard Menu' }).click();
    const menu = openMenu(page);
    await menu.getByRole('menuitem').first().click();
    await expect(menu).toBeHidden();
  });

  test('clicking outside closes the menu', async ({ page }) => {
    await page.getByRole('button', { name: 'Open Standard Menu' }).click();
    const menu = openMenu(page);
    await expect(menu).toBeVisible();
    await page.mouse.click(5, 5);
    await expect(menu).toBeHidden();
  });

  test('submenu opens with ArrowRight and closes with ArrowLeft', async ({ page }) => {
    await page.getByRole('button', { name: 'Menu with Groups' }).click();
    const subTrigger = page.getByRole('menuitem', { name: 'Recent Files' });
    await subTrigger.focus();
    await page.keyboard.press('ArrowRight');
    await expect(page.getByRole('menuitem', { name: 'document.tsx' })).toBeVisible();
    await page.keyboard.press('ArrowLeft');
    await expect(page.getByRole('menuitem', { name: 'document.tsx' })).toBeHidden();
    await expect(subTrigger).toBeFocused();
  });
});
