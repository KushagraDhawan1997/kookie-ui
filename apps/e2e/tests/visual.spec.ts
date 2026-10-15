import { expect, test } from '@playwright/test';
import { getRoutes } from './helpers/routes';

/** Component and block pages. Each renders its demos inside preview blocks. */
const routes = getRoutes().filter((r) => r.startsWith('/docs/') && r !== '/docs/blocks');

/** Freezes motion and the caret so screenshots are repeatable. */
const STABLE_CSS = `
  *, *::before, *::after { animation: none !important; transition: none !important; caret-color: transparent !important; }
`;

for (const colorScheme of ['light', 'dark'] as const) {
  test.describe(colorScheme, () => {
    test.use({ colorScheme, viewport: { width: 1280, height: 900 } });

    for (const route of routes) {
      test(`visual ${route}`, async ({ page }) => {
        await page.goto(route, { waitUntil: 'networkidle' });
        await page.addStyleTag({ content: STABLE_CSS });
        await page.evaluate(() => document.fonts.ready);

        const name = route.slice(1).replaceAll('/', '-');
        const stages = page.locator('.preview-block-stage');
        const count = await stages.count();

        // Pages without a preview block get a viewport shot instead.
        if (count === 0) {
          await expect(page).toHaveScreenshot(`${name}-page-${colorScheme}.png`);
          return;
        }

        for (let i = 0; i < count; i++) {
          const stage = stages.nth(i);
          await stage.scrollIntoViewIfNeeded();
          // Previews render light under a dark page, so switch them with their own toggle.
          const toggle = page.locator('.preview-block').nth(i).getByRole('radio', { name: `${colorScheme === 'dark' ? 'Dark' : 'Light'} preview` });
          if (await toggle.count()) await toggle.click();
          await expect(stage).toHaveScreenshot(`${name}-${i}-${colorScheme}.png`);
        }
      });
    }
  });
}
