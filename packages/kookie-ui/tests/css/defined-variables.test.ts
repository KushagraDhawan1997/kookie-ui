import { describe, expect, it } from 'vitest';
import * as fs from 'fs';
import * as path from 'path';

/**
 * Every `var(--x)` with no fallback must name a property something defines: a stylesheet in src,
 * the Radix colour sheets, or a component that sets it inline. An undefined one makes the whole
 * declaration invalid at computed time, so the rule silently does nothing.
 */
const root = path.join(__dirname, '../..');
const walk = (dir: string, ext: RegExp): string[] =>
  fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name);
    return e.isDirectory() ? walk(p, ext) : ext.test(e.name) ? [p] : [];
  });
const strip = (s: string) => s.replace(/\/\*[\s\S]*?\*\//g, '');

const cssFiles = walk(path.join(root, 'src'), /\.css$/);
const defined = new Set<string>();
for (const f of [...cssFiles, ...walk(path.join(root, 'node_modules/@radix-ui/colors'), /\.css$/)]) {
  for (const m of strip(fs.readFileSync(f, 'utf8')).matchAll(/(--[\w-]+)\s*:/g)) defined.add(m[1]);
}
for (const f of walk(path.join(root, 'src'), /\.tsx?$/)) {
  for (const m of fs.readFileSync(f, 'utf8').matchAll(/['"`](--[\w-]+)/g)) defined.add(m[1]);
}

// Set at runtime: Radix publishes --radix-*, and responsive props write --<prop>-<breakpoint> from a template.
const runtime = (name: string) => name.startsWith('--radix-') || /-(xs|sm|md|lg|xl)$/.test(name);

// Undefined today in a file another change owns. Remove the entry when that file is fixed.
const pending = new Set<string>();

const undefinedUses = () => {
  const found: string[] = [];
  for (const f of cssFiles) {
    for (const m of strip(fs.readFileSync(f, 'utf8')).matchAll(/var\(\s*(--[\w-]+)\s*\)/g)) {
      const name = m[1];
      if (!defined.has(name) && !runtime(name)) found.push(`${name} in ${path.relative(root, f)}`);
    }
  }
  return [...new Set(found)];
};

describe('custom properties', () => {
  it('every var() without a fallback names a defined property', () => {
    expect(undefinedUses().filter((u) => !pending.has(u.split(' ')[0]))).toEqual([]);
  });

  it('the pending list holds only names that are still undefined', () => {
    const names = new Set(undefinedUses().map((u) => u.split(' ')[0]));
    for (const name of pending) expect(names.has(name), `${name} is defined now; drop it from pending`).toBe(true);
  });
});
