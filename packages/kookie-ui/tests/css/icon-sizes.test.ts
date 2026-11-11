import { describe, it, expect } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

const COMPONENTS = path.join(__dirname, '../../src/components');

function files(dir: string, out: string[] = []) {
  for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
    const full = path.join(dir, e.name);
    if (e.isDirectory()) files(full, out);
    else if (e.name.endsWith('.css')) out.push(full);
  }
  return out;
}

/**
 * One icon ladder: `--icon-size-N` (16, 16, 20, 24). The older `--content-icon-size-N` gave
 * 13.2, 16.8 and 20.5px, which cannot sit on whole pixels. It stays as an alias for apps, and no
 * component reads it.
 */
describe('icon sizes', () => {
  for (const file of files(COMPONENTS)) {
    it(path.relative(COMPONENTS, file), () => {
      expect(fs.readFileSync(file, 'utf8')).not.toContain('--content-icon-size');
    });
  }
});
