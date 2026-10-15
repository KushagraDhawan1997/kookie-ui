import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { getRoutes } from './helpers/routes';

for (const route of getRoutes()) {
  test(`axe ${route}`, async ({ page }) => {
    await page.goto(route, { waitUntil: 'networkidle' });
    const { violations } = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa']).analyze();
    const serious = violations
      .filter((v) => v.impact === 'serious' || v.impact === 'critical')
      .map((v) => `[${v.impact}] ${v.id}: ${v.help} (${v.nodes.length}) ${v.nodes[0]?.target.join(' ')}`);
    expect(serious, serious.join('\n')).toEqual([]);
  });
}
