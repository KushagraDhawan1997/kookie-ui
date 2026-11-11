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

const strip = (t: string) => t.replace(/\/\*[\s\S]*?\*\//g, '');

/**
 * Every focus ring takes its thickness from `--focus-ring-width`, so changing that one token
 * changes them all. A solid outline with a width typed by hand, or one reading the older
 * `--focus-outline-width`, would stay behind.
 */
describe('focus ring width', () => {
  for (const file of files(COMPONENTS)) {
    it(path.relative(COMPONENTS, file), () => {
      const css = strip(fs.readFileSync(file, 'utf8'));
      expect(css.match(/outline(-width)?:\s*\d+px\s+solid[^;]*;/g) ?? []).toEqual([]);
      expect(css).not.toContain('--focus-outline-width');
    });
  }
});
