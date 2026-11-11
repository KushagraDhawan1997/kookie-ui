import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

const PACKAGE = path.join(__dirname, '..');
const credits = fs.readFileSync(path.join(PACKAGE, 'CREDITS.md'), 'utf8');
const manifest = JSON.parse(fs.readFileSync(path.join(PACKAGE, 'package.json'), 'utf8'));

/** Credit travels with the code: the file ships, and it names everything the package runs on. */
describe('CREDITS.md', () => {
  it('ships in the package', () => {
    expect(manifest.files).toContain('CREDITS.md');
  });

  it('names every runtime dependency', () => {
    for (const name of Object.keys(manifest.dependencies)) expect(credits, name).toContain(name);
  });

  it('carries the notices for the borrowed icons', () => {
    expect(credits).toContain('Lucide Icons and Contributors');
    expect(credits).toContain('Cole Bemis');
    expect(credits).toContain('WorkOS');
  });

  // The Womp copy of this package has no docs site.
  const docsPage = path.join(PACKAGE, '../../apps/docs/app/credits/content.mdx');
  it.skipIf(!fs.existsSync(docsPage))('is the same text on the docs site', () => {
    const page = fs.readFileSync(docsPage, 'utf8');
    expect(page.replace(/^---[\s\S]*?---\n/, '')).toBe(credits.replace(/^# Credits\n/, ''));
  });

  it('is the same file at the repo root', () => {
    const root = path.join(PACKAGE, '../../CREDITS.md');
    expect(fs.readFileSync(root, 'utf8')).toBe(credits);
  });
});
