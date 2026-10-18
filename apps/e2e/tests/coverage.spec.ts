import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { expect, test } from '@playwright/test';

/**
 * The component index is built from the package exports. Every exported module either has a
 * page at /docs/<module> or is listed below, so a new export without a page fails here instead
 * of going unnoticed. When a page is written, its module comes off this list.
 */
const WITHOUT_PAGE = [
  'accessible-icon',
  'accordion',
  'alert-dialog',
  'aspect-ratio',
  'blockquote',
  'box',
  'checkbox',
  'checkbox-cards',
  'checkbox-group',
  'code',
  'container',
  'data-list',
  'dialog',
  'em',
  'flex',
  'grid',
  'hover-card',
  'icons',
  'inset',
  'kbd',
  'link',
  'message-scroller',
  'notice',
  'popover',
  'portal',
  'progress',
  'quote',
  'radio',
  'radio-cards',
  'radio-group',
  'reset',
  'scroll-area',
  'section',
  'select',
  'separator',
  'skeleton',
  'slider',
  'slot',
  'spinner',
  'strong',
  'switch',
  'tab-nav',
  'table',
  'tabs',
  'theme',
  'theme-panel',
  'tooltip',
  'user-card',
  'virtual-menu',
  'visually-hidden',
];

const ROOT = join(__dirname, '../../..');

function exportedModules(): string[] {
  const index = readFileSync(join(ROOT, 'packages/kookie-ui/src/components/index.tsx'), 'utf8');
  return [...new Set([...index.matchAll(/from '\.\/([a-z0-9-]+)\.js'/g)].map((m) => m[1]))];
}

function documentedPages(): Set<string> {
  const dir = join(ROOT, 'apps/docs/app/docs');
  return new Set(readdirSync(dir, { withFileTypes: true }).filter((e) => e.isDirectory()).map((e) => e.name));
}

test('every exported module has a page or is listed as without one', () => {
  const pages = documentedPages();
  const missing = exportedModules().filter((name) => !pages.has(name) && !WITHOUT_PAGE.includes(name));
  expect(missing, `Exports with no page at /docs/<name>: ${missing.join(', ')}`).toEqual([]);
});

test('the list of modules without a page is current', () => {
  const pages = documentedPages();
  const modules = new Set(exportedModules());
  const stale = WITHOUT_PAGE.filter((name) => pages.has(name) || !modules.has(name));
  expect(stale, `Remove from WITHOUT_PAGE (now documented or no longer exported): ${stale.join(', ')}`).toEqual([]);
});
